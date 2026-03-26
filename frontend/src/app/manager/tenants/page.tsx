"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Plus, Edit, Trash2, Mail, Phone, Home } from "lucide-react";

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
  leases?: Array<{
    unit: {
      name: string;
      property: {
        name: string;
      }
    }
  }>;
};

export default function OwnerTenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Hero Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 sm:p-8 gap-5">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 bg-blue-50 rounded-2xl shadow-sm border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Users className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Mis Inquilinos</h1>
            <p className="text-slate-500 mt-1 max-w-xl">
              Administra la información de las personas que rentan tus propiedades. 
              {tenants.length > 0 && ` Tienes ${tenants.length} inquilino(s) registrado(s).`}
            </p>
          </div>
        </div>
        <div className="w-full sm:w-auto shrink-0 mt-4 sm:mt-0">
          <AddTenantDialog onTenantAdded={fetchTenants} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-bold text-slate-900">Directorio General</h3>
        </div>
        <div>
          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : tenants.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-semibold py-4">Inquilino</TableHead>
                    <TableHead className="font-semibold">Contacto</TableHead>
                    <TableHead className="font-semibold">Propiedad Actual</TableHead>
                    <TableHead className="text-right font-semibold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenants.map((tenant) => (
                    <TableRow key={tenant.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-medium py-4">
                        <div className="flex items-center gap-3 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => window.location.href = `/manager/tenants/${tenant.id}`}>
                          <div className="h-9 w-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 text-sm font-bold shadow-sm">
                            {tenant.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="block font-bold">{tenant.name}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-slate-600 text-sm">
                            <Mail className="mr-2 h-3.5 w-3.5 text-slate-400" />
                            {tenant.email}
                          </div>
                          <div className="flex items-center text-slate-600 text-sm">
                            <Phone className="mr-2 h-3.5 w-3.5 text-slate-400" />
                            {tenant.phone || "Sin teléfono"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {tenant.leases && tenant.leases.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {tenant.leases.map((lease, idx) => (
                              <span key={idx} className="inline-flex items-center text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded-md max-w-max">
                                <Home className="h-3 w-3 mr-1" />
                                {lease.unit.property.name} - {lease.unit.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Sin asignar</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" className="hidden sm:flex hover:bg-indigo-50 hover:text-indigo-600 border-indigo-100" onClick={() => window.location.href = `/manager/tenants/${tenant.id}`}>
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
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-16 text-center">
              <Users className="mx-auto h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium tracking-tight text-slate-900">No tienes inquilinos aún</h3>
              <p className="text-slate-500 mt-2 max-w-sm mx-auto">Registra la información de contacto de las personas que van a rentar tus locales.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
