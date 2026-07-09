"use client";

import { useState, useEffect } from "react";
import { Plus, Zap, ArrowRight, Trash2, Power } from "lucide-react";
import axios from "axios";

export default function AutomationsPage() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Formularios
  const [name, setName] = useState("");
  const [triggerApp, setTriggerApp] = useState("FACTURAPRO");
  const [triggerEvent, setTriggerEvent] = useState("INVOICE_PAID");
  const [actionApp, setActionApp] = useState("OMNICHAT");
  const [actionType, setActionType] = useState("SEND_WHATSAPP");
  const [actionTemplate, setActionTemplate] = useState("Hola {{customerName}}, hemos recibido tu pago de $\{{amount}} exitosamente. ¡Gracias!");

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const activeCid = localStorage.getItem('activeCompanyId') || "GENERAL";
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/automations?companyId=${activeCid}`);
      setRules(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const activeCid = localStorage.getItem('activeCompanyId') || "GENERAL";
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/automations`, {
        name,
        triggerApp,
        triggerEvent,
        actionApp,
        actionType,
        actionTemplate,
        companyId: activeCid,
        isActive: true
      });
      setIsModalOpen(false);
      fetchRules();
    } catch (e) {
      console.error(e);
      alert("Error guardando regla");
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("¿Borrar esta regla?")) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/automations/${id}`);
      fetchRules();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8">Cargando Motor...</div>;

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Zap className="h-6 w-6 text-amber-500" />
            Automatizaciones (Magia OS)
          </h1>
          <p className="text-slate-500 text-sm mt-1">Conecta tus aplicaciones para que trabajen solas.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700">
          <Plus className="w-4 h-4" /> Nuevo Zap
        </button>
      </div>

      <div className="grid gap-4">
        {rules.map((r: any) => (
          <div key={r.id} className="bg-white border border-slate-200 p-5 rounded-xl flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center justify-center bg-slate-100 rounded-full h-12 w-12 text-slate-500">
                <Power className={`w-5 h-5 ${r.isActive ? 'text-green-500' : 'text-slate-400'}`} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{r.name}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 font-mono bg-slate-50 p-1.5 rounded-lg border border-slate-100 inline-flex">
                  <span className="text-indigo-600 font-bold">{r.triggerApp}</span> ({r.triggerEvent})
                  <ArrowRight className="w-3 h-3 text-slate-300" />
                  <span className="text-emerald-600 font-bold">{r.actionApp}</span> ({r.actionType})
                </div>
              </div>
            </div>
            <button onClick={() => handleDelete(r.id)} className="text-red-400 hover:text-red-600 p-2">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
        {rules.length === 0 && (
          <div className="text-center p-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <Zap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-bold">No tienes automatizaciones activas</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-xl">
            <h2 className="text-xl font-bold mb-6">Nueva Automatización</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre interno</label>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full border rounded-lg p-2" placeholder="Ej. Agradecimiento de Pago" />
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="col-span-2"><p className="text-xs font-bold text-indigo-600 uppercase">1. CUANDO OCURRA ESTO:</p></div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Aplicación Origen</label>
                  <select value={triggerApp} onChange={e => setTriggerApp(e.target.value)} className="w-full border rounded-lg p-2 text-sm">
                    <option value="FACTURAPRO">FacturaPro</option>
                    <option value="RENTCONTROL">RentControl</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Evento</label>
                  <select value={triggerEvent} onChange={e => setTriggerEvent(e.target.value)} className="w-full border rounded-lg p-2 text-sm">
                    <option value="INVOICE_PAID">Factura Pagada</option>
                    <option value="TICKET_RESOLVED">Ticket Resuelto</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="col-span-2"><p className="text-xs font-bold text-emerald-600 uppercase">2. ENTONCES HAZ ESTO:</p></div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Aplicación Destino</label>
                  <select value={actionApp} onChange={e => setActionApp(e.target.value)} className="w-full border rounded-lg p-2 text-sm">
                    <option value="OMNICHAT">OmniChat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Acción</label>
                  <select value={actionType} onChange={e => setActionType(e.target.value)} className="w-full border rounded-lg p-2 text-sm">
                    <option value="SEND_WHATSAPP">Enviar WhatsApp</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Plantilla de Mensaje</label>
                <textarea 
                  value={actionTemplate} 
                  onChange={e => setActionTemplate(e.target.value)} 
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm h-32 focus:ring-2 focus:ring-indigo-500 outline-none" 
                  placeholder="Escribe tu mensaje aquí usando variables..."
                />
                
                {/* Available Variables Section */}
                <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-3">
                   <p className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1">
                     <Zap className="w-3 h-3 text-amber-500"/> Variables Disponibles
                   </p>
                   <div className="flex flex-wrap gap-2">
                     <span className="text-[10px] font-mono bg-indigo-100 text-indigo-700 px-2 py-1 rounded cursor-pointer hover:bg-indigo-200" onClick={() => setActionTemplate(prev => prev + ' {{customerName}}')}>
                       {`{{customerName}}`}
                     </span>
                     <span className="text-[10px] font-mono bg-emerald-100 text-emerald-700 px-2 py-1 rounded cursor-pointer hover:bg-emerald-200" onClick={() => setActionTemplate(prev => prev + ' {{amount}}')}>
                       {`{{amount}}`}
                     </span>
                     <span className="text-[10px] font-mono bg-blue-100 text-blue-700 px-2 py-1 rounded cursor-pointer hover:bg-blue-200" onClick={() => setActionTemplate(prev => prev + ' {{invoiceNumber}}')}>
                       {`{{invoiceNumber}}`}
                     </span>
                     <span className="text-[10px] font-mono bg-purple-100 text-purple-700 px-2 py-1 rounded cursor-pointer hover:bg-purple-200" onClick={() => setActionTemplate(prev => prev + ' {{phone}}')}>
                       {`{{phone}}`}
                     </span>
                   </div>
                   <p className="text-[10px] text-slate-400 mt-2">Haz clic en una variable para insertarla en tu mensaje. El motor las reemplazará automáticamente con datos reales del evento.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-lg">Cancelar</button>
              <button onClick={handleSave} className="px-4 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">Crear Regla</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
