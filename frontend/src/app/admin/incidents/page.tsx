"use client";

import { useEffect, useState } from "react";
import { getAuthHeaders } from "@/lib/auth";
import api from "@/lib/api";
import { AlertCircle, Clock, Wrench, CheckCircle2, ShieldAlert, UserPlus, X, Loader2, DollarSign, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Incident {
  id: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  tenant: { name: string; email: string };
  unit?: { name: string; property?: { name: string; owner?: { name: string; managementPlan?: { name: string } } } };
  supplier?: { name: string; category: string; contactName?: string; phone?: string };
  cost?: number; // Added for the change
  supplierNotes?: string; // Added for the change
}

export default function OwnerIncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchIncidents();
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await api.get("/suppliers");
      setSuppliers(res.data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  const fetchIncidents = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/incidents`, {
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

  const handleAssignSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident || !selectedSupplier) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/incidents/${selectedIncident}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        // Al asignar, lo movemos a EN PROCESO automáticamente
        body: JSON.stringify({ status: "IN_PROGRESS", supplierId: selectedSupplier }),
      });
      if (res.ok) {
        setAssignModalOpen(false);
        setSelectedSupplier("");
        fetchIncidents();
      } else {
        alert("Error al asignar proveedor");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    }
  };

  const [sendingNotificationId, setSendingNotificationId] = useState<string | null>(null);

  const handleNotifySupplier = async (id: string) => {
    setSendingNotificationId(id);
    try {
      const res = await api.post(`/incidents/${id}/notify-supplier`);
      if (res.status === 201 || res.status === 200) {
        alert("¡Mensaje de WhatsApp enviado exitosamente al proveedor!");
      }
    } catch (error: any) {
      console.error("Error al notificar al proveedor:", error);
      alert(error.response?.data?.message || "Fallo al enviar notificación por WhatsApp.");
    } finally {
      setSendingNotificationId(null);
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

  const filteredIncidents = incidents.filter(i => 
    i.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (i.tenant?.name || "Desconocido").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (i.unit?.property?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (i.unit?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reportes e Incidentes</h1>
          <p className="text-slate-500 mt-1">Gestiona los tickets de mantenimiento reportados por tus inquilinos.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Buscar por descripción, inquilino o local..."
            className="pl-9 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {incidents.length > 0 ? (
          filteredIncidents.length > 0 ? (
            filteredIncidents.map((incident) => (
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
                  {incident.status === 'RESOLVED' && incident.cost !== null && (
                    <>
                      <div className="w-[1px] bg-slate-200 hidden sm:block"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-500 uppercase">Costo de Reparación</span>
                          <span className="font-bold text-emerald-600 flex items-center">
                            <DollarSign className="h-4 w-4 mr-0.5" />
                            {Number(incident.cost).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                          </span>
                        </div>
                        {incident.supplierNotes && (
                          <p className="text-sm text-slate-600 italic border-l-2 border-slate-300 pl-2 mt-2">
                            "{incident.supplierNotes}"
                          </p>
                        )}
                      </div>
                    </>
                  )}
                  {incident.unit?.property?.owner && (
                    <>
                      <div className="w-[1px] bg-slate-200 hidden sm:block"></div>
                      <div>
                        <span className="text-xs font-semibold uppercase text-slate-400 block mb-0.5">Propietario asignado</span>
                        <span className="font-medium text-slate-800">
                          {incident.unit?.property?.owner.name}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Right Side: Status Actions */}
              <div className="flex flex-col items-start md:items-end justify-between min-w-[200px] border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                <div className="w-full">
                  <p className="text-xs font-bold uppercase text-slate-400 mb-2">Estado del Ticket</p>
                  <select 
                    className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                    value={incident.status}
                    onChange={(e) => handleUpdateStatus(incident.id, e.target.value)}
                  >
                    <option value="PENDING">🔴 Pendiente</option>
                    <option value="IN_PROGRESS">🟡 En Proceso</option>
                    <option value="RESOLVED">🟢 Resuelto</option>
                    <option value="CANCELLED">⚪ Cancelado</option>
                  </select>
                </div>
                
                {incident.supplier ? (
                  <div className="mt-4 w-full">
                    <p className="text-xs font-bold uppercase text-slate-400 mb-1">Proveedor Asignado</p>
                    <p className="text-sm font-semibold">{incident.supplier.name}</p>
                    {incident.supplier.contactName && <p className="text-xs text-slate-500 font-medium">Atte: {incident.supplier.contactName}</p>}
                    <p className="text-xs text-slate-500 mb-2">{incident.supplier.category}</p>
                    <Button 
                      onClick={() => handleNotifySupplier(incident.id)}
                      disabled={sendingNotificationId === incident.id}
                      className="mt-2 text-xs flex justify-center items-center py-1.5 px-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold rounded-lg transition-colors w-full h-auto"
                    >
                      {sendingNotificationId === incident.id ? (
                         <><Loader2 className="h-3 w-3 animate-spin mr-1.5" /> Enviando...</>
                      ) : (
                         "Enviar Link WhatsApp"
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="mt-4 w-full pt-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => { setSelectedIncident(incident.id); setAssignModalOpen(true); }}
                      className="w-full text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <UserPlus className="h-3 w-3 mr-1.5" /> Asignar Técnico
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <Search className="mx-auto h-8 w-8 text-slate-300 mb-3" />
            <h3 className="text-base font-medium text-slate-900">No se encontraron tickets</h3>
            <p className="text-sm text-slate-500 mt-1">Nadie coincide con tu búsqueda.</p>
            <Button variant="ghost" onClick={() => setSearchTerm("")} className="mt-4 text-blue-600">Limpiar búsqueda</Button>
          </div>
        )
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
            <ShieldAlert className="mx-auto h-12 w-12 text-emerald-400 mb-4" />
            <h3 className="text-lg font-medium tracking-tight text-slate-900">Todo en orden</h3>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto">No hay tickets de mantenimiento activos reportados por tus inquilinos.</p>
          </div>
        )}
      </div>

      {/* Modal Asignar Proveedor */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Asignar Proveedor</h3>
              <button onClick={() => setAssignModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {suppliers.length === 0 ? (
              <div className="p-8 text-center border-b border-slate-100">
                <p className="text-sm text-slate-500 mb-4">No tienes proveedores registrados. Ve a tu menú de Proveedores y agrega a tu equipo técnico primero.</p>
                <Button variant="outline" onClick={() => setAssignModalOpen(false)}>Entendido</Button>
              </div>
            ) : (
              <form onSubmit={handleAssignSupplier}>
                <div className="p-5 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Selecciona al técnico responsable:</label>
                    <select 
                      required
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                      value={selectedSupplier}
                      onChange={(e) => setSelectedSupplier(e.target.value)}
                    >
                      <option value="" disabled>-- Elige un proveedor --</option>
                      {suppliers.map(sup => (
                        <option key={sup.id} value={sup.id}>
                          {sup.name} {sup.contactName ? `(${sup.contactName})` : ''} - {sup.category}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-500 mt-2">Al asignar a un proveedor, el estado de este ticket automáticamente cambiará a "En Proceso".</p>
                  </div>
                </div>
                <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setAssignModalOpen(false)} className="hover:bg-slate-100 rounded-xl">Cancelar</Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                    Confirmar Asignación
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
