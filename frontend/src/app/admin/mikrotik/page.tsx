"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wifi, Plus, Edit, Trash2, Server } from "lucide-react";
import api from "@/lib/api";

type Router = {
  id: string;
  name: string;
  ipAddress: string;
  apiPort: number;
  isActive: boolean;
};

export default function MikrotikListPage() {
  const [routers, setRouters] = useState<Router[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRouters = async () => {
      try {
        const response = await api.get('/mikrotik');
        setRouters(response.data);
      } catch (error) {
        console.error("Error fetching mikrotik routers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRouters();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Servidores Mikrotik</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Agregar Router
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dispositivos Mikrotik Conectados</CardTitle>
          <CardDescription>
            Administra los routers encargados de controlar el acceso a internet de los inquilinos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-6 text-center text-slate-500">Cargando routers...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre del Equipo</TableHead>
                  <TableHead>Dirección IP</TableHead>
                  <TableHead>Puerto API</TableHead>
                  <TableHead>Estado de Conexión</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routers.map((router) => (
                  <TableRow key={router.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Server className="mr-2 h-4 w-4 text-slate-400" />
                        {router.name}
                      </div>
                    </TableCell>
                    <TableCell>{router.ipAddress}</TableCell>
                    <TableCell>{router.apiPort}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        router.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {router.isActive ? 'Conectado' : 'Desconectado'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button variant="destructive" size="icon" className="h-8 w-8">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {routers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                      No hay routers Mikrotik registrados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
