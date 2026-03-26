"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, User, Home, Building2, Calendar, DollarSign, Plus, Wifi, Zap, Droplet, ShieldCheck, CreditCard, Trash2, PauseCircle, PlayCircle, Loader2, CheckSquare, Camera } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AddMikrotikServiceDialog } from "@/components/AddMikrotikServiceDialog";
import { AccountStatement } from "@/components/AccountStatement";
import api from "@/lib/api";

interface LeaseService {
  id: string;
  ipAddress: string | null;
  pppoeUser: string | null;
  status: string;
  profile: {
    name: string;
    downloadSpeed: number;
    uploadSpeed: number;
    price?: number;
  };
}

interface LeaseDetail {
  id: string;
  startDate: string;
  endDate: string | null;
  rentAmount: number;
  paymentDay: number;
  status: string;
  unit: {
    id: string;
    name: string;
    property: {
      id: string;
      name: string;
      address: string;
    }
  };
  tenant: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    requiresInvoice?: boolean;
    taxDocumentUrl?: string | null;
  };
  services: LeaseService[];
  charges: any[];
  checklists?: any[];
}

export default function OwnerLeaseDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [lease, setLease] = useState<LeaseDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLease = async () => {
    try {
      const response = await api.get(`/leases/${id}`);
      setLease(response.data);
      try {
        const checklistsRes = await api.get(`/leases/${id}/checklists`);
        setLease(prev => prev ? { ...prev, checklists: checklistsRes.data } : null);
      } catch (err) { }
    } catch (error: any) {
      console.error("Error fetching lease details:", error);
      if (error.response?.status === 404 || error.response?.status === 403) {
        router.push("/owner/leases");
      }
    } finally {
      setLoading(false);
    }
  };

  const [togglingService, setTogglingService] = useState<string | null>(null);

  const handleToggleService = async (serviceId: string, currentStatus: string) => {
    if (!confirm(`¿Estás seguro de querer ${currentStatus === 'ACTIVE' ? 'suspender' : 'reactivar'} este servicio?`)) return;
    setTogglingService(serviceId);
    try {
      await api.patch(`/leases/${id}/services/${serviceId}/status`, {
        status: currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
      });
      fetchLease();
    } catch (error) {
      console.error("Error toggling service:", error);
      alert("No se pudo cambiar el estado del servicio.");
    } finally {
      setTogglingService(null);
    }
  };

  const handleRemoveService = async (serviceId: string) => {
    if (!confirm("¿Estás seguro de querer ELIMINAR definitivamente este servicio del contrato? Esto lo removerá también del Router Mikrotik.")) return;
    setTogglingService(serviceId);
    try {
      await api.delete(`/leases/${id}/services/${serviceId}`);
      fetchLease();
    } catch (error) {
      console.error("Error removing service:", error);
      alert("No se pudo eliminar el servicio.");
    } finally {
      setTogglingService(null);
    }
  };

  const handleTerminateLease = async () => {
    if (!confirm("¿Estás seguro de que deseas FINALIZAR este contrato? El contrato se conservará en el historial, pero el local quedará disponible para ser rentado nuevamente.")) return;
    try {
      await api.patch(`/leases/${id}/terminate`, {});
      alert("Contrato finalizado exitosamente. El local ahora está disponible.");
      fetchLease();
    } catch (error: any) {
      console.error("Error terminando contrato:", error);
      alert(error.response?.data?.message || "No se pudo finalizar el contrato.");
    }
  };

  const handleDownloadContract = async () => {
    try {
      const response = await api.get(`/pdfs/lease/${id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contrato-${id.split('-')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Hubo un error al generar el PDF legal.");
    }
  };

  useEffect(() => {
    fetchLease();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!lease) {
    return null; // Handled by standard redirect in fetch error
  }

  const internetExtraCost = lease.services?.filter(s => s.status === 'ACTIVE').reduce((sum, s) => sum + (Number(s.profile.price) || 0), 0) || 0;
  const totalMonthlyCost = lease.rentAmount + internetExtraCost;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Navigation & Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/owner/leases" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-transparent shadow-sm hover:bg-slate-100 hover:text-slate-900 h-10 w-10 shrink-0">
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              Contrato de {lease.tenant.name}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              ID: <span className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded text-slate-600">{lease.id.split('-')[0]}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lease.status === 'ACTIVE' && (
            <Button 
              variant="outline"
              size="sm"
              onClick={handleTerminateLease}
              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 gap-2 border-amber-200 h-8"
            >
              <PauseCircle className="h-4 w-4" />
              Finalizar Contrato
            </Button>
          )}
          <Button 
            onClick={handleDownloadContract}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-white border border-slate-200 shadow-sm hover:bg-slate-50 text-slate-700 h-8 px-3 gap-2"
          >
            <FileText className="h-4 w-4" />
            Descargar PDF Oficial
          </Button>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            lease.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
          }`}>
            {lease.status === 'ACTIVE' ? 'Activo' : 'Finalizado'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Lease Context */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Tenant Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <User className="h-24 w-24 text-slate-800" />
            </div>
            <div className="relative z-10">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 mb-4 font-bold text-lg">
                {lease.tenant.name.substring(0, 2).toUpperCase()}
              </div>
              <h2 className="text-lg font-bold text-slate-900">{lease.tenant.name}</h2>
              <div className="mt-4 space-y-2">
                <p className="text-sm text-slate-600 flex items-center">
                  <span className="font-medium w-16 text-slate-500">Email:</span> {lease.tenant.email}
                </p>
                <p className="text-sm text-slate-600 flex items-center">
                  <span className="font-medium w-16 text-slate-500">Tel:</span> {lease.tenant.phone || 'No registrado'}
                </p>
              </div>
              {lease.tenant.requiresInvoice && (
                <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-lg p-3 animate-in fade-in">
                  <p className="text-xs font-bold text-indigo-800 flex items-center mb-1">
                    <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                    Requiere Factura (CFDI)
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-indigo-600 font-medium tracking-tight">Constancia Fiscal Adjunta</span>
                    {lease.tenant.taxDocumentUrl ? (
                      <a href={lease.tenant.taxDocumentUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold uppercase bg-white border border-indigo-200 text-indigo-700 px-2 py-1 rounded shadow-sm hover:bg-indigo-600 hover:text-white transition-colors">
                        Descargar
                      </a>
                    ) : (
                      <span className="text-[10px] text-red-500 font-bold uppercase">Falta Archivo</span>
                    )}
                  </div>
                </div>
              )}
            </div>

          {/* Location Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5">
              <Building2 className="h-24 w-24 text-slate-800" />
            </div>
            <div className="relative z-10">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Home className="h-4 w-4" /> Propiedad
              </h3>
              <p className="text-lg font-bold text-slate-900">{lease.unit.property.name}</p>
              <p className="text-sm text-slate-500 mt-1 line-clamp-2">{lease.unit.property.address}</p>
              
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-600 flex items-center">
                  <span className="font-medium w-16 text-slate-500">Unidad:</span> 
                  <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">{lease.unit.name}</span>
                </p>
              </div>
            </div>
             <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <Link href={`/owner/properties/${lease.unit.property.id}`} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-transparent shadow-sm hover:bg-slate-100 hover:text-slate-900 h-8 px-3">
                Ver Propiedad
              </Link>
            </div>
          </div>

        </div>

        {/* Right Column: Financials & Services */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Financial Terms */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
              <FileText className="h-5 w-5 text-indigo-500" />
              Términos del Contrato
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1">
                  Renta Total
                  {internetExtraCost > 0 && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded ml-2">+ Internet</span>}
                </p>
                <p className="text-xl font-bold text-emerald-600">${totalMonthlyCost.toLocaleString()}</p>
                {internetExtraCost > 0 && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    Base: ${lease.rentAmount} | Extra: ${internetExtraCost}
                  </p>
                )}
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Día de Pago</p>
                <p className="text-xl font-bold text-slate-800">{lease.paymentDay}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Inicio</p>
                <p className="text-sm font-bold text-slate-800 mt-1">{new Date(lease.startDate).toLocaleDateString()}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Fin</p>
                <p className="text-sm font-bold text-slate-800 mt-1">{lease.endDate ? new Date(lease.endDate).toLocaleDateString() : 'Indefinido'}</p>
              </div>
            </div>
          </div>

          {/* Value Added Services */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                Servicios Adicionales
              </h3>
              {(!lease.services || lease.services.length === 0) && (
                <AddMikrotikServiceDialog leaseId={lease.id} onServiceAdded={fetchLease} />
              )}
            </div>
            
            <div className="p-6">
              {lease.services && lease.services.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {lease.services.map(service => (
                    <div key={service.id} className="border border-slate-200 rounded-xl p-4 flex justify-between items-center gap-4 group hover:border-blue-200 transition-colors">
                      <div className="flex gap-4 items-center">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${service.status === 'ACTIVE' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                          <Wifi className="h-5 w-5" />
                        </div>
                        <div>
                          <p className={`font-bold ${service.status === 'ACTIVE' ? 'text-slate-900' : 'text-slate-500'}`}>{service.profile.name}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {service.pppoeUser ? (
                              <span className="font-semibold text-blue-700 bg-blue-50 px-1 py-0.5 rounded mr-2">
                                PPPoE: {service.pppoeUser}
                              </span>
                            ) : null}
                            {service.ipAddress ? `IP: ${service.ipAddress}` : 'IP Dinámica'}
                          </p>
                          <div className="mt-2 flex gap-2">
                            <span className="text-xs font-semibold bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                              {service.profile.downloadSpeed} Mbps ↓
                            </span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${service.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                              {service.status === 'ACTIVE' ? 'Conectado' : 'Suspendido'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className={`h-8 w-8 p-0 ${service.status === 'ACTIVE' ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50' : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'}`}
                          onClick={() => handleToggleService(service.id, service.status)}
                          disabled={togglingService === service.id}
                          title={service.status === 'ACTIVE' ? 'Suspender Servicio' : 'Reactivar Servicio'}
                        >
                          {togglingService === service.id ? <Loader2 className="h-4 w-4 animate-spin" /> : (service.status === 'ACTIVE' ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />)}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleRemoveService(service.id)}
                          disabled={togglingService === service.id}
                          title="Eliminar Servicio del Contrato"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-4 text-slate-400">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-medium text-slate-900">No hay servicios asociados</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Puedes enlazar este contrato a un router Mikrotik para automatizar el alta y corte de Internet del inquilino junto con su renta.
                  </p>
                </div>
              )}
            </div>
          </div>
      {/* Checklists Integrations (Owner ReadOnly) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
         <div className="p-5 md:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
           <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
             <CheckSquare className="h-5 w-5 text-indigo-500" />
             Auditorías de Inventario de la Propiedad
           </h3>
         </div>
         <div className="p-5 md:p-6 bg-slate-50/30">
           {(!lease.checklists || lease.checklists.length === 0) ? (
             <div className="text-center py-10 bg-white border border-dashed border-slate-200 rounded-xl">
               <Camera className="h-10 w-10 text-slate-300 mx-auto mb-3" />
               <p className="text-sm font-medium text-slate-700">Sin registros de inventario</p>
               <p className="text-xs text-slate-500 mt-1 px-4">El Gestor aún no ha realizado auditorías físicas para este contrato.</p>
             </div>
           ) : (
             <div className="space-y-4">
               {lease.checklists.map((chk: any) => (
                 <div key={chk.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 overflow-hidden relative">
                   <div className="flex justify-between items-start mb-4">
                     <div>
                       <div className="flex items-center gap-2 mb-1">
                         <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${chk.type === 'MOVE_IN' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>
                           {chk.type === 'MOVE_IN' ? 'Check-in (Entrada)' : 'Check-out (Salida)'}
                         </span>
                         <span className="text-xs text-slate-500 font-medium">
                           {new Date(chk.date).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric'})}
                         </span>
                       </div>
                       <p className="text-sm font-semibold text-slate-800 flex items-center gap-1"><User className="h-3 w-3" /> Gestor: {chk.manager?.name || 'Desconocido'}</p>
                     </div>
                   </div>
                   
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                     {(chk.items || []).map((item: any, i: number) => (
                       <div key={i} className="border border-slate-100 bg-slate-50 rounded-lg p-3">
                         <div className="flex justify-between">
                           <span className="font-semibold text-xs text-slate-700">{item.name}</span>
                           <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.status === 'BUENO' ? 'bg-emerald-100 text-emerald-700' : item.status === 'REGULAR' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{item.status}</span>
                         </div>
                         {item.notes && <p className="text-[11px] text-slate-500 mt-1 italic">"{item.notes}"</p>}
                         {item.photos && item.photos.length > 0 && (
                           <div className="flex gap-1 overflow-x-auto mt-2 pb-1">
                             {item.photos.map((url: string, pIdx: number) => (
                               <a key={pIdx} href={url} target="_blank" rel="noreferrer" className="shrink-0 flex items-center justify-center">
                                 <img src={url} alt="Evidencia" className="h-10 w-10 object-cover rounded shadow-sm hover:opacity-80 transition-opacity" />
                               </a>
                             ))}
                           </div>
                         )}
                       </div>
                     ))}
                   </div>
                   {chk.notes && (
                     <div className="mt-4 pt-3 border-t border-slate-100">
                       <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-md"><span className="font-semibold text-slate-800">Notas Generales:</span> {chk.notes}</p>
                     </div>
                   )}
                 </div>
               ))}
             </div>
           )}
         </div>
      </div>

          {/* Financial Records - Account Statement */}
          <AccountStatement leaseId={lease.id} />

        </div>
        </div>
      </div>
    </div>
  );
}
