"use client";

import { useState, useEffect } from "react";
import { Building2, MessageSquare, DollarSign, Wallet, ArrowRight, Check } from "lucide-react";

export default function WelcomeTourModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Truco: Para forzar el tour al purgar localStorage durante pruebas
  // localStorage.removeItem('rentcontrol_tour_seen')
  
  useEffect(() => {
    // Retraso de 1 segundo post-login para la elegancia de la animación
    const timer = setTimeout(() => {
      if (!localStorage.getItem("rentcontrol_tour_seen")) {
        setIsOpen(true);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleFinish = () => {
    localStorage.setItem("rentcontrol_tour_seen", "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const slides = [
    {
      icon: <Building2 className="w-16 h-16 text-blue-500 mx-auto" />,
      title: "Bienvenido a Grupo Hurtado OS",
      description: "La plataforma definitiva donde todos los hilos de tus bienes raíces y telecomunicaciones se conectan. Automatiza todo, para que operes nada."
    },
    {
      icon: <DollarSign className="w-16 h-16 text-emerald-500 mx-auto" />,
      title: "Cobranza en Autopiloto",
      description: "Genera el contrato de un inquilino y la magia comienza. Cada 30 días, el sistema calcula recargos y le avisa en automático por WhatsApp."
    },
    {
      icon: <MessageSquare className="w-16 h-16 text-indigo-500 mx-auto" />,
      title: "Soporte de Inteligencia Artificial",
      description: "Tus inquilinos hablan directo con la IA (OmniChat). Si reportan una fuga de agua, el bot crea la alerta técnica en este mismo portal sin interrumpirte."
    },
    {
      icon: <Wallet className="w-16 h-16 text-purple-500 mx-auto" />,
      title: "Trasparencia para Dueños",
      description: "Agrega las cuentas de banco de tus Propietarios. Al recibir la renta virtualmente, se les deposita sus ganancias menos nuestras comisiones operativas en tiempo real."
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-500" />
      
      <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl relative z-[101] animate-in zoom-in-95 duration-300 font-sans">
        {/* Progress Bar Header */}
        <div className="flex w-full h-1">
          {slides.map((_, i) => (
             <div key={i} className={`flex-1 transition-colors duration-500 ${i <= currentSlide ? 'bg-blue-600' : 'bg-slate-100'}`} />
          ))}
        </div>

        <div className="p-8 pb-10 text-center relative overflow-hidden h-[340px] flex flex-col justify-center">
            {slides.map((s, idx) => (
                <div 
                   key={idx}
                   className={`absolute inset-0 flex flex-col items-center justify-center p-8 transition-all duration-500 ease-out ${
                       idx === currentSlide 
                         ? 'opacity-100 translate-x-0' 
                         : idx < currentSlide 
                           ? 'opacity-0 -translate-x-full'
                           : 'opacity-0 translate-x-full'
                   }`}
                >
                    <div className="bg-slate-50 w-28 h-28 rounded-full flex flex-col items-center justify-center mb-6 shadow-inner ring-1 ring-slate-100">
                      {s.icon}
                    </div>
                    <h2 className="text-2xl font-black tracking-tight text-slate-800 mb-4">{s.title}</h2>
                    <p className="text-slate-500 leading-relaxed font-medium px-4 text-[15px]">{s.description}</p>
                </div>
            ))}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
           <button 
             onClick={handleFinish} 
             className="text-slate-400 font-bold text-sm hover:text-slate-600 px-4 py-2"
           >
             Saltar Tour
           </button>

           {currentSlide < slides.length - 1 ? (
             <button 
               onClick={() => setCurrentSlide(c => c+1)}
               className="bg-slate-900 hover:bg-black text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md active:scale-95"
             >
                Siguiente <ArrowRight className="w-5 h-5" />
             </button>
           ) : (
             <button 
               onClick={handleFinish}
               className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/30 active:scale-95"
             >
                Comenzar <Check className="w-5 h-5" />
             </button>
           )}
        </div>
      </div>
    </div>
  );
}
