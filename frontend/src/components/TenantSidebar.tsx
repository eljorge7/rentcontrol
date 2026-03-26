"use client";

import Link from "next/link";
import { 
  Home, 
  FileText, 
  CreditCard,
  MessageSquare,
  Settings,
  LogOut,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useState } from "react";

export function TenantSidebar() {
  const { logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`flex h-full flex-col bg-slate-900 py-8 border-r border-slate-800 text-white transition-all duration-300 ${isCollapsed ? 'w-20 px-2' : 'w-64 px-4'}`}>
      <div className={`mb-8 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-2'}`}>
        {!isCollapsed && <h1 className="text-2xl font-bold tracking-tighter text-blue-400">Mi Portal</h1>}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
      <nav className="flex-1 space-y-1">
        <Link href="/tenant" className={`flex items-center rounded-md py-2 ${isCollapsed ? 'justify-center px-0' : 'px-3'} text-sm font-medium hover:bg-slate-800`} title="Resumen">
          <Home className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 text-blue-400`} />
          {!isCollapsed && "Resumen"}
        </Link>
        <Link href="/tenant/leases" className={`flex items-center rounded-md py-2 ${isCollapsed ? 'justify-center px-0' : 'px-3'} text-sm font-medium hover:bg-slate-800`} title="Mi Contrato">
          <FileText className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 text-slate-400`} />
          {!isCollapsed && "Mi Contrato"}
        </Link>
        <Link href="/tenant/incidents" className={`flex items-center rounded-md py-2 ${isCollapsed ? 'justify-center px-0' : 'px-3'} text-sm font-medium hover:bg-slate-800`} title="Reportes Técnicos">
          <AlertTriangle className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 text-slate-400`} />
          {!isCollapsed && "Reportes Técnicos"}
        </Link>
        <Link href="/tenant/billing" className={`flex items-center rounded-md py-2 ${isCollapsed ? 'justify-center px-0' : 'px-3'} text-sm font-medium hover:bg-slate-800`} title="Pagos y Recibos">
          <CreditCard className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 text-slate-400`} />
          {!isCollapsed && "Pagos y Recibos"}
        </Link>
        <Link href="/tenant/chat" className={`flex items-center rounded-md py-2 ${isCollapsed ? 'justify-center px-0' : 'px-3'} text-sm font-medium hover:bg-slate-800`} title="Mensajes y Soporte">
          <MessageSquare className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 text-slate-400`} />
          {!isCollapsed && "Mensajes y Soporte"}
        </Link>
        <Link href="/tenant/settings" className={`flex items-center rounded-md py-2 ${isCollapsed ? 'justify-center px-0' : 'px-3'} text-sm font-medium hover:bg-slate-800`} title="Ajustes">
          <Settings className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 text-slate-400`} />
          {!isCollapsed && "Ajustes"}
        </Link>
      </nav>
      <div className="mt-auto border-t border-slate-700 pt-4">
        <button 
          onClick={() => logout()}
          className={`w-full flex items-center py-2 text-sm text-slate-400 hover:text-white cursor-pointer hover:bg-slate-800 rounded-md transition-colors ${isCollapsed ? 'justify-center px-0' : 'px-3 text-left'}`}
          title="Cerrar Sesión"
        >
            <LogOut className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5`} />
            {!isCollapsed && "Cerrar Sesión"}
        </button>
      </div>
    </div>
  );
}
