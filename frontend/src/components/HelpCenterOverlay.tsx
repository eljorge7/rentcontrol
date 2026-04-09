"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { HelpCircle, X, Headphones, Search, PlusCircle, CreditCard, PenTool, ChevronDown, Wrench } from "lucide-react";

export default function HelpCenterOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const pathname = usePathname();

  // No mostrar en rutas públicas (login, registro, landing page, links publicos de factura)
  if (pathname.includes('/login') || pathname.includes('/registro') || pathname === '/' || pathname.includes('/quote') || pathname.includes('/ticket')) {
    return null;
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-105 z-[90] group flex items-center justify-center animate-in zoom-in"
      >
         <HelpCircle className="w-6 h-6" />
         <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:ml-3 transition-all duration-300 ease-in-out font-bold">
           Centro de Ayuda
         </span>
      </button>
    );
  }

  const faqs = [
    {
      id: 1,
      icon: <PlusCircle className="w-5 h-5 text-blue-500" />,
      question: "¿Cómo doy de alta a un Inquilino?",
      answer: "Ve a la pestaña 'Inquilinos' en tu menú lateral. Haz clic en 'Añadir Inquilino'. Primero debes llenar sus datos de contacto y luego, obligatoriamente, asignarlo a una Propiedad/Unidad para que el sistema le genere su portal de Autogestión."
    },
    {
      id: 2,
      icon: <CreditCard className="w-5 h-5 text-emerald-500" />,
      question: "¿Cómo se le cobra la renta mensualmente?",
      answer: "No tienes que hacer nada manual. Al momento en que vinculas a un inquilino con un 'Contrato' (Lease), el servidor Grupo Hurtado genera automáticamente sus recargos cada inicio de mes y le manda recordatorios por WhatsApp vía OmniChat."
    },
    {
      id: 3,
      icon: <Wrench className="w-5 h-5 text-amber-500" />,
      question: "¿Cómo funcionan los tickets de proveedores?",
      answer: "El Inquilino le manda un WhatsApp a tu número quejándose de alguna falla. Nuestro bot IA procesará el problema, creará el ticket en esta plataforma y tú podrás enviarle un link web a tu técnico (Plomero/Herrero) para que suba fotos de la reparación sin necesidad de tener cuenta."
    },
    {
      id: 4,
      icon: <PenTool className="w-5 h-5 text-purple-500" />,
      question: "¿Cómo cobro el servicio de Internet y Rentas al mismo tiempo?",
      answer: "Si el inquilino contrata internet de RadioTec, simplemente añade el cargo en su Contrato con el tipo 'INTERNET'. Se sumará dentro del mismo recibo mensual en su portal junto a la Renta."
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex justify-end p-4 sm:p-6 font-sans">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={() => setIsOpen(false)}
      />
      <div className="relative w-full max-w-md bg-white h-full self-end rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-right-8 duration-300">
        
        {/* Header Elegante */}
        <div className="bg-slate-900 p-8 text-white relative shrink-0">
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="bg-blue-600/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-blue-400">
            <Headphones className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black tracking-tight mb-2">Base de Conocimiento</h2>
          <p className="text-slate-400 text-sm font-medium">Encuentra respuestas rápidas sobre cómo operar el Ecosistema Grupo Hurtado.</p>
        </div>

        {/* Búsqueda (Visual only) */}
        <div className="px-6 -mt-5 relative z-10 shrink-0">
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-2 flex items-center gap-2">
                <Search className="w-5 h-5 text-slate-400 ml-2" />
                <input 
                  type="text" 
                  readOnly 
                  placeholder="¿Cómo cobrar recargos?" 
                  className="w-full text-sm font-medium focus:outline-none placeholder:text-slate-300 text-slate-700 bg-transparent"
                />
            </div>
        </div>

        {/* Content (Accordion) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {faqs.map((faq) => (
               <div 
                 key={faq.id} 
                 className={`border rounded-2xl transition-all duration-300 overflow-hidden cursor-pointer ${
                    expandedId === faq.id ? 'border-blue-200 bg-blue-50/50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'
                 }`}
                 onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
               >
                  <div className="p-4 flex items-center gap-4">
                     <div className="bg-white p-2 rounded-xl border border-slate-100 shrink-0">
                        {faq.icon}
                     </div>
                     <h3 className="font-bold text-slate-800 text-sm flex-1">{faq.question}</h3>
                     <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 shrink-0 ${expandedId === faq.id ? 'rotate-180 text-blue-500' : ''}`} />
                  </div>
                  
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out px-4 ${expandedId === faq.id ? 'max-h-48 pb-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                     <div className="pt-2 border-t border-blue-100 pl-14">
                        <p className="text-sm text-slate-600 font-medium leading-relaxed">{faq.answer}</p>
                     </div>
                  </div>
               </div>
            ))}
            
            <div className="mt-8 bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center">
                <h4 className="font-bold text-slate-800 mb-2">¿Problemas Técnicos Graves?</h4>
                <p className="text-sm text-slate-500 mb-4 font-medium">Si el sitio se cae o la IA envía mensajes erróneos, contáctanos directo.</p>
                <a href="mailto:soporte@radiotecpro.com" className="bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold w-full inline-flex justify-center transition-colors shadow-lg active:scale-95 mb-3">
                   Soporte Nivel 3 
                </a>
                <button onClick={() => setIsOpen(false)} className="bg-white border-2 border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold w-full inline-flex justify-center transition-colors active:scale-95 text-center flex items-center justify-center gap-2">
                   <X className="w-4 h-4" /> Cerrar Centro de Ayuda
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}
