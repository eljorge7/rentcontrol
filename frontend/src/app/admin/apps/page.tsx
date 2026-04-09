"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Layers, Zap, DollarSign, Activity, CheckCircle2, Settings } from "lucide-react";

interface UserSubscription {
  id: string;
  userId: string;
  user: { name: string, email: string };
  tier: { name: string, app: { name: string } };
  status: string;
  billingCycle: string;
  availableStamps: number;
  nextBillingDate: string;
}

export default function AdminAppStorePage() {
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/v1/apps/admin/subscriptions")
      .then(res => {
        setSubscriptions(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.post(`/v1/apps/admin/subscriptions/${id}`, { status: newStatus });
      setSubscriptions(subscriptions.map(s => s.id === id ? { ...s, status: newStatus } : s));
      alert(`Suscripción actualizada a ${newStatus} y sincronizada exitosamente con la aplicación M2M.`);
    } catch (e) {
       console.error(e);
       alert("Error sincronizando");
    }
  };

  const addStamps = async (id: string, currentStamps: number) => {
     let additional = prompt(`Añadir timbres a esta bolsa (Stamps actuales: ${currentStamps}). Ingresa la cantidad:`, "50");
     if (!additional) return;
     const newStamps = currentStamps === -1 ? parseInt(additional) : currentStamps + parseInt(additional);
     if(isNaN(newStamps)) return;
     try {
       await api.post(`/v1/apps/admin/subscriptions/${id}`, { availableStamps: newStamps });
       setSubscriptions(subscriptions.map(s => s.id === id ? { ...s, availableStamps: newStamps } : s));
       alert(`Se abonaron timbres exitosamente, FacturaPro ha recibido el webhook.`);
     } catch(e) {
       console.error(e);
     }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">App Store & Módulos (Master)</h2>
        <p className="text-slate-500">Supervisa las suscripciones SaaS de tus clientes a módulos externos (FacturaPro, OmniChat).</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl rounded-2xl">
           <CardContent className="p-6">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                 <Layers size={24} />
               </div>
               <div>
                 <p className="text-sm font-bold text-slate-500">Módulos Activos</p>
                 <p className="text-2xl font-black text-slate-900">2</p>
               </div>
             </div>
           </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl rounded-2xl">
           <CardContent className="p-6">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                 <Users size={24} />
               </div>
               <div>
                 <p className="text-sm font-bold text-slate-500">Suscripciones M2M</p>
                 <p className="text-2xl font-black text-slate-900">{subscriptions.length}</p>
               </div>
             </div>
           </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="p-10 text-center animate-pulse py-20 text-indigo-500">Cargando métricas de suscripciones...</div>
      ) : (
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl rounded-[2rem] overflow-hidden">
          <CardHeader className="border-b border-slate-100/50 pb-6 bg-slate-50/50">
             <CardTitle className="text-lg font-bold">Estado de Suscripciones Clientes</CardTitle>
             <CardDescription>Visualiza las suscripciones de los rentadores/gestores a tus herramientas satélite.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {subscriptions.length === 0 ? (
              <div className="p-8 text-center text-slate-500 italic">No hay suscripciones activas aún.</div>
            ) : (
              <table className="w-full text-sm text-left text-slate-600">
                <thead className="bg-slate-50/50 text-slate-500 font-medium border-b border-slate-100 uppercase text-xs tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Cliente</th>
                    <th className="px-6 py-4">App / Módulo</th>
                    <th className="px-6 py-4">Edición</th>
                    <th className="px-6 py-4">Ciclo de Pago</th>
                    <th className="px-6 py-4 text-center">Timbres</th>
                    <th className="px-6 py-4 text-center">Estado</th>
                    <th className="px-6 py-4 text-right">M2M Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {subscriptions.map(sub => (
                     <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                       <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{sub.user.name}</p>
                          <p className="text-xs text-slate-500">{sub.user.email}</p>
                       </td>
                       <td className="px-6 py-4 font-black text-indigo-600">
                         {sub.tier.app.name}
                       </td>
                       <td className="px-6 py-4 font-medium text-slate-700">
                         {sub.tier.name}
                       </td>
                       <td className="px-6 py-4 text-xs font-bold text-slate-500">
                          {sub.billingCycle === 'ANNUAL' ? 'ANUAL' : 'MENSUAL'}
                          <p className="text-[10px] text-slate-400 font-normal">Renueva: {new Date(sub.nextBillingDate).toLocaleDateString()}</p>
                       </td>
                       <td className="px-6 py-4 text-center">
                          <span className="bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-full text-xs">
                            {sub.availableStamps === -1 ? 'Ilimitado' : sub.availableStamps}
                          </span>
                       </td>
                       <td className="px-6 py-4 text-center">
                          {sub.status === 'ACTIVE' && <span className="bg-emerald-100 text-emerald-700 font-bold px-3 py-1 rounded-full text-[10px] tracking-wider uppercase flex items-center justify-center gap-1 w-max mx-auto"><CheckCircle2 className="w-3 h-3" /> Activo</span>}
                          {sub.status !== 'ACTIVE' && <span className="bg-amber-100 text-amber-700 font-bold px-3 py-1 rounded-full text-[10px] tracking-wider uppercase">{sub.status}</span>}
                       </td>
                       <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <button onClick={() => updateStatus(sub.id, sub.status)} className={`text-xs font-bold px-3 py-1 rounded shadow-sm text-white ${sub.status === 'ACTIVE' ? 'bg-red-500 hover:bg-red-600' : 'bg-[#10b981] hover:bg-emerald-600'}`}>
                               {sub.status === 'ACTIVE' ? 'Suspender' : 'Aprobar'}
                             </button>
                             {sub.tier.app.name === 'FacturaPro' && (
                                <button onClick={() => addStamps(sub.id, sub.availableStamps)} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1 rounded shadow-sm">
                                  + Timbres
                                </button>
                             )}
                          </div>
                       </td>
                     </tr>
                   ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
