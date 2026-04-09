"use client";

import Link from "next/link";
import {
  Building2,
  Users,
  FileText,
  CreditCard,
  Wifi,
  Settings,
  LayoutDashboard,
  DollarSign,
  Receipt,
  MessageSquare,
  LogOut,
  UserCircle,
  AlertCircle,
  Briefcase,
  Layers,
  ChevronLeft,
  ChevronRight,
  UserCog,
  ChevronsUpDown,
  Laptop,
  RadioTower,
  Home,
  Database
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useState } from "react";

type AppContext = 'AGENCY' | 'RENTCONTROL' | 'ISP';

export function Sidebar() {
  const { logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeContext, setActiveContext] = useState<AppContext>('RENTCONTROL');

  const agencyLinks = (
    <>
      <Link href="/admin/finances" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-200 mx-2 text-emerald-700 bg-emerald-50/50">
        <DollarSign className="mr-3 h-5 w-5 flex-shrink-0 text-emerald-600" />
        {!isCollapsed && <span className="font-bold">Finanzas Corp. (Top CEO)</span>}
      </Link>
      <Link href="/admin/saas-clients" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-200 mx-2 text-indigo-700 bg-indigo-50/50 mt-1">
        <Database className="mr-3 h-5 w-5 flex-shrink-0 text-indigo-500" />
        {!isCollapsed && <span className="font-bold">Clientes SaaS</span>}
      </Link>
      <Link href="/admin/saas-plans" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-200 mx-2">
        <Layers className="mr-3 h-5 w-5 flex-shrink-0 text-slate-500" />
        {!isCollapsed && <span>Planes SaaS (Tiers)</span>}
      </Link>
      <Link href="/admin/apps" className="flex items-center rounded-md px-3 py-2 text-sm font-medium mt-4 mx-2 hover:bg-indigo-100 bg-indigo-50/50 border border-indigo-100">
        <Layers className="mr-3 h-5 w-5 flex-shrink-0 text-indigo-600" />
        {!isCollapsed && <span className="text-indigo-700 font-bold tracking-tight">App Store Integrations</span>}
      </Link>
    </>
  );

  const rentControlLinks = (
    <>
      <Link href="/admin" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-200 mx-2 text-indigo-700 bg-indigo-50/50">
        <LayoutDashboard className="mr-3 h-5 w-5 flex-shrink-0 text-indigo-600" />
        {!isCollapsed && <span className="font-bold">Dashboard de Rentas</span>}
      </Link>
      <Link href="/admin/properties" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-200 mx-2 mt-1">
        <Building2 className="mr-3 h-5 w-5 flex-shrink-0 text-slate-500" />
        {!isCollapsed && <span>Propiedades</span>}
      </Link>
      <Link href="/admin/tenants" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-200 mx-2">
        <Users className="mr-3 h-5 w-5 flex-shrink-0 text-slate-500" />
        {!isCollapsed && <span>Inquilinos</span>}
      </Link>
      <Link href="/admin/leases" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-200 mx-2">
        <FileText className="mr-3 h-5 w-5 flex-shrink-0 text-slate-500" />
        {!isCollapsed && <span>Contratos</span>}
      </Link>
      <Link href="/admin/owners" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-200 mx-2">
        <UserCircle className="mr-3 h-5 w-5 flex-shrink-0 text-slate-500" />
        {!isCollapsed && <span>Propietarios</span>}
      </Link>
      <Link href="/admin/invoices" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-200 mx-2">
        <Receipt className="mr-3 h-5 w-5 flex-shrink-0 text-slate-500" />
        {!isCollapsed && <span>Facturación (Arrendamientos)</span>}
      </Link>
      <Link href="/admin/payments" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-200 mx-2">
        <CreditCard className="mr-3 h-5 w-5 flex-shrink-0 text-slate-500" />
        {!isCollapsed && <span>Pagos y Cobranza</span>}
      </Link>
      <div className="pt-4 pb-2 h-10">
        {!isCollapsed && <p className="px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Operaciones y Mantenimiento</p>}
      </div>
      <Link href="/admin/incidents" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-200 mx-2">
        <AlertCircle className="mr-3 h-5 w-5 flex-shrink-0 text-rose-500" />
        {!isCollapsed && <span>Reportes (Tickets)</span>}
      </Link>
      <Link href="/admin/proveedores" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-200 mx-2">
        <UserCog className="mr-3 h-5 w-5 flex-shrink-0 text-orange-500" />
        {!isCollapsed && <span>Técnicos (Proveedores)</span>}
      </Link>
      <Link href="/admin/announcements" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-200 mx-2 text-indigo-700 bg-indigo-50/50">
        <MessageSquare className="mr-3 h-5 w-5 flex-shrink-0 text-indigo-500" />
        {!isCollapsed && <span className="font-bold">Avisos a Unidades (Broadcast)</span>}
      </Link>
      
      <div className="pt-4 pb-2 h-10">
        {!isCollapsed && <p className="px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Agencias y Equipo</p>}
      </div>
      <Link href="/admin/managers" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-200 mx-2">
        <Briefcase className="mr-3 h-5 w-5 flex-shrink-0 text-slate-500" />
        {!isCollapsed && <span>Gestores Internos</span>}
      </Link>
      <Link href="/admin/payroll" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-200 mx-2">
        <Receipt className="mr-3 h-5 w-5 flex-shrink-0 text-indigo-500" />
        {!isCollapsed && <span>Nóminas (Gestores)</span>}
      </Link>
      <Link href="/admin/payouts" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-200 mx-2">
        <DollarSign className="mr-3 h-5 w-5 flex-shrink-0 text-emerald-500" />
        {!isCollapsed && <span>Liquidaciones (Dueños)</span>}
      </Link>
      <Link href="/admin/management-plans" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-200 mx-2">
        <Layers className="mr-3 h-5 w-5 flex-shrink-0 text-slate-500" />
        {!isCollapsed && <span>Planes de Gestión Inmobiliaria</span>}
      </Link>
    </>
  );

  const ispLinks = (
    <>
      <Link href="/admin/network" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-200 mx-2 text-blue-700 bg-blue-50/50">
        <RadioTower className="mr-3 h-5 w-5 flex-shrink-0 text-blue-500" />
        {!isCollapsed && <span className="font-bold">Conexión Mikrotik</span>}
      </Link>
      <Link href="/admin/quotations" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-200 mx-2">
        <Wifi className="mr-3 h-5 w-5 flex-shrink-0 text-slate-500" />
        {!isCollapsed && <span>Planes de Internet (Venta)</span>}
      </Link>
    </>
  );

  return (
    <div className={`flex h-screen flex-col border-r bg-slate-50 text-slate-900 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'} relative group`}>
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-slate-200 hover:bg-slate-300 rounded-full p-1 text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-sm border border-slate-300"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <div className="flex flex-col border-b px-4 py-4 space-y-4">
        {!isCollapsed && (
           <img src="/logo-transparent.png" alt="RadioTec Pro" className="h-[40px] md:h-[48px] object-contain drop-shadow-sm self-start" />
        )}
        
        {/* Context Switcher */}
        {!isCollapsed ? (
          <div className="relative group cursor-pointer w-full">
            <select
               value={activeContext}
               onChange={(e) => setActiveContext(e.target.value as AppContext)}
               className="w-full appearance-none bg-white border border-slate-200 hover:border-slate-300 rounded-xl py-2.5 pl-10 pr-8 text-sm font-black text-slate-800 shadow-sm outline-none transition-all cursor-pointer focus:ring-2 focus:ring-slate-300"
            >
               <option value="AGENCY">MAJIA OS (SaaS CEO)</option>
               <option value="RENTCONTROL">RentControl (Inmuebles)</option>
               <option value="ISP">WispHQ (Internet / Mikrotik)</option>
            </select>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
               {activeContext === 'AGENCY' && <Laptop className="w-4 h-4 text-indigo-500" />}
               {activeContext === 'RENTCONTROL' && <Building2 className="w-4 h-4 text-emerald-500" />}
               {activeContext === 'ISP' && <Wifi className="w-4 h-4 text-blue-500" />}
            </div>
            <ChevronsUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        ) : (
          <div className="flex justify-center cursor-pointer" onClick={() => setIsCollapsed(false)}>
             {activeContext === 'AGENCY' && <Laptop className="w-6 h-6 text-indigo-500" />}
             {activeContext === 'RENTCONTROL' && <Building2 className="w-6 h-6 text-emerald-500" />}
             {activeContext === 'ISP' && <Wifi className="w-6 h-6 text-blue-500" />}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1">
           {activeContext === 'AGENCY' && agencyLinks}
           {activeContext === 'RENTCONTROL' && rentControlLinks}
           {activeContext === 'ISP' && ispLinks}
        </nav>
      </div>

      <div className="border-t p-4 space-y-1">
        <Link href="/admin/settings" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-200">
          <Settings className="mr-3 h-5 w-5 flex-shrink-0 text-slate-500" />
          {!isCollapsed && <span>Ajustes Generales</span>}
        </Link>
        <button 
          onClick={() => logout()}
          className="w-full flex items-center rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 text-left transition-colors mt-2"
        >
          <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-red-500" />
          {!isCollapsed && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </div>
  );
}
