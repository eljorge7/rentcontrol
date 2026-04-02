"use client";

import { useEffect, useState } from "react";
import { getAuthHeaders } from "@/lib/auth";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Building2, TrendingUp, Wallet, UserCircle2, AlertTriangle, Activity, ShieldCheck, PieChart, DollarSign, FileText
} from "lucide-react";
import { OwnerManagerChat } from "@/components/OwnerManagerChat";
import { StatCard } from "@/components/dashboard/StatCard";
import { SimpleBarChart } from "@/components/dashboard/SimpleBarChart";
import { SimplePieChart } from "@/components/dashboard/SimplePieChart";
import { CollectionFunnel } from "@/components/dashboard/CollectionFunnel";
import api from "@/lib/api";

interface DashboardStats {
  financials: {
    collectedRevenue: number;
    netIncome: number;
    expenses: number;
    uncollectedDebt: number;
    prevCollectedRevenue?: number;
    prevNetIncome?: number;
  };
  operations: {
    totalUnits: number;
    occupiedUnits: number;
    vacancyRate: number;
    openIncidents: number;
  };
  manager: {
    id: string;
    name: string;
    email: string;
  } | null;
  managementPlan: {
    name: string;
    commissionPct: number;
    maxProperties: number;
    fixedFee: number;
  } | null;
  chartData: {
    name: string;
    income: number;
    expenses: number;
  }[];
  propertiesData: {
    id: string;
    name: string;
    revenue: number;
    netProfit: number;
  }[];
}

