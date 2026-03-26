"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Plus, Home, Users, Calendar, DollarSign, ExternalLink, Building2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import api from "@/lib/api";
import { AddLeaseDialog } from "@/components/AddLeaseDialog";
import { EditLeaseDialog } from "@/components/EditLeaseDialog";
import { DeleteLeaseDialog } from "@/components/DeleteLeaseDialog";

type Lease = {
  id: string;
  startDate: string;
  endDate?: string;
  rentAmount: number;
  paymentDay: number;
  status: string;
  unit: {
    id: string;
    name: string;
    property: {
      name: string;
    }
  };
  tenant: {
    name: string;
    email: string;
  };
};

interface LeasesViewerProps {
  roleBasePath: string;
}

export function LeasesViewer({ roleBasePath }: LeasesViewerProps) {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLeases = async () => {
    try {
      const response = await api.get('/leases');
      setLeases(response.data);
    } catch (error) {
      console.error("Error fetching leases:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeases();
  }, []);

  const filteredLeases = leases.filter(lease => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    
    // Safety checks for undefined objects
    const tenantName = lease.tenant?.name?.toLowerCase() || "";
    const propertyName = lease.unit?.property?.name?.toLowerCase() || "";
    const unitName = lease.unit?.name?.toLowerCase() || "";
    
    return tenantName.includes(term) || propertyName.includes(term) || unitName.includes(term);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Hero Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 sm:p-8 gap-5">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 bg-blue-50 rounded-2xl shadow-sm border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <FileText className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Directorio de Contratos</h1>
            <p className="text-slate-500 mt-1 max-w-xl">
              Visualiza y gestiona los contratos activos de alquiler en tus propiedades. 
              {leases.length > 0 && ` Tienes ${leases.length} contrato(s) registrado(s).`}
            </p>
          </div>
        </div>
        <div className="w-full sm:w-auto shrink-0 mt-4 sm:mt-0">
          <AddLeaseDialog onLeaseAdded={fetchLeases} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-400" />
            Contratos ({filteredLeases.length})
          </h3>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Buscar inquilino, plaza o local..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 bg-white border-slate-200"
            />
          </div>
        </div>
        <div>
          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredLeases.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-semibold py-4">Inquilino</TableHead>
                    <TableHead className="font-semibold">Local / Edificio</TableHead>
                    <TableHead className="font-semibold">Condiciones</TableHead>
                    <TableHead className="text-right font-semibold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeases.map((lease) => (
                    <TableRow key={lease.id} className={`hover:bg-slate-50/50 transition-colors ${lease.status !== 'ACTIVE' ? 'opacity-70 bg-slate-50' : ''}`}>
                      <TableCell className="font-medium py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold shrink-0">
                            {lease.tenant?.name?.substring(0, 2).toUpperCase() || "??"}
                          </div>
                          <div>
                            <span className="block text-slate-900 font-semibold">{lease.tenant?.name || "Sin Inquilino"}</span>
                            <span className="block text-xs text-slate-500 font-normal">{lease.tenant?.email}</span>
                            {lease.status !== 'ACTIVE' && (
                               <span className="inline-block mt-1 text-[10px] font-bold tracking-wider text-slate-500 bg-slate-200 px-2 py-0.5 rounded uppercase">Finalizado</span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center font-medium text-slate-800 text-sm">
                            <Home className="mr-2 h-3.5 w-3.5 text-slate-400" />
                            {lease.unit?.name || "Local Desconocido"}
                          </div>
                          <div className="flex items-center text-slate-500 text-xs">
                            <Building2 className="mr-2 h-3.5 w-3.5 text-slate-300 opacity-0" />
                            {lease.unit?.property?.name || "Propiedad Desconocida"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-emerald-600 font-bold text-sm">
                            <DollarSign className="mr-1 h-3.5 w-3.5" />
                            {lease.rentAmount.toLocaleString()} MXN / mes
                          </div>
                          <div className="flex items-center text-slate-500 text-xs">
                            <Calendar className="mr-2 h-3.5 w-3.5 text-slate-400" />
                            Día de pago: {lease.paymentDay}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`${roleBasePath}/leases/${lease.id}`} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-blue-50 hover:text-blue-700 h-8 px-3 py-2 text-blue-600">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Detalles
                          </Link>
                          <EditLeaseDialog 
                            lease={lease as any} 
                            onLeaseUpdated={fetchLeases} 
                          />
                          <DeleteLeaseDialog 
                            lease={lease as any} 
                            onLeaseDeleted={fetchLeases} 
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-16 text-center border-t border-slate-100">
              <FileText className="mx-auto h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium tracking-tight text-slate-900">
                {searchTerm ? "No se encontraron contratos" : "Aún no hay contratos firmados"}
              </h3>
              <p className="text-slate-500 mt-2 max-w-sm mx-auto text-sm">
                {searchTerm ? "Intenta con otras palabras clave." : "Elige un inquilino y únelo a uno de tus locales para generar tu primer contrato de renta."}
              </p>
              {!searchTerm && (
                <div className="mt-6 flex justify-center">
                  <AddLeaseDialog onLeaseAdded={fetchLeases} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
