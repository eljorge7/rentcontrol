"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Camera, CheckCircle2, ChevronRight, AlertCircle, Wrench } from "lucide-react";
import axios from "axios";

export default function SupplierJobPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [cost, setCost] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/incidents/public/${id}`);
      setTicket(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      if (f.type.startsWith("image/")) {
        setFilePreview(URL.createObjectURL(f));
      }
    }
  };

  const handleSubmit = async () => {
    if (!cost) return alert("Debes ingresar el costo de tus servicios.");
    setSubmitting(true);
    try {
      // 1. Opcionalmente podríamos subir la foto a S3 o usar base64 para rápido
      let evidenceUrl = "";
      if (filePreview) {
        // En un mundo real mandaríamos multipart, simulamos guardarlo vacío
        evidenceUrl = `uploaded_evidence_${Date.now()}.png`; 
      }

      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/incidents/public/${id}/resolve`, {
         cost: parseFloat(cost),
         supplierNotes: notes,
         evidenceUrl
      });
      setSuccess(true);
    } catch (e) {
      console.error(e);
      alert("Error guardando el reporte. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;
  if (!ticket) return <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center text-center"><AlertCircle className="w-12 h-12 text-rose-500 mb-4" /><h1 className="text-xl font-bold text-slate-800">Orden no encontrada</h1><p className="text-slate-500 mt-2">El enlace ha caducado o el ticket ya fue procesado.</p></div>;

  if (success) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-emerald-100 p-4 rounded-full mb-6">
        <CheckCircle2 className="w-16 h-16 text-emerald-600" />
      </div>
      <h1 className="text-2xl font-black text-slate-900 mb-2">¡Reporte Enviado!</h1>
      <p className="text-slate-600 font-medium max-w-sm mb-8">La administración ha recibido tu comprobante de terminación. El pago será procesado a la brevedad.</p>
      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Gracias por trabajar con Grupo Hurtado</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 pb-12 font-sans">
      {/* App Header */}
      <div className="bg-slate-900 pt-12 pb-6 px-6 text-white rounded-b-[2.5rem] shadow-lg sticky top-0 z-10">
         <div className="flex items-center gap-3 opacity-80 mb-4">
           <Wrench className="w-5 h-5" />
           <span className="text-xs font-bold tracking-widest uppercase">Orden de Trabajo</span>
         </div>
         <h1 className="text-3xl font-black tracking-tight leading-tight mb-2">Reporte de Terminación</h1>
         <p className="text-slate-400 text-sm font-medium">Ticket #{ticket.id.substring(0,8).toUpperCase()}</p>
      </div>

      <div className="px-5 -mt-6 relative z-20 space-y-4">
         {/* Detail Card */}
         <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
           <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Detalles del Servicio</h2>
           
           <div className="space-y-4">
             <div>
               <p className="text-xs text-slate-500 mb-1">Edificio / Ubicación</p>
               <p className="text-sm font-bold text-slate-900">{ticket.unit?.property?.name} - {ticket.unit?.name}</p>
               <p className="text-xs text-slate-500 mt-1">{ticket.unit?.property?.address}</p>
             </div>
             <div className="pt-4 border-t border-slate-100">
               <p className="text-xs text-slate-500 mb-1">Problema Reportado</p>
               <p className="text-sm font-medium text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">{ticket.description}</p>
             </div>
           </div>
         </div>

         {/* Action Card */}
         {ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? (
            <div className="bg-emerald-50 rounded-3xl p-6 text-center border border-emerald-100">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <h3 className="font-bold text-emerald-900 mb-1">Trabajo Finalizado</h3>
              <p className="text-xs text-emerald-700">Esta orden de trabajo ya fue reportada como concluida.</p>
            </div>
         ) : (
           <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
             <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">Prueba de Término</h2>
             
             <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Foto de Evidencia</label>
                  {filePreview ? (
                    <div className="relative group rounded-2xl overflow-hidden border border-slate-200">
                      <img src={filePreview} alt="Evidencia" className="w-full h-48 object-cover" />
                      <button onClick={() => {setFile(null); setFilePreview(null);}} className="absolute top-2 right-2 bg-slate-900/50 text-white rounded-full p-2 backdrop-blur-md text-xs font-bold">Cambiar</button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                      <Camera className="w-8 h-8 text-slate-400 mb-2" />
                      <span className="text-sm font-medium text-slate-600">Tomar Foto (Opcional)</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Costo Total del Servicio ($)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input 
                      type="number" 
                      value={cost} onChange={e => setCost(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50 text-lg font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all placeholder:font-medium placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Notas Rápidas</label>
                  <textarea 
                    value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="Se cambió la tubería de 3/4..."
                    className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all resize-none h-24"
                  />
                </div>

                <button 
                  onClick={handleSubmit}
                  disabled={submitting || !cost}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 px-6 rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Procesando...' : 'Enviar Reporte para Pago'} <ChevronRight className="w-5 h-5" />
                </button>
             </div>
           </div>
         )}
      </div>
    </div>
  );
}
