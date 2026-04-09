"use client";

import { useState } from "react";
import { Building2, Plus, Database, Power, AlertCircle, Save, X, Calendar, Server, MessagesSquare, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mocks simulando la base de datos de Planes
const availablePlans = [
   { id: "custom", name: "Paquete a la Medida (Personalizado)", price: 0, features: { omnichat: false, facturapro: false, facturaproTier: "none", rentcontrol: false, wisphq: false } },
   { id: "plan_1", name: "Básico Conversacional", price: 299, features: { omnichat: true, facturapro: false, facturaproTier: "none", rentcontrol: false, wisphq: false } },
   { id: "plan_2", name: "Negocio Pro (Recomendado)", price: 599, features: { omnichat: true, facturapro: true, facturaproTier: "emprendedor_250", rentcontrol: false, wisphq: false } },
   { id: "plan_3", name: "ISP Master", price: 899, features: { omnichat: true, facturapro: true, facturaproTier: "pyme_1000", rentcontrol: false, wisphq: true } }
];

export default function SaasClientsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);

  // Form State
  const [selectedPlanId, setSelectedPlanId] = useState("custom");
  const [hasManuallyEditedDomain, setHasManuallyEditedDomain] = useState(false);
  const [formData, setFormData] = useState({
     companyName: "",
     companyDomain: "",
     contactEmail: "",
     contactPhone: "",
     planOmnichat: false,
     planFacturapro: false,
     facturaproTier: "emprendedor_250",
     planRentcontrol: false,
     planWisphq: false,
     monthlyFee: "",
     billingDay: "1"
  });

  const handlePlanChange = (e: any) => {
     const planId = e.target.value;
     setSelectedPlanId(planId);
     
     if(planId !== "custom") {
        const planObj = availablePlans.find(p => p.id === planId);
        if(planObj) {
           setFormData({
              ...formData,
              planOmnichat: planObj.features.omnichat,
              planFacturapro: planObj.features.facturapro,
              facturaproTier: planObj.features.facturaproTier || "emprendedor_250",
              planRentcontrol: planObj.features.rentcontrol,
              planWisphq: planObj.features.wisphq,
              monthlyFee: planObj.price.toString()
           });
        }
     }
  };

  const handleNameChange = (e: any) => {
     const name = e.target.value;
     if (!hasManuallyEditedDomain) {
        // Generar slug automático (minúsculas, sin acentos, espacios a guiones)
        const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        setFormData({ ...formData, companyName: name, companyDomain: slug });
     } else {
        setFormData({ ...formData, companyName: name });
     }
  };

  const handleDomainChange = (e: any) => {
     setHasManuallyEditedDomain(true);
     setFormData({ ...formData, companyDomain: e.target.value });
  };

  const handleProvision = async () => {
     if (!formData.companyName || !formData.companyDomain || !formData.contactEmail || !formData.contactPhone) {
        alert("Por favor completa los campos de Empresa, ID, Correo y WhatsApp para continuar.");
        return;
     }

     setIsProvisioning(true);
     try {
        // En desarrollo local usamos el puerto 3001 para el backend de RentControl
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3001/api/v1/saas-onboarding/provision', {
           method: 'POST',
           headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
           },
           body: JSON.stringify(formData)
        });

        const data = await res.json();
        
        if (!res.ok) throw new Error(data.message || 'Error en aprovisionamiento');

        alert(`¡Pum! 🚀 Instancia SaaS creada exitosamente.\n\nEl Magic Link y API KEY maestras han sido enviadas al WhatsApp: ${formData.contactPhone}`);
        setIsModalOpen(false);
     } catch (error: any) {
        alert(error.message);
     } finally {
        setIsProvisioning(false);
     }
  };

  const isCustomPlan = selectedPlanId === "custom";

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-3">
            <Database className="w-8 h-8 text-indigo-600" /> Clientes y Licencias SaaS
          </h1>
          <p className="text-slate-500 mt-1">Gestión corporativa de cuentas alquiladas (FacturaPro, OmniChat).</p>
        </div>
        <button 
           onClick={() => setIsModalOpen(true)}
           className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-md transition-all"
        >
          <Plus className="w-5 h-5" /> Inscribir Empresa
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Placeholder para Nidia */}
        <Card className="hover:border-indigo-200 transition-colors cursor-pointer shadow-sm">
          <CardHeader className="bg-indigo-50/50 pb-4 border-b">
            <div className="flex justify-between items-start">
               <div>
                  <CardTitle className="text-lg">Tienda de Nidia (Ejemplo)</CardTitle>
                  <p className="text-sm text-slate-500 font-medium">SaaS-OmniChat-01</p>
               </div>
               <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider">Activo</span>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
             <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Plataformas Arrendadas</p>
                <div className="flex gap-2 mt-2">
                   <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-md font-semibold">OmniChat Base</span>
                   <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-md font-semibold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> FacturaPro API</span>
                </div>
             </div>
             <div className="flex justify-between items-center border-t pt-4">
                <span className="text-sm font-bold text-slate-600">Mensualidad: $499.00</span>
                <button className="text-indigo-600 hover:text-indigo-800 p-1.5 bg-indigo-50 rounded-lg" title="Suspender Servicio">
                   <Power className="w-4 h-4" />
                </button>
             </div>
          </CardContent>
        </Card>

        {/* Placeholder para ISOTEC */}
        <Card className="hover:border-indigo-200 transition-colors cursor-pointer shadow-sm">
          <CardHeader className="bg-slate-50 pb-4 border-b">
            <div className="flex justify-between items-start">
               <div>
                  <CardTitle className="text-lg text-slate-700">ISOTEC Internet</CardTitle>
                  <p className="text-sm text-slate-500 font-medium">SaaS-Wisp-02</p>
               </div>
               <span className="bg-slate-200 text-slate-600 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider">Borrador</span>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
             <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Plataformas Arrendadas</p>
                <div className="flex gap-2 mt-2">
                   <span className="bg-blue-50 text-blue-800 border border-blue-200 text-xs px-2.5 py-1 rounded-md font-semibold">OmniChat Wisp Addon</span>
                </div>
             </div>
             <div className="flex justify-between items-center border-t pt-4">
                <span className="text-sm font-bold text-slate-600">Mensualidad: $199.00</span>
                <button className="text-indigo-600 hover:text-indigo-800 p-1.5 bg-indigo-50 rounded-lg">
                   <Power className="w-4 h-4" />
                </button>
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal / Dialog de Inscripción */}
      {isModalOpen && (
         <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
               {/* Header */}
               <div className="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                     <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                        <Building2 className="w-6 h-6" />
                     </div>
                     <div>
                        <h2 className="text-xl font-black text-slate-800">Alta de Nuevo Cliente SaaS</h2>
                        <p className="text-sm font-medium text-slate-500">Inscribe un negocio y presiona las licencias que va a alquilar.</p>
                     </div>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:bg-slate-200 p-2 rounded-full transition-colors">
                     <X className="w-5 h-5" />
                  </button>
               </div>

               {/* Body */}
               <div className="p-6 overflow-y-auto flex-1 space-y-6">
                  
                  {/* Empresa */}
                  <div className="space-y-4">
                     <h3 className="text-sm font-black text-indigo-800 uppercase tracking-wider flex items-center gap-2">
                        <Building2 className="w-4 h-4" /> 1. Datos del Cliente
                     </h3>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="text-xs font-bold text-slate-500 mb-1 block">Nombre Comercial</label>
                           <input type="text" placeholder="Ej. Abarrotes Lupita" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-500 focus:bg-white text-sm font-semibold" 
                              value={formData.companyName} onChange={handleNameChange}
                           />
                        </div>
                        <div>
                           <label className="text-xs font-bold text-slate-500 mb-1 block flex justify-between">
                              ID de Base de Datos (Tenant) <span className="text-[10px] text-indigo-400 font-medium">Auto-generado</span>
                           </label>
                           <input type="text" placeholder="ej. abarrotes-lupita" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-500 focus:bg-white text-sm font-mono text-indigo-700 font-bold" 
                              value={formData.companyDomain} onChange={handleDomainChange}
                           />
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4 mt-3">
                        <div>
                           <label className="text-xs font-bold text-slate-500 mb-1 block">Correo del Administrador *</label>
                           <input type="email" placeholder="admin@empresa.com" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-500 focus:bg-white text-sm font-semibold" 
                              value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})}
                           />
                        </div>
                        <div>
                           <label className="text-xs font-bold text-slate-500 mb-1 block">WhatsApp de Contacto *</label>
                           <input type="text" placeholder="662 000 0000" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-500 focus:bg-white text-sm font-semibold" 
                              value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})}
                           />
                        </div>
                     </div>
                  </div>

                  {/* Suscripciones */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                     <div className="flex justify-between items-center">
                        <h3 className="text-sm font-black text-indigo-800 uppercase tracking-wider flex items-center gap-2">
                           <Server className="w-4 h-4" /> 2. Software a Alquilar
                        </h3>
                        {/* Selector de Planes de Venta */}
                        <select 
                           className="bg-indigo-50 border border-indigo-200 text-indigo-800 text-sm font-bold rounded-lg px-3 py-1.5 outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500"
                           value={selectedPlanId}
                           onChange={handlePlanChange}
                        >
                           {availablePlans.map(p => (
                              <option key={p.id} value={p.id}>{p.name} {p.price > 0 ? `($${p.price})` : ''}</option>
                           ))}
                        </select>
                     </div>

                     {!isCustomPlan && (
                        <div className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-2">
                           <CheckCircle2 className="w-4 h-4" /> Las licencias y precios se han fijado automáticamente según el plan elegido.
                        </div>
                     )}

                     <div className={`grid grid-cols-2 gap-3 ${!isCustomPlan ? 'opacity-80 pointer-events-none grayscale-[20%]' : ''}`}>
                        <label className={`cursor-pointer border-2 rounded-xl p-4 flex items-start gap-3 transition-colors ${formData.planOmnichat ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 hover:border-slate-300'}`}>
                           <input type="checkbox" className="mt-1 w-4 h-4 text-indigo-600 focus:ring-indigo-500" 
                              checked={formData.planOmnichat} onChange={e => setFormData({...formData, planOmnichat: e.target.checked})} disabled={!isCustomPlan} />
                           <div>
                              <p className="font-bold text-slate-800 flex items-center gap-1.5"><MessagesSquare className="w-4 h-4 text-blue-500"/> OmniChat Base</p>
                              <p className="text-xs text-slate-500 mt-1">Chat multipantalla y CRM.</p>
                           </div>
                        </label>

                        <div className={`p-4 rounded-xl border-2 transition-colors ${formData.planFacturapro ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 hover:border-slate-300'} flex flex-col justify-center`}>
                           <label className="cursor-pointer flex items-start gap-3 w-full">
                              <input type="checkbox" className="mt-1 w-4 h-4 text-emerald-600 focus:ring-emerald-500" 
                                 checked={formData.planFacturapro} onChange={e => setFormData({...formData, planFacturapro: e.target.checked})} disabled={!isCustomPlan} />
                              <div>
                                 <p className="font-bold text-slate-800 flex items-center gap-1.5"><AlertCircle className="w-4 h-4 text-emerald-600"/> FacturaPro M2M</p>
                                 <p className="text-xs text-slate-500 mt-1">Motor de timbrado SAT sin UI.</p>
                              </div>
                           </label>
                           {formData.planFacturapro && (
                              <div className="mt-3 pl-7 w-full">
                                 <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">Volumetría Asignada</label>
                                 <select className={`w-full text-xs font-semibold border rounded p-1.5 outline-none text-slate-700 ${!isCustomPlan ? 'bg-emerald-100 border-emerald-200 cursor-not-allowed opacity-90' : 'bg-white border-emerald-300 focus:ring-1 focus:ring-emerald-500'}`}
                                    value={formData.facturaproTier} onChange={e => setFormData({...formData, facturaproTier: e.target.value})}
                                    disabled={!isCustomPlan}
                                 >
                                    <option value="trial_5">Trial - 5 Timbres</option>
                                    <option value="emprendedor_250">Emprendedor - 250 Timbres</option>
                                    <option value="pyme_1000">PYME - 1000 Timbres</option>
                                    <option value="profesional_2000">Profesional - 2000 Timbres</option>
                                 </select>
                              </div>
                           )}
                        </div>

                        <label className={`cursor-pointer border-2 rounded-xl p-4 flex items-start gap-3 transition-colors ${formData.planRentcontrol ? 'border-amber-500 bg-amber-50' : 'border-slate-100 hover:border-slate-300'}`}>
                           <input type="checkbox" className="mt-1 w-4 h-4 text-amber-600 focus:ring-amber-500" 
                              checked={formData.planRentcontrol} onChange={e => setFormData({...formData, planRentcontrol: e.target.checked})} disabled={!isCustomPlan} />
                           <div>
                              <p className="font-bold text-slate-800 flex items-center gap-1.5"><Building2 className="w-4 h-4 text-amber-500"/> RentControl Base</p>
                              <p className="text-xs text-slate-500 mt-1">Inmobiliarias Pyme.</p>
                           </div>
                        </label>

                        <label className={`cursor-pointer border-2 rounded-xl p-4 flex items-start gap-3 transition-colors ${formData.planWisphq ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-300'}`}>
                           <input type="checkbox" className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500" 
                              checked={formData.planWisphq} onChange={e => setFormData({...formData, planWisphq: e.target.checked})} disabled={!isCustomPlan} />
                           <div>
                              <p className="font-bold text-slate-800 flex items-center gap-1.5"><Server className="w-4 h-4 text-cyan-600"/> WispHQ Integrator</p>
                              <p className="text-xs text-slate-500 mt-1">Conexión Mikrotik ISP.</p>
                           </div>
                        </label>
                     </div>
                  </div>

                  {/* Cobranza */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                     <h3 className="text-sm font-black text-indigo-800 uppercase tracking-wider flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> 3. Esquema de Cobro
                     </h3>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="text-xs font-bold text-slate-500 mb-1 block">Mensualidad Pactada (MXN)</label>
                           <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                              <input type="number" placeholder="499.00" className={`w-full border border-slate-200 rounded-lg p-2.5 pl-7 outline-none focus:border-indigo-500 focus:bg-white text-sm font-bold ${!isCustomPlan ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-slate-50 text-slate-800'}`} 
                                 value={formData.monthlyFee} onChange={e => setFormData({...formData, monthlyFee: e.target.value})}
                                 disabled={!isCustomPlan}
                              />
                           </div>
                        </div>
                        <div>
                           <label className="text-xs font-bold text-slate-500 mb-1 block">Día de Facturación / Corte</label>
                           <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-500 focus:bg-white text-sm font-semibold"
                              value={formData.billingDay} onChange={e => setFormData({...formData, billingDay: e.target.value})}
                           >
                              <option value="1">Día 1 de cada mes</option>
                              <option value="15">Día 15 de cada mes</option>
                              <option value="28">Día 28 (Fin de mes)</option>
                           </select>
                        </div>
                     </div>
                  </div>

               </div>

               {/* Footer */}
               <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-between items-center">
                  <p className="text-xs text-slate-400 font-medium max-w-xs">
                     El sistema generará el API KEY maestro y aprovisionará el espacio.
                  </p>
                  <div className="flex gap-2">
                     <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors" disabled={isProvisioning}>
                        Cancelar
                     </button>
                     <button onClick={handleProvision} disabled={isProvisioning} className={`px-7 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md transition-all flex items-center gap-2 ${isProvisioning ? 'opacity-70 cursor-not-allowed' : ''}`}>
                        {isProvisioning ? <Database className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
                        {isProvisioning ? 'Aprovisionando...' : 'Crear Instancia SaaS'}
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
