import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

interface AppStoreBannerProps {
  role: "owner" | "tenant";
}

export function AppStoreBanner({ role }: AppStoreBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-900 p-8 shadow-2xl mt-6 group">
      {/* Glow Effects */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-40 group-hover:bg-purple-500 group-hover:scale-150 transition-all duration-700 pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500 rounded-full blur-[80px] opacity-30 group-hover:bg-indigo-600 group-hover:scale-150 transition-all duration-700 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-white space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold tracking-wider text-emerald-100 uppercase">Beneficio Exclusivo M2M</span>
          </div>
          
          <h3 className="text-3xl font-black tracking-tight leading-tight">
            Digitaliza tu negocio con <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">FacturaPro</span>
          </h3>
          
          <p className="text-slate-300 font-medium leading-relaxed">
            Como usuario activo de RadioTec {role === 'owner' ? 'Propietarios' : 'Inquilinos'}, tienes acceso prioritario 
            a nuestra App Store empresarial. Activa la emisión de recibos y el módulo de control de gastos contables con un 
            <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded ml-1.5 font-bold">20% de Descuento Vitalicio</span>.
          </p>
        </div>

        <div className="w-full md:w-auto shrink-0 flex flex-col items-center gap-3">
          <Link 
            href={`/${role}/store`}
            className="w-full md:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-indigo-900 rounded-xl font-black shadow-xl shadow-black/20 flex items-center justify-center gap-3 transition-transform hover:-translate-y-1"
          >
            Canjear Beneficio <ArrowRight className="w-5 h-5" />
          </Link>
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
             Instalación Instantánea
          </span>
        </div>
      </div>
    </div>
  );
}
