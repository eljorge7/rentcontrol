"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { format } from "date-fns";
import { FileText, MapPin, Calendar, Wifi, DollarSign, Download, Loader2, Building2, Home, Zap, ShieldCheck } from "lucide-react";
import { getAuthHeaders } from "@/lib/auth";

export default function TenantLeasePage() {
  const [lease, setLease] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchLease = async () => {
      try {
        const tenantsRes = await api.get('/tenants');
        if (tenantsRes.data && Array.isArray(tenantsRes.data) && tenantsRes.data.length > 0) {
          let targetTenantId = tenantsRes.data[0].id;
          const dashRes = await api.get(`/dashboard/tenant/${targetTenantId}`);
          if (dashRes.data && dashRes.data.activeLease) {
            setLease(dashRes.data.activeLease);
          } else {
            setLease(null);
          }
        } else {
          setLease(null);
        }
      } catch (error) {
        console.error("Error fetching lease details", error);
        setLease(null);
      } finally {
        setLoading(false);
      }
    };
    fetchLease();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500 flex items-center justify-center h-64"><Loader2 className="animate-spin h-8 w-8 text-indigo-600" /></div>;

  if (!lease) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 text-center py-24 px-4">
          <div className="mx-auto w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
            <FileText className="h-10 w-10 text-slate-300" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Sin contrato activo</h2>
          <p className="text-slate-500 max-w-sm mx-auto">
            Actualmente no hay un alquiler vinculado a tu perfil. Si crees que esto es un error, por favor contacta a la administración.
          </p>
        </div>
      </div>
    );
  }

  const internetService = lease?.services?.find((s: any) => s?.type === "INTERNET" || s?.profile != null);
  const internetExtraCost = lease?.services?.filter((s: any) => s?.status === 'ACTIVE').reduce((sum: number, s: any) => sum + (Number(s?.profile?.price) || 0), 0) || 0;
  const totalMonthlyCost = (lease?.rentAmount || 0) + internetExtraCost;
  
  const depositCharge = lease?.charges?.find((c: any) => c.type === 'OTHER' && c.description.toLowerCase().includes('depósito'));
  const depositAmount = depositCharge?.amount || 0;

  let heroPhoto = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";
  try {
    const propertyPhotos = lease?.unit?.property?.photos ? JSON.parse(lease.unit.property.photos) : [];
    const unitPhotos = lease?.unit?.photos ? JSON.parse(lease.unit.photos) : [];
    heroPhoto = unitPhotos[0] || propertyPhotos[0] || heroPhoto;
  } catch(e) {}

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`http://localhost:3001/pdfs/lease/${lease.id}`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error("File not found");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contrato_${lease.id.split('-')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Hubo un error al descargar tu contrato.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Detalles de Mi Contrato
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Revisa los términos, fechas y servicios de tu arrendamiento actual.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            disabled={downloading} 
            onClick={handleDownloadPDF} 
            className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-white border border-slate-200 shadow-sm hover:bg-slate-50 text-slate-700 h-9 px-4 gap-2 ${downloading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            Descargar PDF
          </button>
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
            lease.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
          }`}>
            {lease.status === 'ACTIVE' ? 'Activo' : 'Finalizado'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Location & Unit */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="w-full h-48 relative bg-slate-100">
               <img src={heroPhoto} alt="Propiedad" className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex flex-col justify-end p-5">
                 <h2 className="text-xl font-bold text-white mb-1">{lease.unit?.property?.name}</h2>
                 <p className="text-sm text-white/80 flex items-center gap-1 line-clamp-1">
                   <MapPin className="h-3 w-3" /> {lease.unit?.property?.address}
                 </p>
               </div>
            </div>
            
            <div className="p-6 relative">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Building2 className="h-24 w-24 text-slate-800" />
              </div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Home className="h-4 w-4" /> Espacio Rentado
              </h3>
              <p className="text-lg font-bold text-slate-900">{lease.unit?.name}</p>
              
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-600 flex items-center justify-between">
                  <span className="font-medium text-slate-500">Tarifa Base:</span> 
                  <span className="font-semibold text-slate-800">${(lease.rentAmount || 0).toLocaleString()} MXN</span>
                </p>
                <p className="text-sm text-slate-600 flex items-center justify-between mt-2">
                  <span className="font-medium text-slate-500">Depósito en Garantía:</span> 
                  <span className="font-semibold text-slate-800">${depositAmount.toLocaleString()} MXN</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Financials & Services */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
              <FileText className="h-5 w-5 text-indigo-500" />
              Términos del Contrato
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1">
                  Costo Mensual
                  {internetExtraCost > 0 && <span className="text-[10px] bg-blue-100 text-blue-700 px-1 py-0.5 rounded whitespace-nowrap">+ Int</span>}
                </p>
                <p className="text-xl font-bold text-emerald-600">${totalMonthlyCost.toLocaleString()}</p>
                {internetExtraCost > 0 && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    Renta: ${lease.rentAmount} | Ext: ${internetExtraCost}
                  </p>
                )}
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Día de Pago</p>
                <p className="text-xl font-bold text-slate-800">{lease.paymentDay}</p>
                <p className="text-[10px] text-slate-400 mt-1">De cada mes</p>
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

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                Servicios Vinculados
              </h3>
            </div>
            
            <div className="p-6">
              {lease.services && lease.services.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lease.services.map((service: any) => (
                    <div key={service.id} className="border border-slate-200 rounded-xl p-4 flex gap-4 items-center">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${service.status === 'ACTIVE' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                        <Wifi className="h-6 w-6" />
                      </div>
                      <div>
                        <p className={`font-bold ${service.status === 'ACTIVE' ? 'text-slate-900' : 'text-slate-500'}`}>{service.profile?.name || "Internet Dedicado"}</p>
                        <div className="mt-1 flex gap-2">
                          <span className="text-xs font-semibold bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                            {service.profile?.downloadSpeed || 0} Mbps ↓
                          </span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${service.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {service.status === 'ACTIVE' ? 'Activo' : 'Suspendido'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-4 text-slate-400">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-medium text-slate-900">No hay servicios extra</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Tu contrato abarca únicamente la renta del espacio. Si requieres Internet, contacta a la administración.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
