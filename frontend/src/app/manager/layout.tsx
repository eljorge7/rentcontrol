"use client";

import { ManagerSidebar } from "@/components/ManagerSidebar";
import { useAuth } from "@/components/AuthProvider";

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return (
      <div className="flex bg-slate-50 items-center justify-center h-screen w-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <ManagerSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8 shadow-sm z-10">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Panel Principal - Gestor</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-700 hidden sm:block">{user?.name}</span>
            <div className="h-9 w-9 rounded-full bg-blue-600 flex justify-center items-center text-white font-bold shadow-md">
              {user?.name ? user.name.charAt(0).toUpperCase() : "G"}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
