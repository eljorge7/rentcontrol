"use client";

import { Layers, Plus, CheckCircle2, MoreVertical, Edit, Power, X, Save, Trash2 } from "lucide-react";
import { useState } from "react";

// Mocks simulando la base de datos de Planes
const initialPlans = [
   {
      id: "plan_1",
      name: "Básico Conversacional",
      price: 299,
      features: { omnichat: true, facturapro: false, facturaproTier: 'none', rentcontrol: false, wisphq: false },
      isActive: true
   },
   {
      id: "plan_2",
      name: "Negocio Pro (Recomendado)",
      price: 599,
      features: { omnichat: true, facturapro: true, facturaproTier: 'emprendedor_250', rentcontrol: false, wisphq: false },
      isActive: true
   },
   {
      id: "plan_3",
      name: "ISP Master",
      price: 899,
      features: { omnichat: true, facturapro: true, facturaproTier: 'pyme_1000', rentcontrol: false, wisphq: true },
      isActive: true
   }
];

export default function SaasPlansPage() {
   const [plans, setPlans] = useState(initialPlans);
   const [isModalOpen, setIsModalOpen] = useState(false);
   
   // Form State for Plans
   const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
   const [formData, setFormData] = useState({
      name: "",
      price: 0,
      omnichat: false,
      facturapro: false,
      facturaproTier: "emprendedor_250",
      rentcontrol: false,
      wisphq: false
   });

   const openModal = (planId?: string) => {
      if (planId) {
         const plan = plans.find(p => p.id === planId);
         if (plan) {
            setFormData({
               name: plan.name,
               price: plan.price,
               omnichat: plan.features.omnichat,
               facturapro: plan.features.facturapro,
               facturaproTier: plan.features.facturaproTier || 'none',
               rentcontrol: plan.features.rentcontrol,
               wisphq: plan.features.wisphq
            });
            setEditingPlanId(plan.id);
         }
      } else {
         setFormData({ name: "", price: 0, omnichat: false, facturapro: false, facturaproTier: 'emprendedor_250', rentcontrol: false, wisphq: false });
         setEditingPlanId(null);
      }
      setIsModalOpen(true);
   };

   const savePlan = () => {
      if (editingPlanId) {
         setPlans(plans.map(p => p.id === editingPlanId ? {
            ...p,
            name: formData.name,
            price: Number(formData.price),
            features: { omnichat: formData.omnichat, facturapro: formData.facturapro, facturaproTier: formData.facturaproTier, rentcontrol: formData.rentcontrol, wisphq: formData.wisphq }
         } : p));
      } else {
         const newPlan = {
            id: `plan_${Date.now()}`,
            name: formData.name,
            price: Number(formData.price),
            features: { omnichat: formData.omnichat, facturapro: formData.facturapro, facturaproTier: formData.facturaproTier, rentcontrol: formData.rentcontrol, wisphq: formData.wisphq },
            isActive: true
         };
         setPlans([...plans, newPlan]);
      }
      setIsModalOpen(false);
   };

   return (
      <div className="space-y-6">
         <div className="flex justify-between items-center pb-4 border-b border-slate-200">
            <div>
               <h1 className="text-3xl font-black tracking-tight text-slate-800 flex items-center gap-3">
                  <Layers className="w-8 h-8 text-indigo-600" /> Planes SaaS (Packages)
               </h1>
               <p className="text-slate-500 mt-1 font-medium">Configura los paquetes cerrados que ofrecerás a tus clientes.</p>
            </div>
            <button 
               onClick={() => openModal()}
               className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-md transition-all"
            >
               <Plus className="w-5 h-5" /> Crear Nuevo Plan
            </button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map(plan => (
               <div key={plan.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow relative">
                  
                  {plan.name.includes("Pro") && (
                     <div className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest text-center py-1 absolute top-0 w-full">Más Popular</div>
                  )}

                  <div className={`p-6 border-b border-slate-100 ${plan.name.includes("Pro") ? "pt-8" : ""}`}>
                     <div className="flex justify-between items-start mb-4">
                        <h2 className="text-lg font-black text-slate-800">{plan.name}</h2>
                        <button className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-lg transition-colors">
                           <MoreVertical className="w-5 h-5" />
                        </button>
                     </div>
                     <div className="flex items-end gap-1">
                        <span className="text-4xl font-black text-slate-900">${plan.price}</span>
                        <span className="text-sm font-bold text-slate-400 mb-1">/mes MXN</span>
                     </div>
                  </div>

                  <div className="p-6 flex-1 bg-slate-50/50">
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Módulos Incluidos:</p>
                     <ul className="space-y-3">
                        <li className={`flex items-center gap-3 text-sm font-semibold ${plan.features.omnichat ? 'text-slate-700' : 'text-slate-300 opacity-50'}`}>
                           <CheckCircle2 className={`w-5 h-5 ${plan.features.omnichat ? 'text-indigo-500' : 'text-slate-300'}`} />
                           OmniChat CRM Multiagente
                        </li>
                        <li className={`flex flex-col gap-0.5 text-sm font-semibold ${plan.features.facturapro ? 'text-slate-700' : 'text-slate-300 opacity-50'}`}>
                           <div className="flex items-center gap-3">
                              <CheckCircle2 className={`w-5 h-5 ${plan.features.facturapro ? 'text-emerald-500' : 'text-slate-300'}`} />
                              FacturaPro M2M (Timbrado)
                           </div>
                           {plan.features.facturapro && (
                              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 block pl-8">
                                 {plan.features.facturaproTier === 'trial_5' && 'Tier: Trial (5)'}
                                 {plan.features.facturaproTier === 'emprendedor_250' && 'Tier: Emprendedor (250)'}
                                 {plan.features.facturaproTier === 'pyme_1000' && 'Tier: PYME (1000)'}
                                 {plan.features.facturaproTier === 'profesional_2000' && 'Tier: Profesional (2000)'}
                              </span>
                           )}
                        </li>
                        <li className={`flex items-center gap-3 text-sm font-semibold ${plan.features.wisphq ? 'text-slate-700' : 'text-slate-300 opacity-50'}`}>
                           <CheckCircle2 className={`w-5 h-5 ${plan.features.wisphq ? 'text-blue-500' : 'text-slate-300'}`} />
                           WispHQ Integrator
                        </li>
                        <li className={`flex items-center gap-3 text-sm font-semibold ${plan.features.rentcontrol ? 'text-slate-700' : 'text-slate-300 opacity-50'}`}>
                           <CheckCircle2 className={`w-5 h-5 ${plan.features.rentcontrol ? 'text-amber-500' : 'text-slate-300'}`} />
                           RentControl Inmobiliarias
                        </li>
                     </ul>
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                     <button 
                        onClick={() => openModal(plan.id)}
                        className="flex-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-sm font-bold py-2 rounded-lg flex items-center justify-center gap-2"
                     >
                        <Edit className="w-4 h-4" /> Editar Plan
                     </button>
                  </div>
               </div>
            ))}
         </div>
         <p className="text-center text-sm font-medium text-slate-400 mt-8">
            Los planes se reflejarán automáticamente en el Formulario de Inscripción de Nuevas Empresas.
         </p>

         {/* Modal / Dialog de Creación/Edición */}
         {isModalOpen && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
               <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 flex flex-col">
                  {/* Header */}
                  <div className="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-center">
                     <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                           <Layers className="w-6 h-6" />
                        </div>
                        <div>
                           <h2 className="text-xl font-black text-slate-800">{editingPlanId ? 'Editar Paquete' : 'Crear Nuevo Paquete'}</h2>
                           <p className="text-xs font-medium text-slate-500">Define el precio base y las licencias.</p>
                        </div>
                     </div>
                     <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:bg-slate-200 p-2 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                     </button>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-5">
                     <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Nombre Comercial del Paquete *</label>
                        <input type="text" placeholder="Ej. Startup Essentials" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-500 focus:bg-white text-sm font-bold" 
                           value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                     </div>
                     <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Valor Mensual Público (MXN) *</label>
                        <div className="relative">
                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                           <input type="number" placeholder="499.00" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 pl-7 outline-none focus:border-indigo-500 focus:bg-white text-sm font-bold text-slate-800" 
                              value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                           />
                        </div>
                     </div>

                     <div className="pt-2">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Módulos que incluirá este plan:</p>
                        <div className="space-y-2">
                           <label className="flex items-center cursor-pointer p-2.5 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                              <input type="checkbox" className="form-checkbox h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 mr-3" 
                                 checked={formData.omnichat} onChange={e => setFormData({...formData, omnichat: e.target.checked})}
                              />
                              <span className="text-sm font-semibold text-slate-700">OmniChat Multicanal CRM</span>
                           </label>
                           <div className={`p-3 rounded-xl border transition-colors ${formData.facturapro ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-100 hover:border-slate-300'}`}>
                              <label className="flex items-center cursor-pointer mb-2">
                                 <input type="checkbox" className="form-checkbox h-4 w-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 mr-3" 
                                    checked={formData.facturapro} onChange={e => setFormData({...formData, facturapro: e.target.checked})}
                                 />
                                 <span className="text-sm font-semibold text-slate-700">FacturaPro M2M (Timbrado Corporativo)</span>
                              </label>
                              {formData.facturapro && (
                                 <div className="pl-7 pr-2 pb-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">Nivel Inyectado</label>
                                    <select className="w-full text-xs font-semibold bg-white border border-emerald-200 rounded p-1.5 outline-none focus:ring-1 focus:ring-emerald-500 text-slate-700"
                                       value={formData.facturaproTier} onChange={e => setFormData({...formData, facturaproTier: e.target.value})}
                                    >
                                       <option value="trial_5">Trial - 5 Timbres (Gratuito)</option>
                                       <option value="emprendedor_250">Emprendedor - 250 Timbres</option>
                                       <option value="pyme_1000">PYME - 1000 Timbres</option>
                                       <option value="profesional_2000">Profesional - 2000 Timbres</option>
                                    </select>
                                 </div>
                              )}
                           </div>
                           <label className="flex items-center cursor-pointer p-2.5 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                              <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 mr-3" 
                                 checked={formData.wisphq} onChange={e => setFormData({...formData, wisphq: e.target.checked})}
                              />
                              <span className="text-sm font-semibold text-slate-700">WispHQ Integrator (ISP / Mikrotik)</span>
                           </label>
                           <label className="flex items-center cursor-pointer p-2.5 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                              <input type="checkbox" className="form-checkbox h-4 w-4 text-amber-500 rounded border-slate-300 focus:ring-amber-500 mr-3" 
                                 checked={formData.rentcontrol} onChange={e => setFormData({...formData, rentcontrol: e.target.checked})}
                              />
                              <span className="text-sm font-semibold text-slate-700">RentControl Sistema Inmobiliario</span>
                           </label>
                        </div>
                     </div>
                  </div>

                  {/* Footer */}
                  <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-between items-center">
                     {editingPlanId ? (
                        <button className="px-3 py-2 text-sm font-bold text-rose-500 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1">
                           <Trash2 className="w-4 h-4" /> Eliminar
                        </button>
                     ) : (
                        <div></div>
                     )}
                     <div className="flex gap-2">
                        <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                           Cancelar
                        </button>
                        <button onClick={savePlan} className="px-7 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md transition-all flex items-center gap-2">
                           <Save className="w-4 h-4" /> {editingPlanId ? 'Actualizar Plan' : 'Guardar y Publicar'}
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}
