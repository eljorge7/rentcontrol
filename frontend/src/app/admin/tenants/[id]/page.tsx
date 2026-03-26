"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Calendar, 
  FileText, 
  ShieldCheck, 
  Activity,
  DollarSign,
  AlertTriangle
} from "lucide-react";
import api from "@/lib/api";

type TenantProfile = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  rfc?: string;
  taxRegimen?: string;
  zipCode?: string;
  requiresInvoice: boolean;
  taxDocumentUrl?: string;
  createdAt: string;
  leases: Array<{
    id: string;
    unit: {
      name: string;
      property: {
        name: string;
      }
    };
    startDate: string;
    endDate?: string;
    rentAmount: number;
    status: string;
  }>;
};

export default function AdminTenantProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [tenant, setTenant] = useState<TenantProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const response = await api.get(`/tenants/${id}`);
        setTenant(response.data);
      } catch (error) {
        console.error("Error fetching tenant profile:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchTenant();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500">Cargando perfil del inquilino...</p>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center space-y-4">
        <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
          <User className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-700">Inquilino no encontrado</h2>
        <Button onClick={() => router.push('/admin/tenants')} variant="outline">
          Volver al directorio
        </Button>
      </div>
    );
  }

  const activeLeases = tenant.leases.filter(l => l.status === 'ACTIVE');
  const pastLeases = tenant.leases.filter(l => l.status !== 'ACTIVE');

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      {/* Header and Back Button */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => router.push('/admin/tenants')}
          className="h-10 w-10 rounded-full border-slate-200 hover:bg-slate-100 hover:text-slate-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Perfil de Inquilino</h1>
          <p className="text-sm font-medium text-slate-500">Vista detallada de información y contratos</p>
        </div>
      </div>

      {/* Immersive Main Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-800 to-indigo-950 p-8 shadow-2xl">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl"></div>
        <div className="absolute -bottom-24 left-1/4 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-white/10 ring-4 ring-white/20 backdrop-blur-md">
            <User className="h-10 w-10 text-white/90" />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                {tenant.name}
              </h2>
              {activeLeases.length > 0 ? (
                <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-medium text-emerald-300 ring-1 ring-inset ring-emerald-500/30">
                  <Activity className="mr-1 h-3.5 w-3.5" /> Inquilino Activo
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-slate-500/20 px-3 py-1 text-sm font-medium text-slate-300 ring-1 ring-inset ring-slate-500/30">
                  Inactivo / Histórico
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-medium text-indigo-100/80">
              <div className="flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-indigo-300" />
                {tenant.email}
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-indigo-300" />
                {tenant.phone || "Sin teléfono"}
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-indigo-300" />
                Cliente desde {format(new Date(tenant.createdAt), 'MMM yyyy', { locale: es })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Tax Info */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-500" /> Configuración Fiscal
              </h3>
            </div>
            <CardContent className="p-5 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-slate-700">Facturación CFDI</p>
                  <p className="text-xs text-slate-500">
                    {tenant.requiresInvoice 
                      ? "El inquilino requiere factura oficial por cada pago." 
                      : "Solo emisiones de recibos internos simples."}
                  </p>
                </div>
                {tenant.requiresInvoice ? (
                  <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none">
                    <ShieldCheck className="mr-1 h-3 w-3" /> Activada
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-none">
                    Desactivada
                  </Badge>
                )}
              </div>

              {tenant.requiresInvoice && (
                <div className="rounded-xl border border-slate-100 bg-white p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase">RFC</span>
                    <span className="text-sm font-bold text-slate-900">{tenant.rfc || 'No especificado'}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Régimen</span>
                    <span className="text-sm font-bold text-slate-900">{tenant.taxRegimen || 'No especificado'}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase">C. Postal</span>
                    <span className="text-sm font-bold text-slate-900">{tenant.zipCode || 'No especificado'}</span>
                  </div>
                  <div className="pt-2">
                    {tenant.taxDocumentUrl ? (
                      <a href={tenant.taxDocumentUrl} target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center rounded-lg bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-100">
                        <FileText className="mr-2 h-4 w-4" /> Ver Constancia (CSF)
                      </a>
                    ) : (
                      <div className="inline-flex w-full items-center justify-center rounded-lg bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700">
                        <AlertTriangle className="mr-2 h-4 w-4" /> Falta PDF Constancia
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Leases Info */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-indigo-500" /> Contratos de Alquiler
              </h3>
            </div>
            <CardContent className="p-0">
              {tenant.leases.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-slate-100 p-3 mb-3">
                    <FileText className="h-6 w-6 text-slate-400" />
                  </div>
                  <h4 className="text-sm font-medium text-slate-900">Sin Contratos</h4>
                  <p className="text-xs text-slate-500">Este inquilino no tiene contratos registrados.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {tenant.leases.map((lease) => (
                    <div key={lease.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-slate-50/50">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900">{lease.unit.property.name}</h4>
                          <span className="text-slate-400 font-medium">—</span>
                          <span className="text-sm font-medium text-slate-600">{lease.unit.name}</span>
                          {lease.status === 'ACTIVE' ? (
                            <Badge className="ml-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none font-semibold">Activo</Badge>
                          ) : (
                            <Badge variant="secondary" className="ml-2 bg-slate-100 text-slate-600 border-none font-semibold">Terminado</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {format(new Date(lease.startDate), "dd MMM yyyy", { locale: es })} 
                            {lease.endDate ? ` - ${format(new Date(lease.endDate), "dd MMM yyyy", { locale: es })}` : ' en adelante'}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <DollarSign className="h-3.5 w-3.5" />
                            Renta: ${(lease.rentAmount).toLocaleString()} MXN
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/admin/leases/${lease.id}`)}>
                          Ver Contrato Completo
                        </Button>
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
