"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Search, ExternalLink, RefreshCw, Receipt } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

interface Quotation {
  id: string;
  prospectName: string;
  prospectEmail: string;
  manager: {
    name: string;
    email: string;
  };
  managementPlan: {
    id: string;
    name: string;
    fixedFee: number;
  };
  propertyCount: number;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function AdminQuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const res = await api.get("/quotations/admin/all");
      setQuotations(res.data);
    } catch (error) {
      console.error("Error fetching quotations", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleCopyLink = (id: string) => {
    const link = `${window.location.origin}/quote/${id}`;
    navigator.clipboard.writeText(link);
    alert("Enlace copiado al portapapeles");
  };

  const handleMarkAsInvoiced = async (id: string) => {
    if (!window.confirm("¿Confirmar que la cotización ha sido facturada? Esto registrará la ganancia operativa para RentControl.")) return;
    try {
      await api.patch(`/quotations/${id}/invoice`);
      fetchQuotations();
      alert("Facturación registrada correctamente.");
    } catch (error: any) {
      console.error("Error al registrar facturación", error);
      alert(error.response?.data?.message || "Error al procesar la solicitud");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SENT":
        return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">Borrador / Enviado</span>;
      case "ACCEPTED":
        return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">Aceptada</span>;
      case "PENDING_INVOICE":
        return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">Pendiente Facturar</span>;
      case "INVOICED":
        return <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full font-medium">Facturada (Activa)</span>;
      case "REJECTED":
        return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">Rechazada</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 text-xs px-2 py-1 rounded-full font-medium">{status}</span>;
    }
  };

  const filteredQuotes = quotations.filter((q) =>
    (q.prospectName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (q.manager?.name || "").toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Cierre de Ventas Comerciales</h1>
          <p className="text-slate-500 text-sm mt-1">
            Revisa las propuestas aceptadas enviadas por tus gestores y emite la facturación.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar dueño o gestor..."
              className="pl-9 bg-slate-50 border-slate-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={fetchQuotations} className="shrink-0 text-slate-600">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Prospecto / Propietario</TableHead>
                <TableHead>Gestor Asignado</TableHead>
                <TableHead>Plan Seleccionado</TableHead>
                <TableHead>Monto Recurrente</TableHead>
                <TableHead>Estado Financiero</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    Cargando historial comercial...
                  </TableCell>
                </TableRow>
              ) : filteredQuotes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    No se encontraron propuestas con ese registro.
                  </TableCell>
                </TableRow>
              ) : (
                filteredQuotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell>
                      <div className="font-medium text-slate-900">{quote.prospectName}</div>
                      <div className="text-xs text-slate-500">{quote.prospectEmail || "Sin correo"}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-700">{quote.manager?.name || "Global"}</div>
                    </TableCell>
                    <TableCell>{quote.managementPlan?.name || "N/A"} ({quote.propertyCount} props)</TableCell>
                    <TableCell className="font-medium text-slate-900">
                      ${quote.totalAmount.toLocaleString('es-MX')} MXN
                    </TableCell>
                    <TableCell>{getStatusBadge(quote.status)}</TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {new Date(quote.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleCopyLink(quote.id)}
                        className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 h-8 w-8"
                        title="Ver Propuesta"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleMarkAsInvoiced(quote.id)}
                        className={`hover:bg-indigo-50 h-8 w-8 ${quote.status === "PENDING_INVOICE" ? "text-indigo-600" : "text-slate-300"}`}
                        title="Generar Factura & Aceptar"
                        disabled={quote.status !== "PENDING_INVOICE"}
                      >
                        <Receipt className="h-4 w-4" />
                      </Button>
                      
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
