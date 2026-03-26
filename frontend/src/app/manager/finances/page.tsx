"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import api from "@/lib/api";
import { Wallet, TrendingUp, ArrowDownRight, ArrowUpRight, DollarSign, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";

export default function FinancesDashboard() {
  const { user } = useAuth();
  
  const [payments, setPayments] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // By default select current month in YYYY-MM format
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      setIsLoading(true);
      const [paymentsRes, expensesRes] = await Promise.all([
        api.get("/payments"),
        api.get("/expenses")
      ]);
      setPayments(paymentsRes.data);
      setExpenses(expensesRes.data);
    } catch (error) {
      console.error("Error fetching financial data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Extract unique YYYY-MM periods from all data
  const periods = new Set<string>();
  const currentPeriod = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  periods.add(currentPeriod); // Always ensure current month exists in dropdown

  payments.forEach(p => periods.add(p.date.substring(0, 7)));
  expenses.forEach(e => periods.add(e.date.substring(0, 7)));
  
  const availableMonths = Array.from(periods).sort().reverse(); // Newest first

  // 1. Calculate Monthly KPIs based on selected filter
  const filteredPayments = payments.filter(p => p.date.startsWith(selectedMonth));
  const filteredExpenses = expenses.filter(e => e.date.startsWith(selectedMonth));

  const totalIncome = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  // 2. Group Global Data by Month for Charts (Historical context)
  const monthlyDataMap: Record<string, { name: string; Ingresos: number; Gastos: number; Utilidad: number }> = {};

  // Process Payments (Income)
  payments.forEach(p => {
    const d = new Date(p.date);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthName = d.toLocaleString('es-ES', { month: 'short', year: 'numeric' });
    
    if (!monthlyDataMap[monthKey]) {
      monthlyDataMap[monthKey] = { name: monthName, Ingresos: 0, Gastos: 0, Utilidad: 0 };
    }
    monthlyDataMap[monthKey].Ingresos += p.amount;
  });

  // Process Expenses (Outgoings)
  expenses.forEach(e => {
    const d = new Date(e.date);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthName = d.toLocaleString('es-ES', { month: 'short', year: 'numeric' });
    
    if (!monthlyDataMap[monthKey]) {
      monthlyDataMap[monthKey] = { name: monthName, Ingresos: 0, Gastos: 0, Utilidad: 0 };
    }
    monthlyDataMap[monthKey].Gastos += e.amount;
  });

  // Calculate Profit per month and sort chronologically
  const chartData = Object.keys(monthlyDataMap)
    .sort() // simple string sort works for YYYY-MM
    .map(key => {
      const data = monthlyDataMap[key];
      data.Utilidad = data.Ingresos - data.Gastos;
      return data;
    });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard Financiero</h1>
          <p className="text-slate-500 mt-1">Análisis de rentabilidad, ingresos y gastos operativos.</p>
        </div>
        <div className="bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-500">Periodo:</span>
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-sm font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer"
          >
            {availableMonths.map(m => {
              const [year, month] = m.split('-');
              const dateObj = new Date(parseInt(year), parseInt(month) - 1, 1);
              const label = dateObj.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
              return (
                <option key={m} value={m} className="capitalize">{label}</option>
              );
            })}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full group-hover:scale-110 transition-transform"></div>
          <div className="relative">
            <h3 className="text-sm font-semibold text-slate-500 flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-emerald-500" /> Ingresos Totales
            </h3>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              ${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-50 rounded-full group-hover:scale-110 transition-transform"></div>
          <div className="relative">
            <h3 className="text-sm font-semibold text-slate-500 flex items-center gap-2">
              <ArrowDownRight className="h-4 w-4 text-red-500" /> Gastos Operativos
            </h3>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              ${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full group-hover:scale-110 transition-transform"></div>
          <div className="relative">
            <h3 className="text-sm font-semibold text-slate-500 flex items-center gap-2">
              <Wallet className="h-4 w-4 text-indigo-500" /> Utilidad Neta
            </h3>
            <p className={`text-3xl font-bold mt-2 ${netProfit >= 0 ? "text-indigo-600" : "text-red-600"}`}>
              {netProfit < 0 ? "-" : ""}${Math.abs(netProfit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Activity className="h-5 w-5 text-slate-400" />
              Flujo de Caja Mensual
            </h3>
          </div>
          
          {chartData.length > 0 ? (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} tickFormatter={(val) => `$${val}`} />
                  <Tooltip 
                    cursor={{fill: '#F8FAFC'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="Ingresos" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  <Bar dataKey="Gastos" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex flex-col items-center justify-center text-slate-400">
              <TrendingUp className="h-12 w-12 mb-3 text-slate-200" />
              <p>No hay datos financieros para graficar.</p>
            </div>
          )}
        </div>

        {/* Side Panel: Recent Expenses */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-900">Últimos Gastos</h3>
          </div>
          <div className="p-5 flex-1 overflow-auto">
            {filteredExpenses.length > 0 ? (
              <div className="space-y-4">
                {filteredExpenses.slice(0, 5).map(exp => (
                  <div key={exp.id} className="flex items-center justify-between">
                    <div className="flex gap-3 items-center">
                      <div className="bg-red-50 p-2 rounded-lg text-red-500">
                        <ArrowDownRight className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 truncate max-w-[120px]">{exp.description || exp.category}</p>
                        <p className="text-xs text-slate-500">{new Date(exp.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-slate-900">
                      -${Math.abs(exp.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center mt-10">No hay gastos recientes.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
