"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Plus, Search, ExternalLink, RefreshCw, Pencil, Trash2, MessageCircle, Mail, Receipt } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import AddQuotationDialog from "@/components/AddQuotationDialog";
import EditQuotationDialog from "@/components/EditQuotationDialog";

interface Quotation {
  id: string;
  prospectName: string;
  prospectEmail: string;
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

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingQuotationId, setEditingQuotationId] = useState<string | null>(null);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const res = await api.get("/quotations");
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

  const handleShareWhatsApp = (quote: Quotation) => {
    const link = `${window.location.origin}/quote/${quote.id}`;
    const text = `Hola ${quote.prospectName}, te envío la propuesta comercial para la administración de tus propiedades:\n\n${link}\n\nQuedo a tu disposición por cualquier duda.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareEmail = (quote: Quotation) => {
    const link = `${window.location.origin}/quote/${quote.id}`;
    const subject = `Propuesta Comercial de Administración de Propiedades`;
    const body = `Hola ${quote.prospectName},\n\nTe envío la propuesta comercial para la administración de tus propiedades.\n\nPuedes verla y aceptarla en el siguiente enlace:\n${link}\n\nQuedo a tu disposición por cualquier duda.`;
    const to = quote.prospectEmail || '';
    window.open(`mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta cotización?")) return;
    try {
      await api.delete(`/quotations/${id}`);
      fetchQuotations();
    } catch (error: any) {
      console.error("Error deleting quotation", error);
      alert(error.response?.data?.message || "No se pudo eliminar la cotización");
    }
  };

  const openEditDialog = (id: string) => {
    setEditingQuotationId(id);
    setIsEditDialogOpen(true);
  };

  const handleRequestBilling = async (id: string) => {
    if (!window.confirm("¿Confirmar el traspaso de esta cotización al Administrador para su facturación y cobro?")) return;
    try {
      await api.patch(`/quotations/${id}/request-billing`);
      fetchQuotations();
      alert("Solicitud enviada al Administrador correctamente.");
    } catch (error: any) {
      console.error("Error al solicitar facturación", error);
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
        return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">Pendiente Facturación</span>;
      case "INVOICED":
        return <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full font-medium">Facturada / Activa</span>;
      case "REJECTED":
        return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">Rechazada</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 text-xs px-2 py-1 rounded-full font-medium">{status}</span>;
    }
  };

  const filteredQuotes = quotations.filter((q) =>
    q.prospectName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Cotizaciones</h1>
          <p className="text-slate-500 text-sm mt-1">
            Gestiona prospectos y envía cotizaciones comerciales.
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Nueva Cotización
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar prospecto..."
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
                <TableHead>Prospecto</TableHead>
                <TableHead>Plan Seleccionado</TableHead>
                <TableHead>Propiedades</TableHead>
                <TableHead>Monto Inicial</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    Cargando cotizaciones...
                  </TableCell>
                </TableRow>
              ) : filteredQuotes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    No se encontraron cotizaciones. Envía tu primera propuesta.
                  </TableCell>
                </TableRow>
              ) : (
                filteredQuotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell>
                      <div className="font-medium text-slate-900">{quote.prospectName}</div>
                      <div className="text-xs text-slate-500">{quote.prospectEmail || "Sin correo"}</div>
                    </TableCell>
                    <TableCell>{quote.managementPlan?.name || "N/A"}</TableCell>
                    <TableCell>{quote.propertyCount}</TableCell>
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
                        title="Copiar Enlace Público"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleShareWhatsApp(quote)}
                        className="text-slate-600 hover:text-green-600 hover:bg-green-50 h-8 w-8"
                        title="Enviar por WhatsApp"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleShareEmail(quote)}
                        className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 h-8 w-8"
                        title="Enviar por Email"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      {(quote.status === "ACCEPTED" || quote.status === "PENDING_INVOICE") && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleRequestBilling(quote.id)}
                          className="text-amber-500 hover:text-amber-700 hover:bg-amber-50 h-8 w-8"
                          title="Solicitar Facturación a Admin"
                          disabled={quote.status === "PENDING_INVOICE"}
                        >
                          <Receipt className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => openEditDialog(quote.id)}
                        className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 h-8 w-8"
                        title="Editar Cotización"
                        disabled={quote.status === "ACCEPTED"}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(quote.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                        title="Eliminar Cotización"
                        disabled={quote.status === "ACCEPTED"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AddQuotationDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
        onSuccess={fetchQuotations} 
      />

      <EditQuotationDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={fetchQuotations}
        quotationId={editingQuotationId}
      />
    </div>
  );
}
