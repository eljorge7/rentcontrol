"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Building2, Users, FileText, DollarSign, TrendingUp, 
  Wallet, Briefcase, Server, WifiOff, AlertTriangle, AlertCircle, Activity, Globe
} from "lucide-react";
import api from "@/lib/api";
import { StatCard } from "@/components/dashboard/StatCard";
import { SimpleBarChart } from "@/components/dashboard/SimpleBarChart";

interface DashboardStats {
  financials: {
    collectedRevenue: number;
    netIncome: number;
    expenses: number;
    uncollectedDebt: number;
    pendingPayroll: number;
    prevCollectedRevenue?: number;
    prevNetIncome?: number;
  };
  infrastructure: {
    onlineRouters: number;
    offlineRouters: number;
    activeServices: number;
    suspendedServices: number;
  };
  operations: {
    totalUnits: number;
    occupiedUnits: number;
    vacancyRate: number;
    openIncidents: number;
  };
  managers: {
    id: string;
    name: string;
    propertiesCount: number;
    earnedCommissions: number;
  }[];
  chartData: {
    name: string;
    income: number;
    expenses: number;
  }[];
}

interface AdminMetrics {
  totalProperties: number;
  totalTenants: number;
  totalUnits: number;
  activeUnits: number;
  occupancyRate: number;
  expectedMRR: number;
  currentUnpaidDebt: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [platformEarnings, setPlatformEarnings] = useState<number>(0);

  const [dateRange, setDateRange] = useState<string>("this_month");
  
