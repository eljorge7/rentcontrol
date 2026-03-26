"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Receipt, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddManualCommissionDialog } from "@/components/AddManualCommissionDialog";
import { AddEventTypeDialog } from "@/components/AddEventTypeDialog";
import { ViewPayrollDetailsDialog } from "@/components/ViewPayrollDetailsDialog";

interface PendingBalance {
  managerId: string;
  managerName: string;
  managerEmail: string;
  totalPendingAmount: number;
  pendingCommissionsCount: number;
}

interface Payroll {
  id: string;
  totalAmount: number;
  date: string;
  manager: { name: string; email: string };
  _count: { commissions: number };
  commissions?: any[];
}

export default function AdminPayrollPage() {
  const [balances, setBalances] = useState<PendingBalance[]>([]);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [balRes, payRes] = await Promise.all([
        api.get("/commissions/pending-balances"),
        api.get("/commissions/payrolls")
      ]);

      setBalances(balRes.data);
      setPayrolls(payRes.data);
    } catch (error) {
      console.error("Error fetching payroll data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePayout = async (managerId: string) => {
    if (!confirm('¿Estás seguro de que deseas liquidar este saldo? Al procesarlo, entenderemos que ya depositaste el dinero al Gestor en su cuenta bancaria.')) return;
    
    setIsProcessing(managerId);
    try {
      await api.post("/commissions/payout", { managerId });
      alert("Nómina procesada con éxito.");
      fetchData();
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.response?.data?.message || "Error de red al procesar la nómina.";
      alert(`Error: ${errorMsg}`);
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Nóminas y Comisiones</h1>
          <p className="text-slate-500 text-lg">Autoriza y liquida las comisiones generadas por tu equipo de Gestores.</p>
        </div>
        <div className="flex items-center gap-3">
          <AddEventTypeDialog />
          <AddManualCommissionDialog onCommissionAdded={fetchData} />
          <Button onClick={fetchData} variant="outline" className="flex items-center">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-bold text-slate-800">Saldos Pendientes por Liquidar</h2>
        </div>
        {isLoading ? (
          <div className="p-8 flex justify-center"><RefreshCw className="w-8 h-8 animate-spin text-slate-300" /></div>
        ) : balances.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <CheckCircle className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
            <p className="text-lg font-medium">Todos los gestores están al día.</p>
            <p className="text-sm">No hay comisiones pendientes de pago.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {balances.map(b => (
              <div key={b.managerId} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{b.managerName}</h3>
                  <p className="text-sm text-slate-500">{b.managerEmail}</p>
                  <p className="text-xs text-amber-600 mt-1 font-medium bg-amber-50 inline-block px-2 py-1 rounded">
                    {b.pendingCommissionsCount} comisiones pendientes
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-slate-500 uppercase tracking-wide">Total a Pagar</p>
                    <p className="text-3xl font-black text-slate-900">${b.totalPendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <Button 
                    onClick={() => handlePayout(b.managerId)}
                    disabled={isProcessing === b.managerId}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white h-12 px-6 shadow-md"
                  >
                    {isProcessing === b.managerId ? (
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      'Procesar Nómina'
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
          <Receipt className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-bold text-slate-800">Historial de Recibos Pagados</h2>
        </div>
        {isLoading ? (
          <div className="p-8 flex justify-center"><RefreshCw className="w-8 h-8 animate-spin text-slate-300" /></div>
        ) : payrolls.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Aún no hay recibos procesados históricamente.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                <tr>
                  <th className="px-6 py-4">Fecha de Liquidación</th>
                  <th className="px-6 py-4">Gestor Operativo</th>
                  <th className="px-6 py-4">Comisiones Incluidas</th>
                  <th className="px-6 py-4 text-right">Total Pagado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payrolls.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {new Date(p.date).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {p.manager.name}
                    </td>
                    <td className="px-6 py-4 flex items-center justify-between">
                      {p._count.commissions} registros
                      <ViewPayrollDetailsDialog 
                        commissions={p.commissions || []} 
                        managerName={p.manager.name}
                        totalAmount={p.totalAmount}
                        date={p.date}
                      />
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-600">
                      ${p.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
