"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { AlertCircle, Trash2, Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AnnouncementsAdminPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [message, setMessage] = useState("");
  const [targetRole, setTargetRole] = useState("ALL");
  const [type, setType] = useState("INFO");

  const fetchData = async () => {
    try {
      const res = await api.get('/announcements/system');
      setAnnouncements(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePost = async () => {
    if (!message.trim()) return alert("Por favor escribe un mensaje.");
    try {
      await api.post('/announcements/system', { message, targetRole, type });
      setMessage("");
      fetchData();
    } catch (e) {
       alert("Error al publicar aviso.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Deseas eliminar este aviso permanentemente?")) return;
    try {
      await api.delete(`/announcements/system/${id}`);
      fetchData();
    } catch (e) {
      alert("Error al eliminar.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Centro de Avisos (Broadcast)</h1>
          <p className="text-slate-500 mt-1">Publica mensajes globales en el Dashboard de tus inquilinos, dueños y gestores.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-500" /> Redactar Nuevo Aviso
        </h2>
        
        <div className="space-y-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ej. El día viernes habrá mantenimiento en los servidores de Internet de 2 AM a 4 AM..."
            className="w-full min-h-[100px] border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />

          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
             <div className="flex gap-4 w-full sm:w-auto">
               <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Público Destino</label>
                  <select 
                    value={targetRole} 
                    onChange={e => setTargetRole(e.target.value)}
                    className="border border-slate-300 rounded-lg p-2 text-sm bg-white"
                  >
                     <option value="ALL">Todos (Global)</option>
                     <option value="TENANT">Inquilinos</option>
                     <option value="OWNER">Propietarios</option>
                     <option value="MANAGER">Gestores (Agencia)</option>
                  </select>
               </div>
               <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Color / Urgencia</label>
                  <select 
                    value={type} 
                    onChange={e => setType(e.target.value)}
                    className="border border-slate-300 rounded-lg p-2 text-sm bg-white"
                  >
                     <option value="INFO">Informativo (Azul)</option>
                     <option value="MAINTENANCE">Mantenimiento (Naranja)</option>
                     <option value="ALERT">Alerta Crítica (Rojo)</option>
                     <option value="PROMO">Promoción (Verde)</option>
                  </select>
               </div>
             </div>

             <Button onClick={handlePost} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 h-10 px-6">
                <Send className="w-4 h-4 mr-2" /> Publicar Aviso
             </Button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
         <h3 className="font-semibold text-slate-700 text-sm">Historial de Publicaciones</h3>
         {loading ? (
            <p className="text-sm text-slate-500">Cargando...</p>
         ) : announcements.length === 0 ? (
            <div className="text-center p-8 border border-dashed border-slate-300 rounded-xl text-slate-500">No hay avisos publicados.</div>
         ) : (
            announcements.map(ann => (
              <div key={ann.id} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-start gap-4 hover:shadow-sm transition-all">
                <div className="flex gap-3 items-start flex-1">
                   <div className={`p-2 rounded-lg shrink-0 mt-1
                     ${ann.type === 'INFO' ? 'bg-blue-100 text-blue-600' : ''}
                     ${ann.type === 'MAINTENANCE' ? 'bg-orange-100 text-orange-600' : ''}
                     ${ann.type === 'ALERT' ? 'bg-red-100 text-red-600' : ''}
                     ${ann.type === 'PROMO' ? 'bg-emerald-100 text-emerald-600' : ''}
                   `}>
                      <AlertCircle className="w-5 h-5" />
                   </div>
                   <div>
                     <div className="flex gap-2 items-center mb-1">
                        <span className="font-semibold text-slate-800 text-sm uppercase">{ann.type}</span>
                        <span className="text-xs font-medium text-slate-500">• {new Date(ann.createdAt).toLocaleString()}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">Destino: {ann.targetRole}</span>
                     </div>
                     <p className="text-slate-700 text-sm">{ann.message}</p>
                   </div>
                </div>
                <button onClick={() => handleDelete(ann.id)} className="text-slate-400 hover:text-red-500 p-2 shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
         )}
      </div>
    </div>
  );
}
