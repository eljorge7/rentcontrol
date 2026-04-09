"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, FileText, Bell, AlertTriangle, ShieldCheck } from "lucide-react";
import api from "@/lib/api";
import { cleanDescription } from "@/lib/utils";
import { UpdateTaxProfileDialog } from "@/components/UpdateTaxProfileDialog";
import { AppStoreBanner } from "@/components/AppStoreBanner";

export default function TenantDashboard() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const tenantsRes = await api.get('/tenants');
      if (tenantsRes.data && Array.isArray(tenantsRes.data) && tenantsRes.data.length > 0) {
        const tenantId = tenantsRes.data[0].id;
        const dashRes = await api.get(`/dashboard/tenant/${tenantId}`);
        setData(dashRes.data);
      } else {
        setData(null);
      }
    } catch (error) {
      console.error("Error fetching tenant dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading && !data) return <div className="p-8 text-center text-slate-500">Cargando tu portal...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">No se encontró información del inquilino.</div>;

  const totalPending = data?.activeLease?.charges?.reduce((acc: number, c: any) => acc + (c?.amount || 0), 0) || 0;
  const internetService = data?.activeLease?.services?.[0];
  const isInternetActive = internetService?.status === 'ACTIVE';

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      
      {/* Immersive Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 shadow-2xl">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl"></div>
        <div className="absolute -bottom-24 left-1/4 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5 text-center md:text-left">
            <div className="hidden sm:flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white/10 ring-4 ring-white/20 backdrop-blur-md">
              <span className="text-2xl font-bold text-white">
                {data.tenant.name.substring(0, 2).toUpperCase()}
              </span>
            </div>
            
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl mb-1">
                Hola, {data.tenant.name.split(' ')[0]}
              </h1>
              <p className="text-indigo-200/80 font-medium">
                Resumen de tu servicio e historial de pagos.
              </p>
            </div>
          </div>

          <Button 
            onClick={() => router.push('/tenant/billing')} 
            size="lg"
            className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/30 transition-all border border-indigo-400"
          >
            <DollarSign className="mr-2 h-5 w-5" /> Realizar Pago
          </Button>
        </div>
      </div>

      <AppStoreBanner role="tenant" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Saldo Pendiente
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">${totalPending.toLocaleString()} MXN</div>
            <p className="text-xs text-red-500 mt-1 font-medium mb-3">
              {data.activeLease?.charges?.length || 0} recibo(s) pendiente(s)
            </p>
            {data.activeLease?.charges?.length > 0 && (
              <div className="space-y-2 border-t pt-3">
                {data.activeLease.charges.map((charge: any) => (
                  <div key={charge.id} className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 truncate mr-2" title={cleanDescription(charge.description) || charge.type}>{cleanDescription(charge.description) || charge.type}</span>
                    <span className="font-semibold text-slate-900">${charge.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Estado del Internet
            </CardTitle>
            {isInternetActive ? (
              <div className="h-2 w-2 rounded-full bg-green-500 ring-4 ring-green-100 animate-pulse" />
            ) : (
              <div className="h-2 w-2 rounded-full bg-red-500 ring-4 ring-red-100" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isInternetActive ? 'text-green-600' : 'text-red-600'}`}>
              {internetService ? (isInternetActive ? 'Activo' : 'Suspendido') : 'Sin Servicio'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Paquete: {internetService?.profile?.name || 'No contratado'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avisos Recientes
            </CardTitle>
            <Bell className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">0</div>
            <p className="text-xs text-slate-500 mt-1">
              No tienes notificaciones
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Últimos Movimientos</CardTitle>
            <CardDescription>
              Historial de tus pagos recientes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {data.recentMovements && data.recentMovements.length > 0 ? data.recentMovements.map((mov: any) => (
                <div className="flex items-center" key={mov.id}>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{cleanDescription(mov.description)}</p>
                    <p className="text-sm text-slate-500">
                      {new Date(mov.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="ml-auto font-medium text-green-600">
                    +${mov.amount.toLocaleString()}
                  </div>
                </div>
              )) : (
                <p className="text-sm text-slate-500 text-center">No hay movimientos recientes.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Mi Contrato Activo</CardTitle>
            <CardDescription>
              Información relevante de tu alquiler actual.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.activeLease ? (
              <div className="space-y-4">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500 text-sm">Propiedad</span>
                  <span className="font-medium text-sm text-slate-900">{data.activeLease.unit?.property?.name}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500 text-sm">Unidad/Local</span>
                  <span className="font-medium text-sm text-slate-900">{data.activeLease.unit?.name}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500 text-sm">Inicio Contrato</span>
                  <span className="font-medium text-sm text-slate-900">
                    {new Date(data.activeLease.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500 text-sm">Día límite de pago</span>
                  <span className="font-medium text-sm text-slate-900">Día {data.activeLease.paymentDay}</span>
                </div>
                {/* Adding original lease deposit from charges info */}
                {data.activeLease?.charges?.some((c: any) => c.type === 'OTHER' && c.description.toLowerCase().includes('depósito')) && (
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500 text-sm">Depósito Entregado/Fijado</span>
                    <span className="font-medium text-sm text-slate-900">
                      ${data.activeLease.charges.find((c: any) => c.type === 'OTHER' && c.description.toLowerCase().includes('depósito'))?.amount.toLocaleString()} MXN
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-6">No tienes contratos activos vinculados a tu cuenta.</p>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Datos de Facturación</CardTitle>
            <CardDescription>
              Configura tus datos para recibir facturas (CFDI) de tus pagos de renta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
                <div className={`p-2 rounded-full ${data.tenant?.requiresInvoice ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                  {data.tenant?.requiresInvoice ? <ShieldCheck className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 leading-tight">
                    {data.tenant?.requiresInvoice ? 'Facturación Automática Activada' : 'Facturación Desactivada'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {data.tenant?.requiresInvoice 
                      ? 'Tus recibos de pago se enviarán a tu contador para generar tu CFDI.' 
                      : 'Actualmente solo recibes comprobantes de pago simples sin validez fiscal.'}
                  </p>
                </div>
              </div>

              {data.tenant?.requiresInvoice && (
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <span className="block text-xs text-slate-500 uppercase">RFC</span>
                    <span className="block font-medium text-slate-900">{data.tenant?.rfc || 'No especificado'}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 uppercase">Código Postal</span>
                    <span className="block font-medium text-slate-900">{data.tenant?.zipCode || 'No especificado'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-xs text-slate-500 uppercase">Régimen Fiscal</span>
                    <span className="block font-medium text-slate-900">{data.tenant?.taxRegimen || 'No especificado'}</span>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <UpdateTaxProfileDialog tenant={data.tenant} onUpdated={fetchData} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
