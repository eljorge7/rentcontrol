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

  useEffect(() => {
    // Parallel fetching of existing dashboard and our new metrics endpoint
    Promise.all([
      api.get('/dashboard'),
      api.get('/metrics/admin'),
      api.get('/commissions/summary')
    ])
    .then(([dashRes, metricsRes, commRes]) => {
      setStats(dashRes.data);
      setMetrics(metricsRes.data);
      setPlatformEarnings(commRes.data.totalEarnings || 0);
    })
    .catch(console.error);
  }, []);

  if (!stats || !metrics) {
    return <div className="p-8 text-center text-slate-500 flex justify-center items-center py-20">Cargando métricas ejecutivas...</div>;
  }

  const { financials, infrastructure, operations, managers, chartData } = stats;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Executive Dashboard</h2>
        <p className="text-slate-500">Centro de mando y salud general del negocio consolidado.</p>
      </div>
      
      {/* GLOBAL KPIs */}
      <div className="grid gap-4 md:grid-cols-5">
        <StatCard
          title="Ganancia del Sistema (15%)"
          value={`$${platformEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          icon={<Briefcase size={20} className="text-blue-600" />}
          subtitle="Tus ingresos por SaaS/Hardware"
        />
        <StatCard
          title="MRR (Ingreso Esperado)"
          value={`$${metrics.expectedMRR.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          icon={<DollarSign size={20} />}
          subtitle={`${metrics.totalProperties} Propiedades`}
        />
        <StatCard
          title="Utilidad Neta (General)"
          value={`$${financials.netIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          icon={<TrendingUp size={20} />}
          trend={{ value: 'Ingreso Bruto: $' + financials.collectedRevenue.toLocaleString('en-US'), isPositive: financials.netIncome > 0 }}
        />
        <StatCard
          title="Cartera Vencida"
          value={`$${metrics.currentUnpaidDebt.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          icon={<Wallet size={20} color="#EF4444" />}
          subtitle="Deudas de rentas"
        />
        <StatCard
          title="Inquilinos Activos"
          value={metrics.totalTenants}
          icon={<Users size={20} />}
          subtitle={`${metrics.occupancyRate.toFixed(1)}% de ocupación`}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* CHARTS (2/3) */}
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Flujo de Caja Histórico (Últimos 6 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart 
              data={chartData} 
              xAxisKey="name" 
              bars={[
                { dataKey: "income", color: "#3B82F6", name: "Ingreso Bruto" },
                { dataKey: "expenses", color: "#EF4444", name: "Egresos Totales" }
              ]} 
              height={300}
            />
          </CardContent>
        </Card>

        {/* INFRASTRUCTURE (1/3) */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Monitor de Red (ISP & VPN)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${infrastructure.offlineRouters > 0 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  <Server className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Routers Mikrotik</p>
                  <p className="text-xs text-slate-500 mt-0.5">{infrastructure.onlineRouters} Online • <span className={infrastructure.offlineRouters > 0 ? "font-bold text-red-500" : ""}>{infrastructure.offlineRouters} Offline</span></p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${infrastructure.suspendedServices > 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                  <WifiOff className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Inquilinos en Corte</p>
                  <p className="text-xs text-slate-500 mt-0.5">{infrastructure.suspendedServices} inquilinos con acceso suspendido</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* LEADERBOARD */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Leaderboard de Gestores</CardTitle>
          </CardHeader>
          <CardContent>
            {managers.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center border border-dashed rounded-lg bg-slate-50">No hay gestores activos generando comisiones aún.</p>
            ) : (
              <div className="space-y-4">
                {managers.map((manager, idx) => (
                  <div key={manager.id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-bold text-sm">
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{manager.name}</p>
                        <p className="text-xs text-slate-500">{manager.propertiesCount} Propiedades delegadas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-600">
                        ${manager.earnedCommissions.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase font-medium mt-0.5">Comisiones Históricas</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* OPERATIONS */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Operaciones y Soporte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Tasa de Desocupación</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-bold text-slate-900">{operations.vacancyRate}%</span>
                  <span className="text-sm text-slate-500">{operations.totalUnits - operations.occupiedUnits} de {operations.totalUnits} vacantes</span>
                </div>
              </div>
              <Building2 className="h-8 w-8 text-slate-300" />
            </div>

            <div className="h-px bg-slate-100 w-full"></div>

            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Tickets Críticos (Mantenimiento)</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={`text-3xl font-bold ${operations.openIncidents > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {operations.openIncidents}
                  </span>
                  <span className="text-sm text-slate-500 ml-1">requieren seguimiento</span>
                </div>
              </div>
              <AlertTriangle className={`h-8 w-8 ${operations.openIncidents > 0 ? 'text-amber-400' : 'text-slate-300'}`} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
