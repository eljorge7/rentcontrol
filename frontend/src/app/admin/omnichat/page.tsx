"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Plus, Server, Key, Users, MessageSquareText, Copy, AlertCircle, Loader2 } from "lucide-react";

export default function OmniChatMasterPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New Company State
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await api.get("/omnichat/companies");
      setCompanies(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newName || !newEmail) return;
    setCreating(true);
    try {
      const payload = { name: newName, email: newEmail, password: newPassword || undefined };
      await api.post("/omnichat/companies", payload);
      setShowModal(false);
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      fetchCompanies();
    } catch (e) {
      alert("Error al crear la cuenta en OmniChat.");
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copiado al portapapeles!");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Server className="h-8 w-8 text-indigo-600" />
              Bóveda OmniChat (CRM SaaS)
            </h1>
            <p className="text-slate-500 font-medium mt-1">Supervisa y aprovisiona instancias de WhatsApp para tus clientes.</p>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2">
            <Plus className="h-5 w-5" /> Nueva Empresa
          </button>
        </div>

        {/* Cajas de Infraestructura */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-3 text-slate-500 mb-2 font-bold uppercase text-xs tracking-wider">
               <Server className="h-4 w-4" /> Servidor API
             </div>
             <p className="text-2xl font-black text-slate-900">En Línea</p>
             <p className="text-emerald-500 font-medium text-sm">Puerto 3002 Autónomo</p>
           </div>
           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-3 text-slate-500 mb-2 font-bold uppercase text-xs tracking-wider">
               <Users className="h-4 w-4" /> Clientes B2B
             </div>
             <p className="text-2xl font-black text-slate-900">{companies.length} Instancias</p>
             <p className="text-indigo-500 font-medium text-sm">Activas en Postgres</p>
           </div>
        </div>

        {/* Tabla Master */}
        <div className="bg-white border text-sm border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="font-bold text-slate-600 p-4">Empresa (Tenant)</th>
                <th className="font-bold text-slate-600 p-4">Master API Key</th>
                <th className="font-bold text-slate-600 p-4 text-right">Métricas</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} className="text-center p-10"><Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500" /></td></tr>
              ) : companies.map(c => (
                <tr key={c.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-slate-900">{c.name}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                       <code className="bg-slate-100 text-xs font-mono text-slate-500 px-2 py-1 rounded border border-slate-200">
                         {c.apiKey}
                       </code>
                       <button onClick={() => copyToClipboard(c.apiKey)} className="text-slate-400 hover:text-indigo-500">
                         <Copy className="h-4 w-4" />
                       </button>
                    </div>
                  </td>
                  <td className="p-4 text-right font-medium text-slate-500 flex justify-end gap-4">
                    <span className="flex items-center gap-1"><Users className="h-4 w-4 text-slate-400" /> {c._count.contacts} Leads</span>
                    <span className="flex items-center gap-1"><Users className="h-4 w-4 text-slate-400" /> {c._count.users} Agentes</span>
                  </td>
                </tr>
              ))}
              {companies.length === 0 && !loading && (
                <tr><td colSpan={3} className="text-center p-10 text-slate-500">No hay clientes aprovisionados en OmniChat.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal de Aprovisionamiento */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
               <div className="p-6 border-b border-slate-100 bg-slate-50">
                 <h2 className="text-xl font-black text-slate-900">Aprovisionar Cliente OmniChat</h2>
                 <p className="text-sm text-slate-500 mt-1">Esto ejecutará comandos remotos en el Gateway de Mensajería para crear sus bases de datos.</p>
               </div>
               <div className="p-6 space-y-4">
                 <div>
                   <label className="block text-sm font-bold text-slate-700 mb-1">Nombre Comercial (SaaS)</label>
                   <input type="text" value={newName} onChange={e => setNewName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 font-medium" placeholder="Ej. Taller Los Amigos" />
                 </div>
                 <div>
                   <label className="block text-sm font-bold text-slate-700 mb-1">Email del Administrador (Cliente)</label>
                   <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 font-medium" placeholder="admin@taller.com" />
                 </div>
                 <div>
                   <label className="block text-sm font-bold text-slate-700 mb-1">Contraseña (Opcional)</label>
                   <input type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 font-medium" placeholder="(Generada automáticamente si se deja vacío)" />
                 </div>

                 <div className="bg-amber-50 p-4 rounded-xl flex items-start gap-3 mt-4 border border-amber-200/50">
                   <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                   <p className="text-xs font-medium text-amber-700">Se le cobrará la tarifa recurrente en USD a partir de hoy si tienes la automatización de Stripe activada en tu ecosistema.</p>
                 </div>
               </div>
               <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                 <button onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors">Cancelar</button>
                 <button onClick={handleCreate} disabled={creating} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2">
                   {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Server className="h-4 w-4" />} Aprovisionar Bóveda
                 </button>
               </div>
            </div>
          </div>
        )}
      </div>
  );
}
