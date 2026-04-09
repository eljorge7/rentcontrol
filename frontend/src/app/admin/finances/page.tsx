"use client";

import { DollarSign, Layers, TrendingUp, Users, Activity, CreditCard, Sparkles } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mrrData = [
  { name: 'Ene', total: 12000 },
  { name: 'Feb', total: 15500 },
  { name: 'Mar', total: 23000 },
  { name: 'Abr', total: 31250 },
  { name: 'May', total: 42800 },
  { name: 'Jun', total: 54900 },
];

const resentSubscriptions = [
  { id: 1, tenant: "Constructora del Norte", plan: "Negocio Pro", amount: 599, status: "Cobrado", date: "Hace 2 horas", color: "text-indigo-500", bg: "bg-indigo-100" },
  { id: 2, tenant: "Despacho R&R Abogados", plan: "Básico Conversacional", amount: 299, status: "Cobrado", date: "Hace 5 horas", color: "text-emerald-500", bg: "bg-emerald-100" },
  { id: 3, tenant: "Redes Inalámbricas Fast", plan: "ISP Master", amount: 899, status: "Cobrado", date: "Hace 1 día", color: "text-blue-500", bg: "bg-blue-100" },
  { id: 4, tenant: "Torre Monserrate A.C.", plan: "RentControl Nativo", amount: 1499, status: "Cobrado", date: "Hace 2 días", color: "text-amber-500", bg: "bg-amber-100" },
  { id: 5, tenant: "Ferretería El Volcán", plan: "ISP Master", amount: 899, status: "Pendiente", date: "Hace 3 días", color: "text-slate-500", bg: "bg-slate-100" },
];

export default function FinancesCorporativasPage() {
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-indigo-600" /> Finanzas Corporativas
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Dashboard consolidado del ecosistema MAJIA OS.</p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-2.5 rounded-xl font-bold font-mono text-sm shadow-sm select-none">
           <span className="relative flex h-2.5 w-2.5 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
          </span>
          STATUS: ONLINE
        </div>
      </div>

      {/* KPIs Level 1 - Premium Dark Mode */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MRR Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white p-6 rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-800 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform">
              <DollarSign className="w-24 h-24" />
           </div>
           <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-400"/> Ingreso Recurrente Mensual (MRR)</p>
           <h2 className="text-4xl font-black tabular-nums tracking-tight mb-2">$54,900<span className="text-lg text-slate-500 font-medium">.00</span></h2>
           <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
              <TrendingUp className="w-4 h-4"/> +28.2% <span className="text-slate-500 font-medium ml-1">vs mes pasado</span>
           </div>
        </div>

        {/* ARR Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-700 relative overflow-hidden">
           <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Ingreso Anualizado (ARR)</p>
           <div className="flex items-baseline gap-1">
             <h2 className="text-3xl font-black tabular-nums tracking-tight mb-2">$658k</h2>
             <span className="text-sm font-medium text-slate-500">MXN</span>
           </div>
           <div className="flex items-center gap-2 text-sm font-bold text-emerald-400 mt-1">
              Próxima meta: $1M
           </div>
           <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5">
              <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: '65%' }}></div>
           </div>
        </div>

        {/* Active Tenants Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
           <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2"><Users className="w-4 h-4"/> Corporativos Activos</p>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">84</h2>
           </div>
           <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg w-fit mt-2">
              <TrendingUp className="w-4 h-4"/> +12 nuevos
           </div>
        </div>

        {/* ARPU Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
           <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2"><Layers className="w-4 h-4"/> ARPU (Ingreso Promedio)</p>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">$653<span className="text-lg text-slate-400 font-medium tracking-normal">/usuario</span></h2>
           </div>
           <p className="text-sm font-medium text-slate-500 mt-2">
              Ligeramente al alza por ventas en ISP Master.
           </p>
        </div>
      </div>

      {/* Gráficas y Composición */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Graphic */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
           <div className="flex justify-between items-center mb-6">
              <div>
                 <h3 className="font-bold text-lg tracking-tight text-slate-800">Crecimiento Histórico de MRR</h3>
                 <p className="text-xs font-medium text-slate-500 mt-0.5">Ingresos recurrentes netos sin contar Setup Fees.</p>
              </div>
           </div>
           <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mrrData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `$${value/1000}k`} dx={-10} />
                <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                   itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                   formatter={(value: any) => [`$${value.toLocaleString()}`, 'MRR']}
                />
                <Area type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
           </div>
        </div>

        {/* Ecosistema Market Share */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
           <h3 className="font-bold text-lg tracking-tight text-slate-800 mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" /> Distribución de Licencias
           </h3>

           <div className="space-y-6 flex-1">
              {/* OmniChat */}
              <div>
                 <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-2">
                       <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                       <span className="text-sm font-bold text-slate-700">OmniChat Multicanal</span>
                    </div>
                    <span className="text-sm font-black text-slate-900">42%</span>
                 </div>
                 <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '42%' }}></div>
                 </div>
              </div>

               {/* FacturaPro */}
              <div>
                 <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-2">
                       <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                       <span className="text-sm font-bold text-slate-700">FacturaPro M2M</span>
                    </div>
                    <span className="text-sm font-black text-slate-900">28%</span>
                 </div>
                 <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '28%' }}></div>
                 </div>
              </div>

               {/* RentControl */}
               <div>
                 <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-2">
                       <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                       <span className="text-sm font-bold text-slate-700">RentControl Backend</span>
                    </div>
                    <span className="text-sm font-black text-slate-900">18%</span>
                 </div>
                 <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: '18%' }}></div>
                 </div>
              </div>

               {/* WispHQ */}
               <div>
                 <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-2">
                       <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                       <span className="text-sm font-bold text-slate-700">WispHQ Integrator</span>
                    </div>
                    <span className="text-sm font-black text-slate-900">12%</span>
                 </div>
                 <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '12%' }}></div>
                 </div>
              </div>
           </div>
        </div>

      </div>

      {/* Últimos Movimientos */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
         <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div>
               <h3 className="font-bold text-lg tracking-tight text-slate-800 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-500" /> Registro de Caja Reciente
               </h3>
               <p className="text-sm font-medium text-slate-500 mt-1">Últimas altas y renovaciones automatizadas de tus clientes.</p>
            </div>
            <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-xl transition-colors">
               Ver Reporte Completo
            </button>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-white border-b border-slate-100">
                     <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Cliente SaaS</th>
                     <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Mensualidad Asignada</th>
                     <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Monto Acordado</th>
                     <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Estatus</th>
                     <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Fecha de Aprovisionamiento</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {resentSubscriptions.map((sub) => (
                     <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                           <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-full ${sub.bg} flex items-center justify-center`}>
                                 <Layers className={`w-5 h-5 ${sub.color}`} />
                              </div>
                              <span className="font-bold text-slate-700 text-sm">{sub.tenant}</span>
                           </div>
                        </td>
                        <td className="p-4">
                           <span className="text-sm font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">{sub.plan}</span>
                        </td>
                        <td className="p-4">
                           <span className="text-sm font-black tabular-nums text-slate-800">${sub.amount}.00</span>
                        </td>
                        <td className="p-4">
                           <span className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${sub.status === 'Cobrado' ? 'text-emerald-700 bg-emerald-100' : 'text-slate-600 bg-slate-100'}`}>
                              {sub.status}
                           </span>
                        </td>
                        <td className="p-4 text-right">
                           <span className="text-sm font-semibold text-slate-500">{sub.date}</span>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

    </div>
  );
}
