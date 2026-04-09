"use client";

import { useAuth } from "@/components/AuthProvider";
import { AlertTriangle, CreditCard, Lock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SuspendedPage() {
  const { user, logout } = useAuth();
  
  if (!user) return null;

  const isOwner = user.role === 'OWNER' || user.role === 'MANAGER';

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-rose-500/30">
      
      {/* Glow effects background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20"></div>
      </div>

      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 relative z-10 shadow-2xl flex flex-col items-center text-center">
        
        {/* Animated Lock Icon */}
        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 border border-rose-500/20">
           <Lock className="w-10 h-10 text-rose-500" />
        </div>

        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Acceso Restringido</h1>
        
        {isOwner ? (
          <>
            <p className="text-slate-400 mb-8 font-medium">
              Hola, <span className="text-white">{user.name}</span>. Hemos detectado un saldo pendiente en tu membresía **MAJIA OS**. 
              Por motivos de seguridad, los servicios de cobro automáticos, portal de inquilinos y respuestas con Inteligencia Artificial del OmniChat se han pausado hasta regularizar la cuenta.
            </p>
            
            <div className="w-full bg-slate-800/50 rounded-2xl p-5 mb-8 border border-slate-700/50 text-left">
               <div className="flex items-center gap-3 mb-2 text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-bold text-sm">Servicios Suspendidos</span>
               </div>
               <ul className="text-sm text-slate-300 space-y-2 list-disc list-inside">
                  <li>Portal y autogestión de Inquilinos</li>
                  <li>Timbrado Automático de Facturación</li>
                  <li>WhatsApp OmniChat CRM</li>
               </ul>
            </div>

            <Button className="w-full h-14 bg-white text-slate-900 hover:bg-slate-200 font-bold text-lg rounded-xl mb-4 transition-all hover:scale-[1.02]">
              <CreditCard className="w-5 h-5 mr-3" />
              Regularizar Mensualidad
            </Button>
          </>
        ) : (
          <>
             <p className="text-slate-400 mb-8 font-medium">
              Hola, <span className="text-white">{user.name}</span>. El portal de pagos e inquilinos de tu arrendador se encuentra temporalmente en <strong>mantenimiento administrativo</strong>. 
              Por favor, ponte en contacto directo con tu casero o gerente para más detalles.
            </p>
          </>
        )}

        <button 
          onClick={logout}
          className="flex items-center justify-center gap-2 text-slate-500 hover:text-slate-300 transition-colors font-medium text-sm mt-4"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión de forma segura
        </button>

      </div>
      
      <div className="mt-12 text-slate-600 text-sm font-medium flex items-center gap-2">
         <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
         Sistema protegido por MAJIA OS
      </div>
    </div>
  );
}
