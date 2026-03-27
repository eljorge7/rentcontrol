"use client";

import { useEffect, useState } from "react";
import { getAuthHeaders } from "@/lib/auth";
import { AlertCircle, Plus, CheckCircle2, Clock, Wrench, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Incident {
  id: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  supplier?: { name: string, category: string, phone?: string };
}

export default function TenantIncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ description: "", priority: "LOW" });

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/incidents`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      setIncidents(data);
    } catch (error) {
      console.error("Error fetching incidents:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDING': return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full flex items-center gap-1"><Clock size={12}/> Pendiente</span>;
      case 'IN_PROGRESS': return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full flex items-center gap-1"><Wrench size={12}/> En Proceso</span>;
      case 'RESOLVED': return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full flex items-center gap-1"><CheckCircle2 size={12}/> Resuelto</span>;
      default: return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full">{status}</span>;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim()) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/incidents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ description: "", priority: "LOW" });
        fetchIncidents();
      } else {
        const err = await res.json();
        alert(err.message || "Error al enviar el reporte");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-8">Cargando reportes...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Reportes e Incidencias</h2>
          <p className="text-slate-500 mt-1">Levanta un ticket de mantenimiento o reporta algún problema técnico.</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 font-semibold h-11 px-5 rounded-xl shadow-lg shadow-blue-600/20"
        >
          <Plus className="mr-2 h-5 w-5" /> Nuevo Reporte
        </Button>
      </div>

      <div className="grid gap-4 mt-6">
        {incidents.length > 0 ? incidents.map((ticket) => (
          <div key={ticket.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-blue-300 transition-colors">
            
            <div className="flex items-start gap-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mt-1">
                <AlertCircle className="h-6 w-6 text-indigo-500" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">TICKET #{ticket.id.split('-')[0]}</span>
                  {getStatusBadge(ticket.status)}
                </div>
                <p className="text-slate-800 font-medium text-lg leading-snug">{ticket.description}</p>
                <p className="text-sm text-slate-500 mt-2">
                  Abierto el {new Date(ticket.createdAt).toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>

            {ticket.supplier && (
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 min-w-[200px]">
                <p className="text-xs text-slate-500 font-medium mb-1 uppercase">Proveedor Asignado:</p>
                <p className="text-sm font-semibold text-slate-800">{ticket.supplier.name}</p>
                <p className="text-xs text-slate-500 mb-1">{ticket.supplier.category}</p>
                {ticket.supplier.phone && (
                  <p className="text-xs font-medium text-blue-600 mt-1">
                    📞 {ticket.supplier.phone}
                  </p>
                )}
              </div>
            )}
          </div>
        )) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
            <div className="bg-slate-50 p-4 rounded-full inline-flex mb-4">
              <AlertCircle className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-medium text-slate-900 mb-2">Sin incidencias</h3>
            <p className="text-slate-500 max-w-md mx-auto">No has reportado ningún problema. Si tienes alguna falla en tu servicio o departamento, levanta un ticket aquí.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Nuevo Reporte</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-5 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Prioridad</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  >
                    <option value="LOW">Baja (Mantenimiento general)</option>
                    <option value="MEDIUM">Media (Falla de algún servicio)</option>
                    <option value="HIGH">Alta (Fuga de agua, sin luz)</option>
                    <option value="URGENT">Urgente (Peligro inminente)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Descripción del problema</label>
                  <Textarea 
                    required
                    rows={4}
                    placeholder="Describe detalladamente cuál es la falla o el mantenimiento necesario..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>
              <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar Reporte"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
