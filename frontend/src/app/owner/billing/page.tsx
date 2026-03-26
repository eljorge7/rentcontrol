"use client";

import { useEffect, useState } from "react";
import { getAuthHeaders } from "@/lib/auth";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Receipt, TrendingUp, TrendingDown, Plus, CreditCard } from "lucide-react";

interface BillingData {
  properties: { id: string; name: string }[];
  incomes: {
    id: string;
    date: string;
    amount: number;
    method: string;
    property: string;
    unit: string;
    tenant: string;
    description: string;
  }[];
  expenses: {
    id: string;
    date: string;
    amount: number;
    category: string;
    description: string;
    property: string;
  }[];
}

export default function OwnerBillingPage() {
  const { user } = useAuth();
  const [data, setData] = useState<BillingData | null>(null);
  const [activeTab, setActiveTab] = useState<'INCOMES'|'EXPENSES'>('INCOMES');
  
  // Add Expense Form State
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    amount: "", category: "MAINTENANCE", description: "", propertyId: ""
  });

  const fetchData = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/dashboard/owner/${user.id}/billing`, {
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Error fetching billing:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleSubmitExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.propertyId) {
      alert("Debes seleccionar una propiedad a la cual asignarle este gasto.");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}"}/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          amount: parseFloat(expenseForm.amount),
          category: expenseForm.category,
          description: expenseForm.description,
          propertyId: expenseForm.propertyId
        })
      });

      if (res.ok) {
        setShowAddExpense(false);
        setExpenseForm({ amount: "", category: "MAINTENANCE", description: "", propertyId: "" });
        fetchData();
      } else {
        alert("Error al registrar gasto.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!data) return <div className="p-8 text-center text-slate-500 py-20">Cargando bitácora financiera...</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Receipt className="h-6 w-6 text-emerald-600" />
            Pagos y Cobros
          </h2>
          <p className="text-slate-500">Bitácora contable combinada de rentas cobradas y gastos de tus propiedades.</p>
        </div>

        <button 
          onClick={() => setShowAddExpense(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 flex justify-center items-center gap-2 rounded-lg font-medium shadow-sm transition-colors text-sm"
        >
          <Plus className="h-4 w-4" />
          Registrar un Gasto
        </button>
      </div>

      {showAddExpense && (
        <Card className="border-indigo-100 shadow-md">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold mb-4 text-slate-900 border-b pb-2">Registrar Nuevo Gasto</h3>
            <form onSubmit={handleSubmitExpense} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end mt-4">
               <div className="lg:col-span-1">
                 <label className="block text-xs font-medium text-slate-600 mb-1">Inmueble Vinculado *</label>
                 <select required className="w-full border-slate-200 rounded-lg text-sm bg-slate-50"
                   value={expenseForm.propertyId} onChange={e => setExpenseForm({...expenseForm, propertyId: e.target.value})}
                 >
                   <option value="">-- Seleccionar --</option>
                   {data.properties.map(p => (
                     <option key={p.id} value={p.id}>{p.name}</option>
                   ))}
                 </select>
               </div>
               <div className="lg:col-span-1">
                 <label className="block text-xs font-medium text-slate-600 mb-1">Monto ($) *</label>
                 <input type="number" required min="1" step="0.01" className="w-full border-slate-200 rounded-lg text-sm bg-slate-50"
                   value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})}
                 />
               </div>
               <div className="lg:col-span-1">
                 <label className="block text-xs font-medium text-slate-600 mb-1">Categoría *</label>
                 <select required className="w-full border-slate-200 rounded-lg text-sm bg-slate-50"
                   value={expenseForm.category} onChange={e => setExpenseForm({...expenseForm, category: e.target.value})}
                 >
                   <option value="MAINTENANCE">Mantenimiento general</option>
                   <option value="TAXES">Impuestos (Predial)</option>
                   <option value="UTILITIES">Servicios (Agua/Luz)</option>
                   <option value="INSURANCE">Seguro Comercial</option>
                   <option value="OTHER">Otro</option>
                 </select>
               </div>
               <div className="lg:col-span-1 relative">
                 <label className="block text-xs font-medium text-slate-600 mb-1">Concepto Detallado</label>
                 <input type="text" placeholder="Ej. Pago predial anual..." className="w-full border-slate-200 rounded-lg text-sm bg-slate-50"
                   value={expenseForm.description} onChange={e => setExpenseForm({...expenseForm, description: e.target.value})}
                 />
               </div>
               <div className="lg:col-span-1 flex gap-2">
                 <button type="button" onClick={() => setShowAddExpense(false)} className="w-full bg-slate-100 text-slate-700 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">Cancelar</button>
                 <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-colors">Guardar</button>
               </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* TABS CONTROLLER */}
      <div className="flex space-x-1 bg-slate-100 p-1.5 rounded-xl shadow-inner">
        <button
          onClick={() => setActiveTab('INCOMES')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-lg transition-all ${
            activeTab === 'INCOMES' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'
          }`}
        >
          <TrendingUp className={`h-5 w-5 ${activeTab === 'INCOMES' ? 'text-emerald-500' : 'text-slate-400'}`} />
          Cobros Recibidos (Entradas)
        </button>
        <button
          onClick={() => setActiveTab('EXPENSES')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-lg transition-all ${
            activeTab === 'EXPENSES' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'
          }`}
        >
          <TrendingDown className={`h-5 w-5 ${activeTab === 'EXPENSES' ? 'text-rose-500' : 'text-slate-400'}`} />
          Gastos / Inversiones (Salidas)
        </button>
      </div>

      {/* INCOMES LIST */}
      {activeTab === 'INCOMES' && (
        <Card className="shadow-sm overflow-hidden border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4">Fecha de Cobro</th>
                  <th className="px-6 py-4">Inquilino / Concepto</th>
                  <th className="px-6 py-4">Local Vinculado</th>
                  <th className="px-6 py-4 text-right">Monto Confirmado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.incomes.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500 bg-slate-50">Tu Gestor no ha registrado cobros confirmados aún.</td></tr>
                ) : (
                  data.incomes.map(inc => (
                    <tr key={inc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                        {new Date(inc.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{inc.tenant}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1"><CreditCard className="h-3 w-3 text-emerald-600"/> {inc.method} - {inc.description}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-700">{inc.property}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{inc.unit}</p>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-emerald-600 whitespace-nowrap text-base">
                        + ${inc.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* EXPENSES LIST */}
      {activeTab === 'EXPENSES' && (
        <Card className="shadow-sm overflow-hidden border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4">Fecha del Gasto</th>
                  <th className="px-6 py-4">Concepto Detallado</th>
                  <th className="px-6 py-4">Inmueble Afectado</th>
                  <th className="px-6 py-4 text-right">Costo Operativo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.expenses.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500 bg-slate-50">No hay salida de gastos operativos.</td></tr>
                ) : (
                  data.expenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                        {new Date(exp.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{exp.description || 'Sin concepto'}</p>
                        <p className="text-[10px] text-slate-600 mt-1 bg-slate-200 inline-block px-2 py-0.5 rounded uppercase font-bold tracking-wider">{exp.category}</p>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-700">
                        {exp.property}
                      </td>
                      <td className="px-6 py-4 text-right font-black text-rose-600 whitespace-nowrap text-base">
                        - ${exp.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
