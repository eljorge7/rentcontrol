"use client";

import { useState, useEffect } from "react";
import { TenantSidebar } from "@/components/TenantSidebar";
import api from "@/lib/api";

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [tenantName, setTenantName] = useState("Cargando...");
  const [initial, setInitial] = useState("");

  useEffect(() => {
    // Simulate getting the logged in user
    api.get('/tenants').then(res => {
      if(res.data.length > 0) {
        const name = res.data[0].name;
        setTenantName(name);
        setInitial(name.charAt(0).toUpperCase());
      } else {
        setTenantName("Invitado");
        setInitial("I");
      }
    }).catch(err => {
      console.error(err);
      setTenantName("Usuario");
      setInitial("U");
    });
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <TenantSidebar />
      <div className="flex flex-1 flex-col overflow-y-auto">
        <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
          <div className="text-lg font-semibold text-slate-800">Portal del Inquilino</div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">Bienvenido, {tenantName}</span>
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">{initial}</div>
          </div>
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
