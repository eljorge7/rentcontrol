"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Plus, Edit, Trash2, Mail, Phone, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

import api from "@/lib/api";
import { AddTenantDialog } from "@/components/AddTenantDialog";
import { EditTenantDialog } from "@/components/EditTenantDialog";
import { DeleteTenantDialog } from "@/components/DeleteTenantDialog";

type Tenant = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  rfc?: string;
  taxRegimen?: string;
  zipCode?: string;
};

export default function TenantsListPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchTenants = async () => {
    try {
      const response = await api.get('/tenants');
      setTenants(response.data);
    } catch (error) {
      console.error("Error fetching tenants:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Inquilinos</h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar inquilino..."
              className="pl-9 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <AddTenantDialog onTenantAdded={fetchTenants} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Directorio de Inquilinos</CardTitle>
          <CardDescription>
            Administra la información de contacto y facturación de  los inquilinos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-6 text-center text-slate-500">Cargando inquilinos...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center cursor-pointer hover:text-indigo-600" onClick={() => window.location.href = `/admin/tenants/${tenant.id}`}>
                        <div className="bg-indigo-50 p-2 rounded-lg mr-3">
                          <Users className="h-4 w-4 text-indigo-500" />
                        </div>
                        <span>{tenant.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-slate-500 font-medium">
                        <Mail className="mr-2 h-3.5 w-3.5 text-slate-400" />
                        {tenant.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-slate-500">
                        <Phone className="mr-2 h-3 w-3" />
                        {tenant.phone || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="hidden sm:flex hover:bg-indigo-50 hover:text-indigo-600 border-indigo-100" onClick={() => window.location.href = `/admin/tenants/${tenant.id}`}>
                          Ver Perfil
                        </Button>
                        <EditTenantDialog 
                          tenant={tenant} 
                          onTenantUpdated={fetchTenants} 
                        />
                        <DeleteTenantDialog 
                          tenant={tenant} 
                          onTenantDeleted={fetchTenants} 
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTenants.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                      {tenants.length === 0 ? "No hay inquilinos registrados." : "No se encontró ningún inquilino."}
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
