"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Wrench, CheckCircle2, Clock, MapPin, AlertTriangle, ShieldCheck } from "lucide-react";

export default function PublicTicketPage() {
  const params = useParams();
  const id = params.id as string;
  const [incident, setIncident] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);

  // Form states
  const [cost, setCost] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const fetchIncident = async () => {
      try {
        const res = await fetch(`http://localhost:3001/incidents/public/${id}`);
        if (!res.ok) throw new Error("Ticket no encontrado");
        const data = await res.json();
        setIncident(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchIncident();
  }, [id]);

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    setResolving(true);
    try {
      const res = await fetch(`http://localhost:3001/incidents/public/${id}/resolve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cost: cost ? parseFloat(cost) : 0,
          supplierNotes: notes,
          // evidenceUrl: // (Futuro: Subida de archivo a S3)
        })
      });

      if (!res.ok) throw new Error("Error al completar el trabajo");
      setIncident({ ...incident, status: "RESOLVED" });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setResolving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="animate-pulse flex flex-col items-center">
        <Wrench className="h-10 w-10 text-indigo-300 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Cargando Orden de Trabajo...</p>
      </div>
    </div>;
  }

  if (error || !incident) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-red-100 text-center max-w-sm w-full">
        <AlertTriangle className="h-14 w-14 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Ticket Inválido</h2>
        <p className="text-slate-500">Este enlace ha expirado o no existe.</p>
      </div>
    </div>;
  }

  // Si ya está resuelto
  if (incident.status === 'RESOLVED') {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-emerald-100 text-center max-w-sm w-full">
        <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="h-10 w-10 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">Trabajo Completado</h2>
        <p className="text-slate-500 mb-6">Gracias por tu servicio. El reporte ya ha sido enviado a la agencia y tu pago será procesado.</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 sm:py-10">
      <div className="max-w-md mx-auto bg-white min-h-screen sm:min-h-0 sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Encabezado Azul */}
        <div className="bg-indigo-600 p-6 text-white pb-8">
          <div className="flex items-center gap-3 opacity-80 mb-6">
            <Wrench className="h-5 w-5" />
            <span className="font-semibold tracking-wider text-sm">ORDEN DE TRABAJO</span>
          </div>
          <h1 className="text-2xl font-black leading-tight mb-2">
            Mantenimiento Asignado
          </h1>
          <p className="opacity-90 leading-relaxed text-indigo-100">
            {incident.description}
          </p>
        </div>

        {/* Tarjeta de Datos Solapada */}
        <div className="bg-white rounded-t-3xl -mt-5 pt-8 px-6 flex-1 flex flex-col">
          <div className="space-y-5 mb-8">
            <div className="flex items-start gap-4">
              <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Ubicación</p>
                <p className="font-semibold text-slate-800 text-lg">{incident.unit?.property?.name}</p>
                <p className="text-slate-500">{incident.unit?.name}</p>
                <p className="text-slate-400 text-sm mt-1">{incident.unit?.property?.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-orange-50 p-2.5 rounded-xl text-orange-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Reportado el</p>
                <p className="font-semibold text-slate-800">{new Date(incident.createdAt).toLocaleDateString("es-MX", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 mb-8 flex-1">
            <h3 className="font-bold text-slate-800 text-lg mb-4">Finalizar Trabajo</h3>
            <form onSubmit={handleResolve} className="space-y-4">
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Costo de Reparación ($ MXN)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input 
                    type="number" 
                    required
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="Ej. 450.00"
                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none font-semibold text-slate-800 placeholder:font-normal"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Detalles o Notas Extras</label>
                <textarea 
                  required
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Se instaló una llave nueva..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-slate-800"
                  rows={3}
                ></textarea>
              </div>

              <div className="pt-2">
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Evidencia (Fotografía)</label>
                <label htmlFor="evidence-upload" className="block border-2 border-dashed border-slate-300 rounded-xl p-6 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                  <p className="text-sm font-semibold text-indigo-600">Tomar foto o subir archivo</p>
                  <p className="text-xs text-slate-400 mt-1">Soporta JPG, PNG</p>
                  <input type="file" accept="image/*" capture="environment" className="hidden" id="evidence-upload" />
                </label>
              </div>

              <div className="mt-8 pt-4">
                <button 
                  type="submit" 
                  disabled={resolving}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70"
                >
                  {resolving ? "Procesando..." : (
                    <>
                      <CheckCircle2 className="h-6 w-6" /> Completar Trabajo
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
          
        </div>
      </div>
    </div>
  );
}