interface OwnerMetrics {
  totalProperties: number;
  totalUnits: number;
  activeUnitsCount: number;
  occupancyRate: number;
  expectedMRR: number;
  monthlyRevenue: number;
}

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [metrics, setMetrics] = useState<OwnerMetrics | null>(null);

  const [dateRange, setDateRange] = useState<string>("this_month");

  useEffect(() => {
    if (user?.id) {
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
      fetchData(user.id, startDate, endDate);
    }
  }, [user, dateRange]);

  const fetchData = async (ownerId: string, startDate?: string, endDate?: string) => {
    try {
      const queryStr = startDate ? `?startDate=${startDate}&endDate=${endDate}` : "";
      const [dashRes, metricsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/dashboard/owner/${ownerId}${queryStr}`, { headers: getAuthHeaders() }),
        api.get(`/metrics/owner${queryStr}`)
      ]);
      const data = await dashRes.json();
      setStats(data);
      setMetrics(metricsRes.data);
    } catch (error) {
      console.error("Error fetching owner dashboard:", error);
    }
  };

  if (!stats || !metrics) return <div className="p-8 text-center text-slate-500 flex justify-center py-20">Cargando métricas de tu inversión...</div>;

  const { financials, operations, manager, managementPlan, chartData, propertiesData } = stats;

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

  const exportToCSV = () => {
    if (!stats) return;
    const rows = [
      ["Propiedad", "Ingresos Periodo", "Utilidad Neta Periodo"],
      ...stats.propertiesData.map(p => [p.name, p.revenue, p.netProfit])
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rendimiento_Cartera_${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Resumen de Inversión</h2>
          <p className="text-slate-500">Transparencia y control operativo de tus propiedades delegadas.</p>
        </div>
        
        <div className="flex items-center gap-4">
           {/* Date Picker */}
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
           {/* Export Button */}
           <button onClick={exportToCSV} className="bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 px-4 rounded-xl shadow-sm transition-colors flex items-center gap-2 text-sm">
             <FileText className="h-4 w-4" /> Exportar CSV
           </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="MRR (Retorno Esperado Mes)"
          value={`$${metrics.expectedMRR.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          icon={<DollarSign size={20} className="text-emerald-600" />}
          subtitle={`${metrics.totalProperties} Propiedades`}
        />
        <StatCard
          title="Utilidad Neta General"
          value={`$${financials.netIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          icon={<TrendingUp size={20} className="text-indigo-600" />}
          trend={calcGrowth(financials.netIncome, financials.prevNetIncome)}
          sparklineData={[{val: financials.prevNetIncome || 0}, {val: financials.netIncome}]}
        />
        <StatCard
          title="Cartera Vencida (Deuda)"
          value={`$${financials.uncollectedDebt.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          icon={<Wallet size={20} className="text-rose-600" />}
          subtitle="Rentabilidad pendiente"
          trend={{ value: "monto inactivo", isPositive: false }}
        />
        <StatCard
          title="Tasa de Desocupación"
          value={`${operations.vacancyRate.toFixed(1)}%`}
          icon={<Building2 size={20} className="text-amber-500" />}
          subtitle={`${operations.totalUnits - operations.occupiedUnits} de ${operations.totalUnits} vacíos`}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3 mt-8">
        {/* CHART */}
        <Card className="md:col-span-2 border-0 shadow-xl bg-white/70 backdrop-blur-xl dark:bg-slate-900/80 rounded-[2rem] overflow-hidden group">
          <CardHeader className="border-b border-slate-100/50 pb-6">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-bold text-slate-900">Rendimiento Histórico (6 Meses)</CardTitle>
                <p className="text-sm font-medium text-slate-500 mt-1">Evolución de ingresos netos e inversión en mantenimiento</p>
              </div>
              <div className="bg-emerald-50 p-3 rounded-2xl">
                <Activity className="text-emerald-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <SimpleBarChart 
              data={chartData} 
              xAxisKey="name" 
              bars={[
                { dataKey: "income", color: "#10B981", name: "Ingreso Total" }, // Emerald-500
                { dataKey: "expenses", color: "#F43F5E", name: "Gastos / Mto" } // Rose-500
              ]} 
              height={320}
            />
          </CardContent>
        </Card>

        {/* SIDE PANELS */}
        <div className="space-y-6">
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl dark:bg-slate-900/80 rounded-3xl overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-slate-700">
                <PieChart className="h-5 w-5 text-indigo-500" />
                Ocupación de la Cartera
              </CardTitle>
            </CardHeader>
            <CardContent>
               <SimplePieChart 
                  data={[
                    { name: 'Ocupados', value: metrics.activeUnitsCount, color: '#10B981' },
                    { name: 'Vacantes', value: metrics.totalUnits - metrics.activeUnitsCount, color: '#FCD34D' }
                  ]}
                  height={220}
               />
               <p className="text-center text-xs text-slate-500 mt-2 font-medium">{metrics.activeUnitsCount} Rentados vs {metrics.totalUnits - metrics.activeUnitsCount} Libres</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-slate-50/70 backdrop-blur-xl dark:bg-slate-800/80 rounded-3xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-100/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserCircle2 className="h-5 w-5 text-blue-600" />
                Gestor Asignado
              </CardTitle>
            </CardHeader>
            <CardContent>
              {manager ? (
                <div>
                  <p className="font-semibold text-slate-900">{manager.name}</p>
                  <p className="text-sm text-slate-500">{manager.email}</p>
                  <div className="mt-2 text-xs bg-blue-100 text-blue-800 px-3 py-1.5 rounded-lg inline-block font-medium">
                    Servicio de Gestión Activo
                  </div>
                  {user?.id ? (
                    <OwnerManagerChat 
                      ownerId={user.id} 
                      ownerName={user.name || "Propietario"} 
                      managerId={manager.id} 
                      managerName={manager.name} 
                    />
                  ) : null}
                </div>
              ) : (
                <div>
                  <p className="text-sm text-slate-600">Actualmente estás autogestionando tus propiedades.</p>
                  <div className="mt-4 text-xs bg-slate-200 text-slate-700 px-3 py-2 rounded-lg inline-block font-medium">
                    Plan Mixto / Autónomo
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl dark:bg-slate-900/80 rounded-3xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-100/50">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className={`h-5 w-5 ${operations.openIncidents > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
                Tickets Críticos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-bold ${operations.openIncidents > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {operations.openIncidents}
                </span>
                <span className="text-sm text-slate-500">reportes abiertos</span>
              </div>
              {operations.openIncidents > 0 ? (
                <p className="text-xs text-amber-600 mt-2 font-medium">El Gestor debe darles seguimiento pronto.</p>
              ) : (
                <p className="text-xs text-emerald-600 mt-2 font-medium">Todo opera con normalidad.</p>
              )}
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/20 dark:to-slate-900/80 rounded-3xl overflow-hidden">
            <CardHeader className="pb-3 text-center border-b border-amber-100/50">
              <CardTitle className="text-lg flex items-center justify-center gap-2 text-amber-900">
                <Wallet className="h-5 w-5 text-amber-600" />
                Salud de Cobranza
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CollectionFunnel collected={financials.collectedRevenue} pending={financials.uncollectedDebt} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* PROPERTIES TABLE */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Desglose de Propiedades</CardTitle>
        </CardHeader>
        <CardContent>
          {propertiesData.length === 0 ? (
            <p className="text-sm text-slate-500">No hay propiedades registradas aún.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
                  <tr>
                    <th className="px-4 py-3 font-medium">Propiedad</th>
                    <th className="px-4 py-3 font-medium text-right">Ingresos (Mes)</th>
                    <th className="px-4 py-3 font-medium text-right">Utilidad Neta</th>
                  </tr>
                </thead>
                <tbody>
                  {propertiesData.map(p => (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-900">{p.name}</td>
                      <td className="px-4 py-3 text-right text-emerald-600 font-medium">
                        ${p.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`px-4 py-3 text-right font-bold ${p.netProfit >= 0 ? 'text-slate-900' : 'text-red-500'}`}>
                        ${p.netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </CardContent>
        </Card>

        {/* ACTIVE PLAN INFO (If SaaS / Managed) */}
        {managementPlan && (
          <Card className="shadow-sm border-blue-100 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-blue-900">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                Tu Plan Activo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{managementPlan.name}</h3>
                  <p className="text-sm text-slate-500">Plan de gestión delegado</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm border-b border-blue-100 pb-1">
                    <span className="text-slate-600 text-xs font-semibold uppercase tracking-wider">Costo Fijo Mensual</span>
                    <span className="font-bold text-slate-900">${managementPlan.fixedFee.toLocaleString()} MXN</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-blue-100 pb-1">
                    <span className="text-slate-600 text-xs font-semibold uppercase tracking-wider">Comisión por Cobros</span>
                    <span className="font-bold text-emerald-600">{managementPlan.commissionPct}%</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 text-xs font-semibold uppercase tracking-wider">Límite de Propiedades</span>
                    <span className="font-bold text-slate-900">{managementPlan.maxProperties}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
