"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { CheckCircle2, Zap, Crown, ArrowRight, ShieldCheck, Box } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

interface AppTier {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  monthlyStamps: number;
  featuresJson: string[];
}

interface SoftwareApp {
  id: string;
  name: string;
  slug: string;
  description: string;
  tiers: AppTier[];
}

export default function M2MStorePage() {
  const [apps, setApps] = useState<SoftwareApp[]>([]);
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "ANNUAL">("MONTHLY");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    api.get("/v1/apps").then(res => {
      setApps(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const handleSubscribe = async (tier: AppTier, appName: string) => {
    if (!confirm(`¿Deseas enviar la solicitud para activar el plan ${tier.name} de ${appName}? Un administrador se pondrá en contacto para tu activación.`)) return;
    
    try {
      await api.post("/v1/apps/subscribe", { tierId: tier.id, billingCycle });
      alert("¡Solicitud enviada correctamente! Te hemos enviado la liga de pago por WhatsApp y Correo. Una vez liquidado, un administrador lo activará.");
    } catch (e) {
      alert("Hubo un error al procesar tu solicitud.");
    }
  };

  if (loading) return <div className="p-10 text-center animate-pulse text-indigo-500 font-bold">Cargando módulos empresariales...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      
      {/* Banner de Lealtad Exclusivo */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 rounded-2xl p-4 text-center mt-6 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-4 -mr-4 -mt-4 opacity-10 pointer-events-none"><Zap className="w-24 h-24" /></div>
         <p className="font-bold">¡Beneficio de Cliente RentControl Activo! 👑</p>
         <p className="text-sm font-medium opacity-90 mt-1">
           Los precios listados debajo ya incluyen tu <strong>20% de descuento automático</strong> por ser inquilino en nuestra red.
         </p>
      </div>
      
      {/* Header Estilo Premium */}
      <div className="text-center space-y-4 pt-8">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Potencia tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Agencia</span></h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">Lleva el control de RentControl al siguiente nivel añadiendo facturación electrónica nativa y atención al cliente impulsada por IA.</p>
        
        {/* Toggle Mensual / Anual */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <span className={`text-sm font-bold ${billingCycle === 'MONTHLY' ? 'text-slate-900' : 'text-slate-400'}`}>Mensual</span>
          <button 
            onClick={() => setBillingCycle(billingCycle === 'MONTHLY' ? 'ANNUAL' : 'MONTHLY')}
            className="w-14 h-7 bg-indigo-100 rounded-full flex items-center p-1 transition-all cursor-pointer relative"
          >
            <div className={`w-5 h-5 bg-indigo-600 rounded-full shadow-sm transition-transform duration-300 ${billingCycle === 'ANNUAL' ? 'translate-x-7 bg-indigo-600' : 'bg-slate-400'}`} />
          </button>
          <span className={`text-sm font-bold ${billingCycle === 'ANNUAL' ? 'text-slate-900' : 'text-slate-400'}`}>Anual <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full ml-1">Descuento</span></span>
        </div>
      </div>

      <div className="grid gap-12">
        {apps.map((app) => (
          <div key={app.id} className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-slate-100 relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 group-hover:bg-purple-50 group-hover:scale-150 transition-all duration-700 pointer-events-none" />
            
            <div className="relative z-10 block mb-8">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg text-white font-black text-2xl">
                  {app.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">{app.name}</h2>
                  <p className="text-slate-500 font-medium text-sm mt-1">{app.description}</p>
                </div>
              </div>
            </div>

            {/* Tiers / Ediciones */}
            <div className="grid md:grid-cols-3 gap-6 relative z-10">
              {app.tiers.map((tier, idx) => (
                <div key={tier.id} className={`flex flex-col rounded-3xl p-6 border transition-all hover:-translate-y-1 hover:shadow-xl ${idx === 1 ? 'border-indigo-500 shadow-lg relative bg-white' : 'border-slate-200 bg-slate-50 opacity-90 hover:opacity-100'}`}>
                  {idx === 1 && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-3.5 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">Mas Popular</div>
                  )}
                  
                  <div className="mb-4">
                    <h3 className={`text-lg font-black ${idx === 1 ? 'text-indigo-600' : 'text-slate-800'}`}>{tier.name}</h3>
                    
                    {/* Visual Pricing Engine (20% Off) */}
                    <div className="flex flex-col mt-2">
                       <span className="text-xs font-bold text-slate-400 line-through decoration-red-400/50 decoration-2">
                          Precio normal: ${billingCycle === 'ANNUAL' ? (tier.annualPrice / 12).toFixed(0) : tier.monthlyPrice} / mes
                       </span>
                       <div className="flex items-baseline gap-1 mt-1">
                         <span className="text-4xl font-black text-emerald-600">
                            ${billingCycle === 'ANNUAL' ? ((tier.annualPrice * 0.8) / 12).toFixed(0) : (tier.monthlyPrice * 0.8).toFixed(0)}
                         </span>
                         <span className="text-sm font-bold text-slate-400">/ mes</span>
                       </div>
                    </div>
                    {billingCycle === 'ANNUAL' && (
                       <p className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-2">
                          Facturado al año (${(tier.annualPrice * 0.8).toFixed(0)}) 
                       </p>
                    )}
                  </div>
                  
                  <div className="mb-6">
                     <p className="text-xs font-bold bg-slate-200 text-slate-700 py-1.5 px-3 rounded-lg inline-flex items-center gap-1">
                       <Box className="w-3.5 h-3.5" /> 
                       {tier.monthlyStamps === -1 ? 'Ilimitado' : `${tier.monthlyStamps} Timbres / Créditos al mes`}
                     </p>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {tier.featuresJson.map((feat: string, i: number) => (
                      <li key={i} className="flex gap-3 text-sm text-slate-600 font-medium items-start">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${idx === 1 ? 'text-indigo-500' : 'text-slate-400'}`} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <button 
                    onClick={() => handleSubscribe(tier, app.name)}
                    className={`w-full py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${idx === 1 ? 'bg-indigo-600 hover:bg-indigo-700 shadow-md text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`}
                  >
                    Activar Módulo <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
