"use client";

import { useState } from "react";
import { HelpCircle, X, BookOpen, Users, DollarSign, MessageSquare, ChevronRight, Wrench } from "lucide-react";

export default function HelpCenterOverlay() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-105 z-50 group flex items-center justify-center"
      >
         <HelpCircle className="w-6 h-6" />
         <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:ml-3 transition-all duration-300 ease-in-out font-bold">
           Centro de Ayuda
         </span>
      </button>
    );
  }

  const guides = [
    {
      icon: <Users className="w-5 h-5 text-blue-500" />,
      title: "1. Registrar Inquilinos",
      desc: "Ve a la sección 'Inquilinos', haz click en 'Añadir' y asígnales una Unidad. Esto les generará acceso al portal.",
      href: "/admin/tenants"
    },
    {
      icon: <DollarSign className="w-5 h-5 text-emerald-500" />,
      title: "2. Cobranza Mensual",
      desc: "Al crear un nuevo Contrato, los cargos se automatizan cada mes. El inquilino recibe un WhatsApp de la IA.",
      href: "/admin/leases"
    },
    {
      icon: <Wrench className="w-5 h-5 text-amber-500" />,
      title: "3. Red de Proveedores",
      desc: "Si un inquilino reporta un daño por WhatsApp, la IA crea un Ticket. Tú solo lo asignas a tu plomero.",
      href: "/admin/incidents"
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-indigo-500" />,
      title: "4. OmniChat B2B",
      desc: "Para configurar tu WhatsApp, ve a OmniChat y escanea el QR. La IA tomará el control automáticamente.",
      href: "https://omnichat.radiotecpro.com" 
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end p-4 sm:p-6 mb-4">
      <div 
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />
      <div className="relative w-full max-w-sm bg-white h-full max-h-[85vh] self-end rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans animate-in slide-in-from-bottom-10 fade-in duration-300">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white shrink-0 relative">
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-black tracking-tight">Centro de Ayuda</h2>
          </div>
          <p className="text-slate-400 text-sm font-medium">Guía Rápida para dominar el Ecosistema Hurtado.</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-2">
           <div className="space-y-2 p-2">
             {guides.map((g, idx) => (
                <a key={idx} href={g.href} onClick={() => setIsOpen(false)} className="block bg-slate-50 border border-slate-100 p-4 rounded-2xl hover:bg-white hover:shadow-md transition-all group cursor-pointer relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-1 h-full bg-slate-200 group-hover:bg-blue-500 transition-colors" />
                   <div className="flex gap-4 items-start pl-2">
                     <div className="bg-white p-2 rounded-xl shadow-sm ring-1 ring-slate-100 flex-shrink-0">
                       {g.icon}
                     </div>
                     <div>
                       <h3 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-blue-700 transition-colors flex items-center gap-1">{g.title} <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -ml-2 group-hover:ml-0" /></h3>
                       <p className="text-xs text-slate-500 leading-relaxed font-medium">{g.desc}</p>
                     </div>
                   </div>
                </a>
             ))}
           </div>
           
           <div className="p-4 mt-2">
             <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
                <h4 className="text-sm font-bold text-blue-900 mb-2">¿Soporte Técnico?</h4>
                <p className="text-xs text-blue-700 font-medium mb-4">El equipo de ingeniería de Antigravity está monitoreando la infraestructura 24/7.</p>
                <a href="mailto:soporte@radiotecpro.com" className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded-xl inline-flex items-center gap-2 transition-colors">
                  Contactar Soporte <ChevronRight className="w-4 h-4" />
                </a>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
