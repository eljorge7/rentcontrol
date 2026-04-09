"use client";

import { ProfileSettings } from "@/components/ProfileSettings";
import { SystemSettings } from "@/components/SystemSettings";
import { NotificationsSettings } from "@/components/NotificationsSettings";
import { Settings as SettingsIcon, UserCircle, BellRing } from "lucide-react";
import { useState, useEffect } from "react";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (typeof window !== 'undefined') {
       if (window.location.hash) {
          const hash = window.location.hash.replace('#', '');
          setActiveTab(hash);
       }
    }
  }, []);

  const tabs = [
    { id: "profile", label: "Mi Cuenta", icon: UserCircle, description: "Administra tu perfil, contraseña y credenciales" },
    { id: "pasarelas", label: "Pasarelas de Pago", icon: SettingsIcon, description: "Conecta Stripe y MercadoPago" },
    { id: "notifications", label: "Centro de Notificaciones", icon: BellRing, description: "Gateway oficial de WhatsApp y correo" }
  ];

  return (
    <div className="max-w-6xl mx-auto pb-12 pt-6">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 border-b border-slate-200 pb-4">
          Ajustes de Plataforma
        </h1>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Navigation Sidebar */}
        <aside className="md:w-[320px] flex-shrink-0 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                window.history.pushState(null, '', `#${tab.id}`);
              }}
              className={`w-full text-left flex items-start gap-4 p-4 rounded-2xl transition-all ${
                activeTab === tab.id 
                ? 'bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 shadow-sm' 
                : 'hover:bg-slate-50 border border-transparent'
              }`}
            >
              <div className={`p-2.5 rounded-xl shrink-0 shadow-sm ${
                activeTab === tab.id 
                ? 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white' 
                : 'bg-white border text-slate-400'
              }`}>
                <tab.icon className="w-5 h-5" />
              </div>
              <div className="mt-1">
                <h3 className={`font-bold text-sm ${
                  activeTab === tab.id ? 'text-indigo-950' : 'text-slate-700'
                }`}>
                  {tab.label}
                </h3>
                <p className={`text-xs mt-0.5 leading-relaxed ${
                  activeTab === tab.id ? 'text-indigo-800/70' : 'text-slate-500'
                }`}>
                  {tab.description}
                </p>
              </div>
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-hidden">
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/40 p-6 md:p-10 min-h-[600px] animate-in slide-in-from-right-4 duration-500">
            {activeTab === "profile" && <ProfileSettings />}
            {activeTab === "pasarelas" && <SystemSettings />}
            {activeTab === "notifications" && <NotificationsSettings />}
          </div>
        </main>
      </div>
    </div>
  );
}
