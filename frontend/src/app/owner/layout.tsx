"use client";

import { OwnerSidebar } from "@/components/OwnerSidebar";
import { useAuth } from "@/components/AuthProvider";

export default function OwnerLayout({
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
    <div className="flex h-screen bg-white print:bg-white print:h-auto">
      <div className="print:hidden h-full">
        <OwnerSidebar />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden print:overflow-visible">
        <header className="flex h-16 items-center justify-between border-b bg-white px-6 print:hidden">
          <h1 className="text-xl font-semibold text-slate-800">Panel del Propietario</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-700 hidden sm:block">{user?.name}</span>
            <div className="h-8 w-8 rounded-full bg-emerald-600 flex justify-center items-center text-white font-bold">
              {user?.name ? user.name.charAt(0).toUpperCase() : "P"}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6 print:p-0 print:bg-white print:overflow-visible">
          {children}
        </main>
      </div>
    </div>
  );
}
