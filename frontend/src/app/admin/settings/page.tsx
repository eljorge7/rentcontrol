"use client";

import { ProfileSettings } from "@/components/ProfileSettings";
import { SystemSettings } from "@/components/SystemSettings";
import { NotificationsSettings } from "@/components/NotificationsSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon, UserCircle, BellRing } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="py-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Ajustes Globales</h1>
        <p className="text-slate-500 mt-1">Administra tu perfil y las configuraciones del sistema.</p>
      </div>

      <Tabs defaultValue="system" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="system" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm py-2">
            <SettingsIcon className="w-4 h-4 mr-2" />
            Pasarelas / Sistema
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm py-2">
            <BellRing className="w-4 h-4 mr-2" />
            WhatsApp & Correos
          </TabsTrigger>
          <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm py-2">
            <UserCircle className="w-4 h-4 mr-2" />
            Mi Perfil
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="system" className="mt-6 animate-in fade-in duration-300">
          <SystemSettings />
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-6 animate-in fade-in duration-300">
          <NotificationsSettings />
        </TabsContent>

        <TabsContent value="profile" className="mt-6 animate-in fade-in duration-300">
          <ProfileSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
