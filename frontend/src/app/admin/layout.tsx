"use client";

import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/components/AuthProvider";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AdminLayout({
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
    <div className="flex h-screen bg-white dark:bg-slate-900 transition-colors">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b dark:border-slate-800 bg-white dark:bg-slate-900 px-6 transition-colors">
          <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Panel Operativo</h1>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:block">{user?.name}</span>
            <div className="h-8 w-8 rounded-full bg-blue-600 flex justify-center items-center text-white font-bold">
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-6 transition-colors">
          {children}
        </main>
      </div>
    </div>
  );
}
