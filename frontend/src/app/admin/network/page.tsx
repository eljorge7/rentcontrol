"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wifi, Plus, Edit, Trash2, ShieldAlert, Zap, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { AddRouterDialog } from "@/components/AddRouterDialog";
import { EditRouterDialog } from "@/components/EditRouterDialog";
import { DeleteRouterDialog } from "@/components/DeleteRouterDialog";
import { AddProfileDialog } from "@/components/AddProfileDialog";
import { EditProfileDialog } from "@/components/EditProfileDialog";
import { MikrotikScriptDialog } from "@/components/MikrotikScriptDialog";
import { DeleteProfileDialog } from "@/components/DeleteProfileDialog";

type MikrotikRouter = {
  id: string;
  name: string;
  ipAddress: string;
  apiPort: number;
  username: string;
  isActive: boolean;
  property?: {
    id: string;
    name: string;
  };
  vpnIp?: string;
  vpnHost?: string;
};

type NetworkProfile = {
  id: string;
  name: string;
  downloadSpeed: number;
  uploadSpeed: number;
  price?: number;
};

export default function NetworkPage() {
  const [routers, setRouters] = useState<MikrotikRouter[]>([]);
  const [profiles, setProfiles] = useState<NetworkProfile[]>([]);
  const [loadingRouters, setLoadingRouters] = useState(true);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [activeTab, setActiveTab] = useState("routers");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchRouters = async () => {
    try {
      const response = await api.get('/mikrotik');
      setRouters(response.data);
    } catch (error) {
      console.error("Error fetching routers:", error);
    } finally {
      setLoadingRouters(false);
    }
  };

  const fetchProfiles = async () => {
    try {
      const response = await api.get('/network-profiles');
      setProfiles(response.data);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    } finally {
      setLoadingProfiles(false);
    }
  };

  const testConnection = async (id: string, name: string) => {
    try {
      // In a real app we'd use a toast, but alert is fine for now
      alert(`Probando conexión con ${name}... por favor espere.`);
      const response = await api.get(`/mikrotik/${id}/test`);
      
      if (response.data.success) {
        alert(`✅ Conexión Exitosa con ${name}!\n\nIdentidad recibida: ${response.data.data[0]?.name || 'Mikrotik'}`);
      } else {
        alert(`❌ Fallo de Conexión con ${name}\n\nError: ${response.data.message}`);
      }
    } catch (error: any) {
      console.error("Connection test error:", error);
      alert(`❌ Error al conectar con ${name}\n\nDetalles: ${error.response?.data?.message || error.message}`);
    }
  };

  useEffect(() => {
    fetchRouters();
    fetchProfiles();
  }, []);

  const filteredRouters = routers.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.ipAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.property?.name.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const filteredProfiles = profiles.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Infraestructura de Red y Perfiles</h2>
      </div>

      <div className="flex w-full mb-6 border-b">
        <button 
          onClick={() => setActiveTab('routers')}
          className={`px-4 py-3 font-semibold text-sm ${activeTab === 'routers' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Equipos Mikrotik
        </button>
        <button 
          onClick={() => setActiveTab('profiles')}
          className={`px-4 py-3 font-semibold text-sm ${activeTab === 'profiles' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Planes de Velocidad
        </button>
      </div>

      {activeTab === 'routers' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Buscar router, IP o edificio..."
                className="pl-9 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <AddRouterDialog onRouterAdded={fetchRouters} />
          </div>
          <Card>
        <CardHeader>
          <CardTitle>Equipos Administrados</CardTitle>
          <CardDescription>
            Configura los routers Mikrotik para control automatizado de velocidad y acceso a internet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingRouters ? (
            <div className="py-6 text-center text-slate-500">Cargando routers...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre / Identificador</TableHead>
                  <TableHead>Dirección IP</TableHead>
                  <TableHead>VPN Cloud</TableHead>
                  <TableHead>Puerto API</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Edificio</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRouters.map((router) => (
                  <TableRow key={router.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                       <Wifi className="h-4 w-4 text-blue-500" /> {router.name}
                    </TableCell>
                    <TableCell>{router.ipAddress}</TableCell>
                    <TableCell>
                      {router.vpnHost && router.vpnIp ? (
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-blue-600">{router.vpnHost}</span>
                          <span className="text-xs text-slate-500">{router.vpnIp}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Sin VPN</span>
                      )}
                    </TableCell>
                    <TableCell>{router.apiPort}</TableCell>
                    <TableCell>{router.username}</TableCell>
                    <TableCell>
                      {router.property ? (
                        <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10">
                          {router.property.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Sin Asignar</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        router.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {router.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => testConnection(router.id, router.name)}>
                          <ShieldAlert className="h-4 w-4 mr-2" />
                          Test Conexión
                        </Button>
                        <MikrotikScriptDialog routerId={router.id} routerName={router.name} />
                        <EditRouterDialog router={router} onRouterUpdated={fetchRouters} />
                        <DeleteRouterDialog routerId={router.id} routerName={router.name} onRouterDeleted={fetchRouters} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredRouters.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-slate-500">
                      {routers.length === 0 ? "No hay equipos Mikrotik registrados aún." : "No se encontraron routers con esa búsqueda."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
        </div>
      )}

      {activeTab === 'profiles' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Buscar perfil de velocidad..."
                className="pl-9 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <AddProfileDialog onProfileAdded={fetchProfiles} />
          </div>
        <Card>
          <CardHeader>
            <CardTitle>Planes de Internet</CardTitle>
            <CardDescription>
              Administre los perfiles de velocidad para los inquilinos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingProfiles ? (
              <div className="py-6 text-center text-slate-500">Cargando planes...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre del Plan</TableHead>
                    <TableHead>Velocidad de Descarga</TableHead>
                    <TableHead>Velocidad de Subida</TableHead>
                    <TableHead>Costo Mensual</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <Zap className="h-4 w-4 text-amber-500" /> {profile.name}
                      </TableCell>
                      <TableCell>{profile.downloadSpeed} Mbps</TableCell>
                      <TableCell>{profile.uploadSpeed} Mbps</TableCell>
                      <TableCell>${profile.price || 0} MXN</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <EditProfileDialog profile={profile} onProfileUpdated={fetchProfiles} />
                          <DeleteProfileDialog profileId={profile.id} profileName={profile.name} onProfileDeleted={fetchProfiles} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredProfiles.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                        {profiles.length === 0 ? "No hay planes de velocidad registrados." : "No se encontraron planes con esa búsqueda."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        </div>
      )}
    </div>
  );
}
