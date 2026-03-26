"use client";

import { useEffect, useState } from "react";
import { getAuthHeaders } from "@/lib/auth";
import api from "@/lib/api";
import { AlertCircle, Clock, Wrench, CheckCircle2, ShieldAlert } from "lucide-react";

interface Incident {
  id: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  tenant: { name: string; email: string };
  unit?: { name: string; property?: { name: string } };
  supplier?: { name: string; category: string };
  finalCharge?: number;
  billedTo?: string;
}

export default function OwnerIncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [billedTo, setBilledTo] = useState<"OWNER" | "TENANT">("OWNER");

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}"}/incidents`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setIncidents(data);
      }
    } catch (error) {
      console.error("Error fetching incidents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/incidents/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchIncidents();
      } else {
        alert("Error al actualizar el estado");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    }
  };

  const handleApproveCost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident) return;
    try {
      const res = await api.patch(`/incidents/${selectedIncident.id}/approve-cost`, {
        billedTo
      });
      if (res.status === 200) {
        setApproveModalOpen(false);
        fetchIncidents();
        alert("Costo aprobado y cargo generado correctamente.");
      }
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Error al aprobar el costo");
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT": return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded">URGENTE</span>;
      case "HIGH": return <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded">ALTA</span>;
      case "MEDIUM": return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded">MEDIA</span>;
      default: return <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded">BAJA</span>;
    }
  };

  if (loading) return <div className="p-8">Cargando reportes...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reportes e Incidentes</h1>
          <p className="text-slate-500 mt-1">Gestiona los tickets de mantenimiento reportados por tus inquilinos.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {incidents.length > 0 ? (
          incidents.map((incident) => (
            <div key={incident.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition-shadow">
              
              {/* Left Side: Details */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">#{incident.id.split('-')[0]}</span>
                  {getPriorityBadge(incident.priority)}
                  <span className="text-sm font-medium text-slate-500">
                    {new Date(incident.createdAt).toLocaleDateString("es-ES")}
                  </span>
                </div>
                
                <p className="text-slate-900 font-medium text-lg">&quot;{incident.description}&quot;</p>
                
                <div className="flex flex-wrap gap-4 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-xs font-semibold uppercase text-slate-400 block mb-0.5">Inquilino</span>
                    <span className="font-medium text-slate-800">{incident.tenant?.name || "Desconocido"}</span>
                  </div>
                  <div className="w-[1px] bg-slate-200"></div>
                  <div>
                    <span className="text-xs font-semibold uppercase text-slate-400 block mb-0.5">Ubicación</span>
                    <span className="font-medium text-blue-700">{incident.unit?.property?.name} - {incident.unit?.name}</span>
                  </div>

                  {(incident.finalCharge && incident.finalCharge > 0) ? (
                    <>
                      <div className="w-[1px] bg-slate-200"></div>
                      <div>
                        <span className="text-xs font-semibold uppercase text-slate-400 block mb-0.5">Costo de Reparación</span>
                        <span className="font-bold text-emerald-700">${Number(incident.finalCharge).toLocaleString('es-MX', {minimumFractionDigits: 2})} MXN</span>
                        {incident.billedTo && (
                          <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                            Cobrado a: {incident.billedTo === 'OWNER' ? 'Mí (Dueño)' : 'Inquilino'}
                          </span>
                        )}
                      </div>
                    </>
                  ) : null}
                </div>
              </div>

              {/* Right Side: Status Actions */}
              <div className="flex flex-col items-start md:items-end justify-between min-w-[200px] border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                <div className="w-full">
                  <p className="text-xs font-bold uppercase text-slate-400 mb-2">Estado del Ticket</p>
                  
                  {incident.status === 'AWAITING_APPROVAL' ? (
                    <div className="space-y-2 w-full">
                      <span className="w-full inline-block text-center bg-amber-100 text-amber-800 text-xs px-3 py-2 rounded-lg font-bold">
                        ⏳ Requiere tu Aprobación
                      </span>
                      <button
                        onClick={() => { setSelectedIncident(incident); setApproveModalOpen(true); }}
                        className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors"
                      >
                        Autorizar Reparación
                      </button>
                    </div>
                  ) : (
                    <select 
                      className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                      value={incident.status}
                      disabled={incident.status === 'RESOLVED' || incident.status === 'CANCELLED'}
                      onChange={(e) => handleUpdateStatus(incident.id, e.target.value)}
                    >
                      <option value="PENDING">🔴 Pendiente</option>
                      <option value="IN_PROGRESS">🟡 En Proceso</option>
                      <option value="RESOLVED">🟢 Resuelto</option>
                      <option value="CANCELLED">⚪ Cancelado</option>
                    </select>
                  )}
                </div>
                
                {incident.supplier && (
                  <div className="mt-4 w-full">
                    <p className="text-xs font-bold uppercase text-slate-400 mb-1">Proveedor Asignado</p>
                    <p className="text-sm font-semibold">{incident.supplier.name}</p>
                    <p className="text-xs text-slate-500">{incident.supplier.category}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
            <ShieldAlert className="mx-auto h-12 w-12 text-emerald-400 mb-4" />
            <h3 className="text-lg font-medium tracking-tight text-slate-900">Todo en orden</h3>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto">No hay tickets de mantenimiento activos reportados por tus inquilinos.</p>
          </div>
        )}
      </div>

      {/* Modal de Aprobación */}
      {approveModalOpen && selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Autorizar Reparación</h3>
              <button onClick={() => setApproveModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <span className="text-xl">&times;</span>
              </button>
            </div>
            
            <form onSubmit={handleApproveCost}>
              <div className="p-5 space-y-4">
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-4 text-center">
                  <p className="text-sm font-medium text-blue-800 mb-1">Costo Total de Reparación</p>
                  <p className="text-3xl font-bold text-blue-900">
                    ${Number(selectedIncident.finalCharge).toLocaleString('es-MX', {minimumFractionDigits: 2})} MXN
                  </p>
                </div>
                
                <p className="text-sm text-slate-600 font-medium mb-3">¿A quién se le cobrará este monto?</p>
                
                <div className="space-y-3">
                  <label className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all ${billedTo === 'OWNER' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 hover:bg-slate-50'}`}>
                    <input 
                      type="radio" 
                      name="billedTo" 
                      value="OWNER" 
                      checked={billedTo === 'OWNER'} 
                      onChange={() => setBilledTo('OWNER')} 
                      className="mt-1 h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-600"
                    />
                    <div className="ml-3">
                      <span className="block text-sm font-semibold text-slate-900">A mi Estado de Cuenta (Dueño)</span>
                      <span className="block text-xs text-slate-500 mt-0.5">Se deducirá como un Gasto Operativo de tus ganancias de este mes. (Reparación general de la propiedad)</span>
                    </div>
                  </label>
                  
                  <label className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all ${billedTo === 'TENANT' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 hover:bg-slate-50'}`}>
                    <input 
                      type="radio" 
                      name="billedTo" 
                      value="TENANT" 
                      checked={billedTo === 'TENANT'} 
                      onChange={() => setBilledTo('TENANT')} 
                      className="mt-1 h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-600"
                    />
                    <div className="ml-3">
                      <span className="block text-sm font-semibold text-slate-900">Cobrar al Inquilino (Cargo extra)</span>
                      <span className="block text-xs text-slate-500 mt-0.5">Se le inyectará un cargo obligatorio al inquilino en su próximo recibo de renta. (Daños causados por el inquilino)</span>
                    </div>
                  </label>
                </div>
              </div>
              <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setApproveModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl">
                  Autorizar Solicitud
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
