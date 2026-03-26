"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getAuthHeaders } from "@/lib/auth";
import Link from "next/link";
import { 
  Building2, 
  Users, 
  UserCircle,
  FileText,
  DollarSign,
  Briefcase
} from "lucide-react";
import { ManagerOwnerChat } from "@/components/ManagerOwnerChat";

import { StatCard } from "@/components/dashboard/StatCard";
import api from "@/lib/api";

interface ManagerMetrics {
  totalProperties: number;
  totalManagedOwners: number;
  mrrManaged: number;
  expiringLeasesCount: number;
  pendingIncidents: number;
}

interface DashboardData {
  ownersList: any[];
}

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<ManagerMetrics | null>(null);
  const [data, setData] = useState<DashboardData>({ ownersList: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const [metricsRes, ownersRes] = await Promise.all([
          api.get('/metrics/manager'),
          fetch("http://localhost:3001/users/owners", { headers: getAuthHeaders() }),
        ]);

        const owners = ownersRes.ok ? await ownersRes.json() : [];

        setMetrics(metricsRes.data);
        setData({ ownersList: owners || [] });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Hola, {user?.name || 'Gestor'}</h1>
        <p className="text-slate-500 text-lg">Resumen de la cartera bajo tu gestión operativa.</p>
      </div>

      {isLoading || !metrics ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-slate-200 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            title="MRR Gestionado"
            value={metrics.mrrManaged < 0 ? `-$${Math.abs(metrics.mrrManaged).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : `$${metrics.mrrManaged.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            icon={<DollarSign size={20} />}
            subtitle="Monto total de rentas"
          />
          <StatCard
            title="Propiedades (Cartera)"
            value={metrics.totalProperties}
            icon={<Building2 size={20} />}
            subtitle={`De ${metrics.totalManagedOwners} dueños`}
          />
          <StatCard
            title="Incidentes Abiertos"
            value={metrics.pendingIncidents}
            icon={<Users size={20} color={metrics.pendingIncidents > 0 ? '#EF4444' : '#10B981'} />}
            subtitle="Tickets pendientes"
            trend={metrics.pendingIncidents > 0 ? { value: 'Atención requerida', isPositive: false } : undefined}
          />
          <StatCard
            title="Contratos por Vencer"
            value={metrics.expiringLeasesCount}
            icon={<FileText size={20} color={metrics.expiringLeasesCount > 0 ? '#F59E0B' : '#10B981'} />}
            subtitle="En los próximos 30 días"
            trend={metrics.expiringLeasesCount > 0 ? { value: 'Renovaciones', isPositive: false } : undefined}
          />
        </div>
      )}

      {/* Hero Widget */}
      <div className="mt-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-12 shadow-lg text-white relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 opacity-10">
          <Briefcase className="w-96 h-96" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">Central de Gestión Integral</h2>
          <p className="text-slate-300 text-lg mb-8 leading-relaxed">
            Como Gestor Operativo, tienes control completo y seguro sobre los inquilinos, contratos, finanzas y reportes de tu cartera de propietarios asignados. 
            Navega por el menú lateral para iniciar tus labores.
          </p>
          <div className="flex gap-4">
            <Link href="/manager/finances" className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-3 rounded-xl transition-colors shadow-lg shadow-blue-500/20">
              Ver Finanzas de Cartera
            </Link>
            <Link href="/manager/incidents" className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3 rounded-xl backdrop-blur-sm transition-colors border border-white/10">
              Revisar Incidentes
            </Link>
          </div>
        </div>
      </div>
      {/* Directorio de Propietarios */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <UserCircle className="h-6 w-6 text-indigo-500" />
          Directorio de Propietarios (Clientes)
        </h3>
        <p className="text-sm text-slate-500 mb-6">Comunícate directamente con los dueños de los edificios que administras.</p>
        
        {data.ownersList.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.ownersList.map((owner: any) => (
              <div key={owner.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <div className="flex items-start gap-4 mb-4">
                  <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold shrink-0">
                    {owner.name?.substring(0, 2).toUpperCase() || 'PR'}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-slate-900 truncate">{owner.name || 'Propietario Sin Nombre'}</h4>
                    <p className="text-xs text-slate-500 truncate">{owner.email}</p>
                    <span className="mt-1 inline-block text-[10px] uppercase font-bold tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Activo</span>
                  </div>
                </div>
                <ManagerOwnerChat 
                  managerId={user?.id || ''} 
                  managerName={user?.name || 'Gestor'} 
                  ownerId={owner.id} 
                  ownerName={owner.name || 'Propietario'} 
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 rounded-2xl border border-slate-200 border-dashed p-10 text-center">
            <Users className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <h4 className="text-sm font-medium text-slate-900">Sin propietarios asignados</h4>
            <p className="text-xs text-slate-500 mt-1">Cuando un administrador te asigne clientes, aparecerán aquí para que puedas chatear con ellos.</p>
          </div>
        )}
      </div>

    </div>
  );
}
