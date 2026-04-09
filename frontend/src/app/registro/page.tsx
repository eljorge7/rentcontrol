"use client";

import { useState } from "react";
import { CheckCircle2, Building2, CreditCard, Loader2, ArrowRight, ShieldCheck, Mail, Phone, Lock, Zap } from "lucide-react";
import api from "@/lib/api";

const plans = [
  { id: "plan_1", name: "Básico Conversacional", price: 299, desc: "Para agencias iniciales. Incluye OmniChat." },
  { id: "plan_2", name: "Negocio Pro", price: 599, desc: "Recomendado. Incluye FacturaPro (250 timbres)." },
  { id: "plan_3", name: "ISP Master", price: 899, desc: "Soporte total con Mikrotik y WispHQ." }
];

export default function RegistroSaaSPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Data State
  const [selectedPlan, setSelectedPlan] = useState<string>("plan_2");
  const [formData, setFormData] = useState({
    businessName: "",
    slug: "",
    contactEmail: "",
    contactPhone: "",
    whatsappLinked: true,
  });

  const nextStep = () => {
    if (step === 2) {
      if (!formData.businessName || !formData.slug || !formData.contactEmail || !formData.contactPhone) {
        alert("Por favor completa todos los campos de contacto y empresa.");
        return;
      }
    }
    setStep(step + 1);
  };

  const handleProcessPayment = async () => {
    setLoading(true);
    try {
      // Determinamos los parámetros del ecosistema basado en el plan
      const plan = plans.find(p => p.id === selectedPlan);
      let facturapro = false;
      let facturaproTier = 'none';
      if (plan?.id === 'plan_2') { facturapro = true; facturaproTier = 'emprendedor_250'; }
      if (plan?.id === 'plan_3') { facturapro = true; facturaproTier = 'pyme_1000'; }

      const payload = {
        businessName: formData.businessName,
        slug: formData.slug.toLowerCase().replace(/[^a-z0-9]/g, ''),
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        features: {
          omnichat: true,
          facturapro: facturapro,
          facturaproTier: facturaproTier,
          rentcontrol: false,
          wisphq: plan?.id === 'plan_3'
        }
      };

      // Aquí golpeamos el túnel público puenteando CORS
      const res = await api.post('/saas-onboarding/checkout', payload);
      
      setSuccess(true);
    } catch (e: any) {
      console.error(e);
      alert("Hubo un problema al procesar tu tarjeta o aprovisionar el entorno.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 mb-4">¡Pago Exitoso!</h1>
          <p className="text-slate-600 mb-6 font-medium leading-relaxed">
            Tu ecosistema SaaS ha sido aprovisionado. Se te enviaron las llaves maestras y la factura comercial a tu correo <strong>{formData.contactEmail}</strong> y WhatsApp.
          </p>
          <button onClick={() => window.location.href = "https://radiotecpro.com"} className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800">
            Ir a la Página Principal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navbar Simple */}
      <nav className="bg-white border-b border-slate-200 py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-indigo-600" />
          <span className="font-black text-xl tracking-tight text-slate-900">MAJIA OS</span>
        </div>
        <div className="text-sm font-semibold text-slate-500 hidden md:flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" /> Transacción Segura 256-bit
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-12">
        {/* Lado Izquierdo - Wizard Steps */}
        <div className="flex-1 space-y-8">
          
          {/* Step 1 */}
          <div className={`transition-opacity ${step < 1 ? 'opacity-50 pointer-events-none' : ''}`}>
            <h2 className="text-2xl font-black mb-4 flex items-center gap-3">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</span>
              Selecciona tu Paquete
            </h2>
            {step === 1 && (
              <div className="space-y-4 shadow-sm bg-white p-6 rounded-2xl border border-slate-200 mt-2">
                {plans.map(p => (
                  <label key={p.id} className={`flex items-start p-4 rounded-xl cursor-pointer border-2 transition-all ${selectedPlan === p.id ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-slate-300'}`}>
                    <input type="radio" value={p.id} checked={selectedPlan === p.id} onChange={(e) => setSelectedPlan(e.target.value)} className="mt-1 w-5 h-5 text-indigo-600 border-slate-300 focus:ring-indigo-600" />
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between">
                         <span className="font-bold text-lg text-slate-800">{p.name} {p.id === 'plan_2' && <span className="text-[10px] ml-2 uppercase tracking-wide bg-indigo-600 text-white px-2 py-0.5 rounded-full">Popular</span>}</span>
                         <span className="font-black text-xl">${p.price}<span className="text-xs font-semibold text-slate-500">/mo</span></span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1 font-medium">{p.desc}</p>
                    </div>
                  </label>
                ))}
                <button onClick={nextStep} className="w-full mt-6 bg-indigo-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors">
                  Siguiente Paso <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
            {step > 1 && (
              <div className="text-slate-500 font-medium ml-11 cursor-pointer hover:text-indigo-600" onClick={() => setStep(1)}>
                Paquete Seleccionado: <strong className="text-slate-900">{plans.find(p => p.id === selectedPlan)?.name} (${plans.find(p => p.id === selectedPlan)?.price}/mo)</strong>
              </div>
            )}
          </div>

          {/* Step 2 */}
          <div className={`transition-opacity ${step < 2 ? 'opacity-50 pointer-events-none' : ''}`}>
            <h2 className="text-2xl font-black mb-4 flex items-center gap-3">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</span>
              Datos de tu Empresa
            </h2>
            {step === 2 && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Razón Social o Nombre Comercial *</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input type="text" className="w-full p-3 pl-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="Ej. Inmobiliaria XYZ S.A." value={formData.businessName} onChange={(e) => setFormData({...formData, businessName: e.target.value})} />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Identificador Único (Dominio o Slug) *</label>
                    <input type="text" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none lowercase font-mono text-sm" placeholder="ejemplo: midespacho" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} />
                    <p className="text-[10px] text-slate-400 mt-1.5 font-medium ml-1">Sin espacios. Esto creará el espacio de trabajo privado de tu sistema.</p>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Correo de Contacto *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input type="email" className="w-full p-3 pl-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="correo@ejemplo.com" value={formData.contactEmail} onChange={(e) => setFormData({...formData, contactEmail: e.target.value})} />
                    </div>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Teléfono Móvil (WhatsApp) *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input type="tel" className="w-full p-3 pl-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="+52 1 234 567 8900" value={formData.contactPhone} onChange={(e) => setFormData({...formData, contactPhone: e.target.value})} />
                    </div>
                  </div>
                </div>
                <button onClick={nextStep} className="w-full mt-4 bg-indigo-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors">
                  Ir al Pago Seguro <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
            {step > 2 && (
              <div className="text-slate-500 font-medium ml-11 cursor-pointer hover:text-indigo-600" onClick={() => setStep(2)}>
                Empresa: <strong className="text-slate-900">{formData.businessName} ({formData.contactEmail})</strong>
              </div>
            )}
          </div>

          {/* Step 3 */}
          <div className={`transition-opacity ${step < 3 ? 'opacity-50 pointer-events-none' : ''}`}>
             <h2 className="text-2xl font-black flex items-center gap-3">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>3</span>
              Método de Pago
            </h2>
            {step === 3 && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mt-4">
                 <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 flex justify-between items-center opacity-50 cursor-not-allowed">
                    <div className="flex items-center gap-3">
                      <CreditCard className="text-slate-400 w-6 h-6"/>
                      <div>
                        <p className="font-bold text-slate-700">Tarjeta de Crédito o Débito</p>
                        <p className="text-xs text-slate-500 font-medium">Stripe (Oculto temporalmente en Sandbox)</p>
                      </div>
                    </div>
                 </div>

                 <p className="text-xs text-center text-slate-500 mb-4 bg-indigo-50 p-3 rounded-lg border border-indigo-100 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-indigo-500 shrink-0"/> Por tu seguridad, los módulos de cobro (Stripe/MP) están en espera de que ingreses las credenciales maestras en el panel de Ajustes Generales. Por ahora, completaremos el aprovisionamiento de manera simulada.
                 </p>

                 <button onClick={handleProcessPayment} disabled={loading} className="w-full bg-slate-900 text-white font-black text-lg py-4 rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all">
                    {loading ? <Loader2 className="w-6 h-6 animate-spin"/> : 'Pagar y Procesar'}
                 </button>
              </div>
            )}
          </div>
          
        </div>

        {/* Lado Derecho - Order Summary */}
        <aside className="md:w-[350px] shrink-0">
           <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 sticky top-6">
              <h3 className="font-black text-slate-800 text-lg mb-4">Resumen de la Orden</h3>
              <div className="flex justify-between text-slate-600 font-medium mb-3">
                <span>{plans.find(p => p.id === selectedPlan)?.name}</span>
                <span className="text-slate-900 font-bold">${plans.find(p => p.id === selectedPlan)?.price}.00</span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium pb-4 border-b border-slate-100 mb-4">
                <span>Instalación M2M</span>
                <span className="text-green-600 font-bold">Bonificado</span>
              </div>
              
              <div className="flex justify-between text-slate-500 mb-6 font-bold text-sm">
                <span>Subtotal (Mensual)</span>
                <span className="text-slate-900">${plans.find(p => p.id === selectedPlan)?.price}.00 MXN</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs font-medium text-slate-500 leading-relaxed">
                Al procesar el pago, autorizas el aprovisionamiento automático de tus servidores dedicados y aceptas que este modelo de suscripción es auto-renovable mensualmente. Cancelable en cualquier momento.
              </div>
           </div>
        </aside>
      </main>
    </div>
  );
}
