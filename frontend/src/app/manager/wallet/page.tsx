"use client";

import { useEffect, useState } from "react";
import { getAuthHeaders } from "@/lib/auth";
import { DollarSign, ArrowDownToLine, Receipt, Clock } from "lucide-react";
import { ViewPayrollDetailsDialog } from "@/components/ViewPayrollDetailsDialog";

interface Commission {
  id: string;
  amount: number;
  description: string;
  status: string;
  createdAt: string;
  payment?: any;
}

interface Payroll {
  id: string;
  totalAmount: number;
  date: string;
  commissions?: any[];
}

export default function ManagerWalletPage() {
  const [summary, setSummary] = useState({ pendingAmount: 0, paidAmount: 0 });
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const [sumRes, comRes, payRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}"}/commissions/summary`, { headers: getAuthHeaders() }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}"}/commissions/my-commissions`, { headers: getAuthHeaders() }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}"}/commissions/my-payrolls`, { headers: getAuthHeaders() })
        ]);

        if (sumRes.ok) setSummary(await sumRes.json());
        if (comRes.ok) setCommissions(await comRes.json());
        if (payRes.ok) setPayrolls(await payRes.json());
      } catch (error) {
        console.error("Error fetching wallet data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWalletData();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Mi Billetera</h1>
        <p className="text-slate-500 text-lg">Resumen de tus comisiones generadas y pagos de nómina recibidos.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* KPI Pendiente */}
        <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Clock className="w-24 h-24 text-blue-600" />
          </div>
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">Saldo Pendiente de Cobro</p>
          <h3 className="text-5xl font-extrabold text-blue-900">{summary.pendingAmount < 0 ? "-" : ""}${Math.abs(summary.pendingAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
          <p className="text-sm text-slate-500 mt-2">Comisiones generadas esperando cierre de nómina.</p>
        </div>

        {/* KPI Pagado */}
        <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ArrowDownToLine className="w-24 h-24 text-emerald-600" />
          </div>
          <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-2">Ingresos Históricos Pagados</p>
          <h3 className="text-5xl font-extrabold text-emerald-900">{summary.paidAmount < 0 ? "-" : ""}${Math.abs(summary.paidAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
          <p className="text-sm text-emerald-700 mt-2">Total depositado a lo largo del tiempo.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Historial de Comisiones */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-hidden">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
            <DollarSign className="w-5 h-5 text-yellow-500"/>
            <h2 className="text-lg font-bold text-slate-800">Cargos Generados Recientes</h2>
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {commissions.length === 0 ? (
              <p className="text-slate-500 text-center py-8">Aún no hay comisiones generadas.</p>
            ) : (
              commissions.map((c) => (
                <div key={c.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm whitespace-pre-wrap">{c.description}</p>
                    <p className="text-xs text-slate-500 mt-1">{new Date(c.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${c.amount < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {c.amount < 0 ? "-" : "+"} ${Math.abs(c.amount).toFixed(2)}
                    </p>
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${c.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {c.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Historial de Nóminas Retiradas */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-hidden">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
            <Receipt className="w-5 h-5 text-indigo-500"/>
            <h2 className="text-lg font-bold text-slate-800">Historial de Recibos de Nómina</h2>
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {payrolls.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No tienes recibos de nómina liquidados aún.</p>
            ) : (
              payrolls.map((p) => (
                <div key={p.id} className="flex justify-between items-center p-4 bg-indigo-50/50 rounded-lg border border-indigo-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                      <ArrowDownToLine className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">Depósito Autorizado</p>
                      <p className="text-xs text-slate-500">{new Date(p.date).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <p className="font-bold text-slate-900 text-lg">{p.totalAmount < 0 ? "-" : ""}${Math.abs(p.totalAmount).toFixed(2)}</p>
                    <ViewPayrollDetailsDialog 
                      commissions={p.commissions || []}
                      totalAmount={p.totalAmount}
                      date={p.date}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