  useEffect(() => {
    let startDate = "";
    let endDate = "";

    const today = new Date();
    if (dateRange === "this_month") {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
    } else if (dateRange === "last_month") {
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split('T')[0];
      endDate = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0];
    } else if (dateRange === "ytd") {
      startDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
      endDate = today.toISOString().split('T')[0];
    }

    const queryStr = startDate ? `?startDate=${startDate}&endDate=${endDate}` : "";

    Promise.all([
      api.get(`/dashboard${queryStr}`),
      api.get(`/metrics/admin${queryStr}`),
      api.get('/commissions/summary')
    ])
    .then(([dashRes, metricsRes, commRes]) => {
      setStats(dashRes.data);
      setMetrics(metricsRes.data);
      setPlatformEarnings(commRes.data.totalEarnings || 0);
    })
    .catch(console.error);
  }, [dateRange]);

  if (!stats || !metrics) {
    return <div className="p-8 text-center text-slate-500 flex justify-center items-center py-20">Cargando métricas ejecutivas...</div>;
  }

  const { financials, infrastructure, operations, managers, chartData } = stats;

  // Helper to calculate growth percentage
  const calcGrowth = (current: number, prev: number | undefined) => {
    if (!prev || prev === 0) return { value: "Sin histórico", isPositive: true, rawPct: 0 };
    const pct = ((current - prev) / prev) * 100;
    return { 
      value: "vs periodo ant.", 
      isPositive: pct >= 0,
      rawPct: Math.abs(pct)
    };
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
             <Building2 className="w-6 h-6 text-indigo-600" /> Dashboard Operativo (RentControl)
          </h2>
          <p className="text-slate-500">Centro de mando y salud financiera de tus propiedades e inquilinos.</p>
        </div>
        
        <div className="flex items-center gap-2">
           <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Periodo</label>
           <select 
             className="bg-white border border-slate-200 text-slate-700 font-medium py-2 px-4 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
             value={dateRange}
             onChange={e => setDateRange(e.target.value)}
           >
             <option value="this_month">Este Mes</option>
             <option value="last_month">Mes Pasado</option>
             <option value="ytd">Año a la fecha (YTD)</option>
           </select>
        </div>
      </div>
      
      {/* GLOBAL KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* KPI Cards con aspecto refinado */}
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-black rounded-2xl p-1 shadow-lg shadow-indigo-900/10">
          <StatCard
            title="Ingreso Bruto (Real)"
            value={`$${financials.collectedRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            icon={<Wallet size={20} className="text-emerald-400" />}
            trend={calcGrowth(financials.collectedRevenue, financials.prevCollectedRevenue)}
            sparklineData={[{val: 10}, {val: 25}, {val: 15}, {val: 45}, {val: 30}, {val: financials.collectedRevenue}]}
          />
        </div>
        <StatCard
          title="MRR Inmobiliario"
          value={`$${metrics.expectedMRR.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          icon={<Activity size={20} className="text-emerald-600" />}
          trend={calcGrowth(metrics.expectedMRR, financials.prevCollectedRevenue)}
          subtitle="Rentas Fijas Mensuales"
        />
        <StatCard
          title="Deuda Morosa"
          value={`$${financials.uncollectedDebt.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          icon={<AlertTriangle size={20} className="text-rose-600" />}
          subtitle="Rentas atrasadas"
          trend={{ value: "atención urgente", isPositive: false }}
        />
        <StatCard
          title="Nómina / Comisiones"
          value={`$${platformEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          icon={<Briefcase size={20} className="text-blue-600" />}
          subtitle="Margen de Administración (15%)"
          trend={{ value: "estable", isPositive: true, rawPct: 5.2 }}
        />
      </div>

      {/* DASHBOARD CHARTS */}
      <div className="grid gap-6 md:grid-cols-3 mt-8">
        <Card className="md:col-span-2 border-0 shadow-xl bg-white/70 backdrop-blur-xl dark:bg-slate-900/80 rounded-[2rem] overflow-hidden group">
          <CardHeader className="border-b border-slate-100/50 pb-6">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-bold text-slate-900">Histórico de Flujo de Cajas</CardTitle>
                <p className="text-sm font-medium text-slate-500 mt-1">Ingresos de rentas vs Gastos de mantenimiento</p>
              </div>
              <div className="bg-indigo-50 p-3 rounded-2xl border border-indigo-100 shadow-sm">
                <TrendingUp className="text-indigo-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <SimpleBarChart 
              data={chartData} 
              xAxisKey="name" 
              bars={[
                { dataKey: 'income', color: '#6366f1', name: 'Ingresos Brutos' }, // Indigo-500
                { dataKey: 'expenses', color: '#f43f5e', name: 'Gastos Operativos' } // Rose-500
              ]}
              height={320}
            />
          </CardContent>
        </Card>

        {/* METRICS & LEADERBOARD BLOCK */}
        <div className="space-y-6">
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl dark:bg-slate-900/80 rounded-[2rem] overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-100/50">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Globe className="text-indigo-500" size={18} /> 
                Salud de Infraestructura
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              <div className="flex justify-between items-center bg-slate-50 rounded-2xl p-4 transition-colors hover:bg-slate-100">
                <span className="text-sm font-bold text-slate-600">Ocupación Física</span>
                <span className="text-lg font-black text-slate-900">{operations.occupiedUnits} / {operations.totalUnits} <span className="text-xs text-indigo-500 font-bold bg-indigo-50 px-2 py-1 rounded ml-2">{operations.vacancyRate}% Vacío</span></span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 rounded-2xl p-4 transition-colors hover:bg-slate-100">
                <span className="text-sm font-bold text-slate-600">Servicios Activos (WispHub)</span>
                <span className="text-lg font-black text-slate-900">{infrastructure.activeServices}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 rounded-2xl p-4 transition-colors hover:bg-slate-100 border-l-4 border-rose-500">
                <span className="text-sm font-bold text-rose-600">Routers Caídos</span>
                <span className="text-lg font-black text-rose-600">{infrastructure.offlineRouters}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl dark:bg-slate-900/80 rounded-[2rem] overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-100/50 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-900">
                <Users className="text-indigo-500" size={18} /> 
                Top Gestores
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {managers.length === 0 ? (
                <div className="text-center py-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-sm text-slate-500 font-medium">No hay gestores activos</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {managers.map((manager, idx) => (
                    <div key={manager.id} className="group flex items-center justify-between p-3 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100 hover:shadow-md cursor-pointer cursor-default">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold text-sm shadow-sm
                          ${idx === 0 ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                            idx === 1 ? 'bg-slate-200 text-slate-700 border border-slate-300' :
                            idx === 2 ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                            'bg-indigo-50 border border-indigo-100 text-indigo-700'}`}>
                          #{idx + 1}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{manager.name}</p>
                          <p className="text-xs text-slate-500 font-medium">{manager.propertiesCount} Propiedades delegadas</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-emerald-600">
                          ${manager.earnedCommissions.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider mt-0.5">Comisiones</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
