"use client";

import { FileText, BookOpen, Layers, ShieldCheck, Zap } from "lucide-react";

export default function DocumentationPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10 animate-in fade-in zoom-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-tr from-slate-900 to-slate-800 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 bg-blue-500/20 blur-3xl w-64 h-64 rounded-full"></div>
        <div className="absolute -left-10 -bottom-10 bg-indigo-500/20 blur-3xl w-48 h-48 rounded-full"></div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-200 text-sm font-bold tracking-wide mb-6">
            <BookOpen className="w-4 h-4" /> Centro de Operaciones
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight">
            Documentación <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Oficial</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl font-medium leading-relaxed">
            Explora las guías de uso, flujos y secretos para dominar el Ecosistema Grupo Hurtado, gestionar inquilinos y automatizar cobros.
          </p>
        </div>
        <div className="relative z-10 shrink-0 hidden md:block">
           <div className="w-32 h-32 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl flex items-center justify-center rotate-3 hover:rotate-0 transition-all duration-500">
             <FileText className="w-14 h-14 text-blue-300" />
           </div>
        </div>
      </div>

      {/* Grid Chapters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Capitulo 1 */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 group">
           <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
             <Layers className="w-7 h-7" />
           </div>
           <h3 className="text-xl font-bold text-slate-800 mb-3">1. Gestión de Propiedades</h3>
           <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
             Aprende cómo registrar Complejos, agregar Unidades y configurar precios base. Todo lo necesario para estructurar tu inmobiliaria.
           </p>
           <ul className="space-y-3 text-sm text-slate-600 font-medium">
             <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div> Crear un Nuevo Edificio</li>
             <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div> Asignación de Unidades</li>
             <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div> Edición de Nomenclaturas</li>
           </ul>
        </div>

        {/* Capitulo 2 */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 group">
           <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
             <ShieldCheck className="w-7 h-7" />
           </div>
           <h3 className="text-xl font-bold text-slate-800 mb-3">2. Inquilinos y Contratos</h3>
           <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
             El proceso correcto para vincular el contacto de WhatsApp del inquilino a tu propiedad y asentar el contrato de arrendamiento.
           </p>
           <ul className="space-y-3 text-sm text-slate-600 font-medium">
             <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> Dar de alta prospectos</li>
             <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> Crear y Firmar Leases</li>
             <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> Reglas de Penalización (Late Fee)</li>
           </ul>
        </div>

        {/* Capitulo 3 */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-amber-200 transition-all duration-300 group">
           <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
             <Zap className="w-7 h-7" />
           </div>
           <h3 className="text-xl font-bold text-slate-800 mb-3">3. Facturación y Cobro IA</h3>
           <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
             Comprende cómo los bots extraen recibos de pago y concilian los adeudos sin necesidad de que tú intervengas.
           </p>
           <ul className="space-y-3 text-sm text-slate-600 font-medium">
             <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div> Conciliación de Pagos</li>
             <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div> Estados de Cuenta (Ledgers)</li>
             <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div> Módulo FacturaPro (Próximamente)</li>
           </ul>
        </div>

      </div>

    </div>
  );
}
