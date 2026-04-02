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
  UserCog
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useState } from "react";

export function Sidebar() {
  const { logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`flex h-screen flex-col border-r bg-slate-50 text-slate-900 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'} relative group`}>
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-slate-200 hover:bg-slate-300 rounded-full p-1 text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-sm border border-slate-300"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <div className="flex h-20 items-center justify-center border-b px-2 py-2">
        {isCollapsed ? (
          <Wifi className="h-6 w-6 flex-shrink-0 text-blue-600" />
        ) : (
          <img src="/logo-transparent.png" alt="RadioTec Pro" className="h-[44px] md:h-[52px] object-contain drop-shadow-sm" />
        )}
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1">
          <Link href="/admin" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-200 mx-2">
            <LayoutDashboard className="mr-3 h-5 w-5 flex-shrink-0 text-slate-500" />
            {!isCollapsed && <span>Dashboard</span>}
          </Link>
          <Link href="/admin/owners" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-200 mx-2">
            <UserCircle className="mr-3 h-5 w-5 flex-shrink-0 text-slate-500" />
            {!isCollapsed && <span>Propietarios</span>}
          </Link>
          <Link href="/admin/managers" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-200 mx-2">
            <Briefcase className="mr-3 h-5 w-5 flex-shrink-0 text-slate-500" />
            {!isCollapsed && <span>Gestores (Agencia)</span>}
          </Link>
          <Link href="/admin/management-plans" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-200 mx-2">
            <Layers className="mr-3 h-5 w-5 flex-shrink-0 text-slate-500" />
            {!isCollapsed && <span>Planes de Gestión</span>}
          </Link>
          <Link href="/admin/quotations" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-200 mx-2">
            <FileText className="mr-3 h-5 w-5 flex-shrink-0 text-slate-500" />
            {!isCollapsed && <span>Ventas y Cotizaciones</span>}
          </Link>
          <Link href="/admin/prospects" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-200 mx-2 text-blue-600 bg-blue-50/50">
            <Users className="mr-3 h-5 w-5 flex-shrink-0 text-blue-500" />
            {!isCollapsed && <span className="font-semibold text-blue-700">Catálogo / Prospectos</span>}
          </Link>
          <Link href="/admin/properties" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-200 mx-2">
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
          <Link href="/admin/network" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-200 mx-2">
            <Wifi className="mr-3 h-5 w-5 flex-shrink-0 text-slate-500" />
            {!isCollapsed && <span>Infraestructura de Red</span>}
          </Link>
          <Link href="/admin/invoices" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-200 mx-2">
            <Receipt className="mr-3 h-5 w-5 flex-shrink-0 text-slate-500" />
            {!isCollapsed && <span>Facturación</span>}
          </Link>
          <Link href="/admin/payments" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-200 mx-2">
            <DollarSign className="mr-3 h-5 w-5 flex-shrink-0 text-slate-500" />
            {!isCollapsed && <span>Pagos y Cargos</span>}
          </Link>
          <Link href={process.env.NEXT_PUBLIC_OMNICHAT_URL || "https://omnichat.radiotecpro.com"} target="_blank" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-indigo-100 mx-2 text-indigo-600 bg-indigo-50/50 border border-indigo-200 shadow-sm mt-2 mb-2">
            <MessageSquare className="mr-3 h-5 w-5 flex-shrink-0 text-indigo-600" />
            {!isCollapsed && <span className="font-bold">OmniChat CRM</span>}
          </Link>
          <Link href="/admin/chat" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-200 mx-2 hidden">
            <MessageSquare className="mr-3 h-5 w-5 flex-shrink-0 text-slate-500" />
            {!isCollapsed && <span>Chat</span>}
          </Link>
          <Link href="/admin/proveedores" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-200 mx-2">
            <UserCog className="mr-3 h-5 w-5 flex-shrink-0 text-orange-500" />
            {!isCollapsed && <span>Técnicos (Proveedores)</span>}
          </Link>
          <Link href="/admin/incidents" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-200 mx-2">
            <AlertCircle className="mr-3 h-5 w-5 flex-shrink-0 text-rose-500" />
            {!isCollapsed && <span>Reportes (Tickets)</span>}
          </Link>
          <div className="pt-4 pb-2 h-10">
            {!isCollapsed && <p className="px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Agencias</p>}
          </div>
          <Link href="/admin/payroll" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-200 mx-2">
            <Receipt className="mr-3 h-5 w-5 flex-shrink-0 text-indigo-500" />
            {!isCollapsed && <span>Nóminas (Gestores)</span>}
          </Link>
          <Link href="/admin/payouts" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-200 mx-2">
            <DollarSign className="mr-3 h-5 w-5 flex-shrink-0 text-emerald-500" />
            {!isCollapsed && <span>Liquidaciones</span>}
          </Link>
        </nav>
      </div>
      <div className="border-t p-4 space-y-1">
        <Link href="/admin/settings" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-200">
          <CreditCard className="mr-3 h-5 w-5 flex-shrink-0 text-blue-500" />
          {!isCollapsed && <span className="text-blue-600 font-semibold">Pasarelas (Tokens)</span>}
        </Link>
        <Link href="/admin/settings" className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-200">
          <Settings className="mr-3 h-5 w-5 flex-shrink-0 text-slate-500" />
          {!isCollapsed && <span>Ajustes</span>}
        </Link>
        <button 
          onClick={() => logout()}
          className="w-full flex items-center rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 text-left transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-red-500" />
          {!isCollapsed && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </div>
  );
}
