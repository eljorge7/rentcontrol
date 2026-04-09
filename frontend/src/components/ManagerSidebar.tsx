"use client";

import Link from "next/link";
import {
  Building2,
  Users,
  FileText,
  DollarSign,
  AlertCircle,
  LayoutDashboard,
  LogOut,
  Settings,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Activity,
  Send,
  UserCog,
  Ticket,
  MessageCircle
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useState } from "react";

export function ManagerSidebar() {
  const { logout, user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`flex h-screen flex-col border-r bg-slate-900 text-slate-100 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'} relative group`}>
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-blue-600 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-md"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <div className="flex flex-col h-28 items-center justify-center border-b border-slate-800 px-4 py-2">
        <div className="flex items-center mt-2 w-full justify-center">
          {isCollapsed ? (
            <Briefcase className="h-6 w-6 flex-shrink-0 text-blue-400" />
          ) : (
            <div className="bg-white px-3 py-1.5 rounded-xl shadow-md flex justify-center w-full max-w-[160px]">
              <img src="/logo-transparent.png" alt="RadioTec Pro" className="h-[32px] md:h-[40px] object-contain" />
            </div>
          )}
        </div>
        {!isCollapsed && <span className="text-xs text-slate-400 mt-2 truncate w-full">{user?.name} (Gestor)</span>}
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1">
          <Link href="/manager" className="flex items-center rounded-md px-4 py-2.5 text-sm font-medium hover:bg-slate-800 text-slate-300 hover:text-white mx-2">
            <LayoutDashboard className="mr-3 h-5 w-5 flex-shrink-0 text-blue-400" />
            {!isCollapsed && <span>Dashboard</span>}
          </Link>
          <div className="pt-4 pb-2 px-6 h-10">
            {!isCollapsed && <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cartera</p>}
          </div>
          <Link href="/manager/quotations" className="flex items-center rounded-md px-4 py-2.5 text-sm font-medium hover:bg-slate-800 text-slate-300 hover:text-white mx-2">
            <Send className="mr-3 h-5 w-5 flex-shrink-0 text-cyan-400" />
            {!isCollapsed && <span>Cotizaciones</span>}
          </Link>
          <Link href="/manager/properties" className="flex items-center rounded-md px-4 py-2.5 text-sm font-medium hover:bg-slate-800 text-slate-300 hover:text-white mx-2">
            <Building2 className="mr-3 h-5 w-5 flex-shrink-0 text-slate-400" />
            {!isCollapsed && <span>Propiedades</span>}
          </Link>
          <Link href="/manager/prospects" className="flex items-center rounded-md px-4 py-2.5 text-sm font-medium hover:bg-slate-800 text-slate-300 hover:text-white mx-2 bg-slate-800/40 border border-blue-500/20">
            <Users className="mr-3 h-5 w-5 flex-shrink-0 text-blue-400" />
            {!isCollapsed && <span className="font-semibold text-blue-100">Catálogo / Prospectos</span>}
          </Link>
          <Link href="/manager/tenants" className="flex items-center rounded-md px-4 py-2.5 text-sm font-medium hover:bg-slate-800 text-slate-300 hover:text-white mx-2">
            <Users className="mr-3 h-5 w-5 flex-shrink-0 text-slate-400" />
            {!isCollapsed && <span>Inquilinos</span>}
          </Link>
          <Link href="/manager/leases" className="flex items-center rounded-md px-4 py-2.5 text-sm font-medium hover:bg-slate-800 text-slate-300 hover:text-white mx-2">
            <FileText className="mr-3 h-5 w-5 flex-shrink-0 text-slate-400" />
            {!isCollapsed && <span>Contratos</span>}
          </Link>
          
          <div className="pt-4 pb-2 px-6 h-10">
            {!isCollapsed && <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Operaciones</p>}
          </div>
          <Link href="http://localhost:3003" target="_blank" rel="noopener noreferrer" className="flex items-center rounded-md px-4 py-2.5 text-sm font-medium hover:bg-indigo-900 text-indigo-300 hover:text-white mx-2 mb-2 bg-indigo-950/50 border border-indigo-500/50 shadow-md">
            <MessageCircle className="mr-3 h-5 w-5 flex-shrink-0 text-indigo-400" />
            {!isCollapsed && <span className="font-bold text-indigo-100">OmniChat CRM</span>}
          </Link>
          <Link href="/manager/finances" className="flex items-center rounded-md px-4 py-2.5 text-sm font-medium hover:bg-slate-800 text-slate-300 hover:text-white mx-2 mb-2">
            <Activity className="mr-3 h-5 w-5 flex-shrink-0 text-emerald-400" />
            {!isCollapsed && <span>Dashboard Financiero</span>}
          </Link>
          <Link href="/manager/payouts" className="flex items-center rounded-md px-4 py-2.5 text-sm font-medium hover:bg-slate-800 text-slate-300 hover:text-white mx-2">
            <DollarSign className="mr-3 h-5 w-5 flex-shrink-0 text-emerald-400" />
            {!isCollapsed && <span>Liquidaciones (Dueños)</span>}
          </Link>
          <Link href="/manager/payments" className="flex items-center rounded-md px-4 py-2.5 text-sm font-medium hover:bg-slate-800 text-slate-300 hover:text-white mx-2">
            <DollarSign className="mr-3 h-5 w-5 flex-shrink-0 text-green-400" />
            {!isCollapsed && <span>Cobranza y Recibos</span>}
          </Link>
          <Link href="/manager/proveedores" className="flex items-center rounded-md px-4 py-2.5 text-sm font-medium hover:bg-slate-800 text-slate-300 hover:text-white mx-2">
            <UserCog className="mr-3 h-5 w-5 flex-shrink-0 text-orange-400" />
            {!isCollapsed && <span>Técnicos (Proveedores)</span>}
          </Link>
          <Link href="/manager/incidents" className="flex items-center rounded-md px-4 py-2.5 text-sm font-medium hover:bg-slate-800 text-slate-300 hover:text-white mx-2">
            <AlertCircle className="mr-3 h-5 w-5 flex-shrink-0 text-rose-400" />
            {!isCollapsed && <span>Reportes (Tickets)</span>}
          </Link>
          <Link href="/manager/vouchers" className="flex items-center rounded-md px-4 py-2.5 text-sm font-medium hover:bg-slate-800 text-slate-300 hover:text-white mx-2">
            <Ticket className="mr-3 h-5 w-5 flex-shrink-0 text-cyan-400" />
            {!isCollapsed && <span>Fichas WiFi</span>}
          </Link>
          <Link href="/manager/store" className="flex items-center rounded-md px-4 py-2.5 text-sm font-medium hover:bg-slate-800 text-slate-300 hover:text-white mx-2">
            <Briefcase className="mr-3 h-5 w-5 flex-shrink-0 text-indigo-400" />
            {!isCollapsed && <span>App Store (Módulos)</span>}
          </Link>
          
          <div className="pt-4 pb-2 px-6 h-10">
            {!isCollapsed && <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mis Ingresos</p>}
          </div>
          <Link href="/manager/wallet" className="flex items-center rounded-md px-4 py-2.5 text-sm font-medium hover:bg-slate-800 text-slate-300 hover:text-white mx-2">
            <DollarSign className="mr-3 h-5 w-5 flex-shrink-0 text-yellow-400" />
            {!isCollapsed && <span>Billetera Virtual</span>}
          </Link>
        </nav>
      </div>
      <div className="border-t border-slate-800 p-4 space-y-1">
        <Link href="/manager/settings" className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
          <Settings className="mr-3 h-5 w-5 flex-shrink-0 text-slate-400" />
          {!isCollapsed && <span>Mi Perfil</span>}
        </Link>
        <Link href="/manager/settings/facturapro" className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
          <Briefcase className="mr-3 h-5 w-5 flex-shrink-0 text-indigo-400" />
          {!isCollapsed && <span>Ecosistema FacturaPro</span>}
        </Link>
        <button 
          onClick={logout}
          className="w-full flex items-center rounded-md px-3 py-2 text-sm font-medium text-rose-400 hover:bg-rose-950/30 text-left transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </div>
  );
}
