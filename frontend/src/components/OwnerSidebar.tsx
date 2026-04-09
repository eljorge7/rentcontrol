"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  Building2, Settings, LayoutDashboard, LogOut,
  Users, FileText, AlertCircle, Wallet, 
  ChevronDown, ChevronRight, Home, Receipt,
  PanelLeftClose, PanelLeft, LifeBuoy
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { getAuthHeaders } from "@/lib/auth";

export function OwnerSidebar() {
  const { user, logout } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [expandedProps, setExpandedProps] = useState<Record<string, boolean>>({});
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (user?.role === 'OWNER') {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/properties`, { headers: getAuthHeaders() })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setProperties(data);
        })
        .catch(console.error);
    }
  }, [user]);

  const toggleProp = (id: string) => {
    if (isCollapsed) setIsCollapsed(false); // Auto expand sidebar if trying to open an accordion
    setExpandedProps(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const isSaaS = !user?.planType || user?.planType === 'SAAS';

  return (
    <div className={`flex h-screen flex-col border-r bg-slate-900 text-white select-none transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex h-16 items-center border-b border-slate-800 px-6 justify-between">
        <div className="flex items-center overflow-hidden">
          <Building2 className="mr-2 h-6 w-6 text-blue-400 shrink-0" />
          {!isCollapsed && <span className="text-lg font-bold truncate">Propietario</span>}
        </div>
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-slate-400 hover:text-white shrink-0 ml-1">
          {isCollapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 overflow-x-hidden">
        <nav className="space-y-1.5 px-3">
          <Link href="/owner" className={`flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-800 ${isCollapsed ? 'justify-center' : ''}`} title="Resumen">
            <LayoutDashboard className={`${isCollapsed ? 'mr-0' : 'mr-3'} h-5 w-5 text-blue-400 shrink-0`} />
            {!isCollapsed && <span>Resumen</span>}
          </Link>

          {/* MIS INMUEBLES (Homming Style) */}
          <div className="pt-2 pb-1">
            {!isCollapsed ? (
              <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mis Inmuebles</p>
            ) : (
              <div className="w-full flex justify-center"><div className="h-px bg-slate-800 w-8 my-2"></div></div>
            )}
          </div>
          
          {properties.length === 0 ? (
             !isCollapsed && <div className="px-6 py-2 text-xs text-slate-500 italic">No tienes Inmuebles.</div>
          ) : (
            properties.map(p => (
              <div key={p.id} className="space-y-1">
                <button 
                  onClick={() => toggleProp(p.id)}
                  title={p.name}
                  className={`w-full flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-800 group transition-colors ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                >
                  <div className="flex items-center truncate">
                    <Building2 className={`${isCollapsed ? 'mr-0' : 'mr-3'} h-4 w-4 text-indigo-400 shrink-0`} />
                    {!isCollapsed && <span className="truncate max-w-[130px]">{p.name}</span>}
                  </div>
                  {!isCollapsed && (
                    expandedProps[p.id] ? (
                      <ChevronDown className="h-4 w-4 text-slate-500 group-hover:text-slate-300 shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-slate-300 shrink-0" />
                    )
                  )}
                </button>
                {/* Unidades Anidadas */}
                {!isCollapsed && expandedProps[p.id] && p.units && (
                  <div className="pl-10 pr-3 space-y-1 pb-1">
                    {p.units.length === 0 ? (
                      <div className="text-xs text-slate-600 py-1">Sin unidades (locales)</div>
                    ) : (
                      p.units.map((u: any) => (
                        <div key={u.id} className="flex items-center text-xs py-1.5 text-slate-400 hover:text-slate-200 cursor-default">
                          <Home className="mr-2 h-3 w-3 opacity-70 shrink-0" />
                          <span className="truncate">{u.name}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))
          )}

          <div className="pt-4 pb-1">
            {!isCollapsed ? (
              <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Finanzas y Bitácora</p>
            ) : (
              <div className="w-full flex justify-center"><div className="h-px bg-slate-800 w-8 my-2"></div></div>
            )}
          </div>
          
          <Link href="/owner/billing" className={`flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-800 ${isCollapsed ? 'justify-center' : ''}`} title="Pagos y Cobros">
            <Receipt className={`${isCollapsed ? 'mr-0' : 'mr-3'} h-5 w-5 text-emerald-400 shrink-0`} />
            {!isCollapsed && <span>Pagos y Cobros</span>}
          </Link>
          <Link href="/owner/payouts" className={`flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-800 ${isCollapsed ? 'justify-center' : ''}`} title="Liquidaciones / Utilidad">
            <Wallet className={`${isCollapsed ? 'mr-0' : 'mr-3'} h-5 w-5 text-emerald-400 shrink-0`} />
            {!isCollapsed && <span>Liquidaciones y Utilidad</span>}
          </Link>
          <Link href="/owner/prospects" className={`flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-800 bg-slate-800/50 border border-blue-500/20 ${isCollapsed ? 'justify-center' : ''}`} title="Catálogo / Prospectos">
            <Users className={`${isCollapsed ? 'mr-0' : 'mr-3'} h-5 w-5 text-blue-400 shrink-0`} />
            {!isCollapsed && <span className="font-semibold text-blue-100">Catálogo / Prospectos</span>}
          </Link>

          {/* Opciones SaaS */}
          {isSaaS && (
            <>
              <div className="pt-4 pb-1">
                {!isCollapsed ? (
                  <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Autogestión SaaS</p>
                ) : (
                  <div className="w-full flex justify-center"><div className="h-px bg-slate-800 w-8 my-2"></div></div>
                )}
              </div>
              <Link href="/owner/properties" className={`flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-800 ${isCollapsed ? 'justify-center' : ''}`} title="Edificios Base">
                <Building2 className={`${isCollapsed ? 'mr-0' : 'mr-3'} h-4 w-4 text-slate-400 shrink-0`} />
                {!isCollapsed && <span>Edificios Base</span>}
              </Link>
              <Link href="/owner/tenants" className={`flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-800 ${isCollapsed ? 'justify-center' : ''}`} title="Inquilinos">
                <Users className={`${isCollapsed ? 'mr-0' : 'mr-3'} h-4 w-4 text-slate-400 shrink-0`} />
                {!isCollapsed && <span>Inquilinos</span>}
              </Link>
              <Link href="/owner/leases" className={`flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-800 ${isCollapsed ? 'justify-center' : ''}`} title="Contratos">
                <FileText className={`${isCollapsed ? 'mr-0' : 'mr-3'} h-4 w-4 text-slate-400 shrink-0`} />
                {!isCollapsed && <span>Contratos</span>}
              </Link>
              <Link href="/owner/incidents" className={`flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-800 ${isCollapsed ? 'justify-center' : ''}`} title="Tickets Mantenimiento">
                <AlertCircle className={`${isCollapsed ? 'mr-0' : 'mr-3'} h-4 w-4 text-slate-400 shrink-0`} />
                {!isCollapsed && <span>Tickets Mantenimiento</span>}
              </Link>
              <Link href="/owner/store" className={`flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-indigo-900 bg-indigo-900/30 text-indigo-200 mt-2 ${isCollapsed ? 'justify-center' : ''}`} title="App Store">
                <Building2 className={`${isCollapsed ? 'mr-0' : 'mr-3'} h-4 w-4 text-indigo-400 shrink-0`} />
                {!isCollapsed && <span className="font-bold">App Store (Módulos)</span>}
              </Link>
            </>
          )}

          <div className="pt-4 pb-1">
            {!isCollapsed ? (
              <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Soporte y Cuenta</p>
            ) : (
              <div className="w-full flex justify-center"><div className="h-px bg-slate-800 w-8 my-2"></div></div>
            )}
          </div>

          <Link href="/owner/settings" className={`flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-800 ${isCollapsed ? 'justify-center' : ''}`} title="Ajustes Básicos">
            <Settings className={`${isCollapsed ? 'mr-0' : 'mr-3'} h-5 w-5 text-slate-400 shrink-0`} />
            {!isCollapsed && <span>Ajustes Básicos</span>}
          </Link>
        </nav>
      </div>

      <div className="border-t border-slate-800 p-4">
        <button 
          onClick={() => logout()}
          title="Cerrar Sesión"
          className={`w-full flex items-center rounded-md px-3 py-2 text-sm font-medium text-rose-400 hover:bg-slate-800 hover:text-rose-300 transition-colors ${isCollapsed ? 'justify-center' : 'text-left'}`}
        >
          <LogOut className={`${isCollapsed ? 'mr-0' : 'mr-3'} h-5 w-5 shrink-0`} />
          {!isCollapsed && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </div>
  );
}
