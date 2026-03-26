"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Receipt, FileText, Download, CheckCircle, Clock, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";

type Invoice = {
  id: string;
  payment: {
      charge: {
          lease: {
              tenant: {
                  firstName: string;
                  lastName: string;
              }
          }
      }
  };
  uuidSAT: string;
  status: string;
  createdAt: string;
};

export default function InvoicesListPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await api.get('/invoices');
        setInvoices(response.data);
      } catch (error) {
        console.error("Error fetching invoices:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const filteredInvoices = invoices.filter(inv => {
    const tenantName = `${inv.payment?.charge?.lease?.tenant?.firstName || ''} ${inv.payment?.charge?.lease?.tenant?.lastName || ''}`.trim();
    return tenantName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Facturación (CFDI 4.0)</h2>
        <Button>
          <Receipt className="mr-2 h-4 w-4" /> Timbrar Factura Global
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Facturas</CardTitle>
          <CardDescription>
            Administre las facturas emitidas y pendientes de timbrar ante el SAT.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-6 text-center text-slate-500">Cargando facturas...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receptor</TableHead>
                  <TableHead>RFC</TableHead>
                  <TableHead>Monto (MXN)</TableHead>
                  <TableHead>Fecha Emisión</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {invoice.payment?.charge?.lease?.tenant?.firstName} {invoice.payment?.charge?.lease?.tenant?.lastName}
                    </TableCell>
                    <TableCell>GENERIC-RFC</TableCell>
                    <TableCell>---</TableCell>
                    <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {invoice.status === 'ISSUED' ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                          <CheckCircle className="mr-1 h-3 w-3" /> Timbrado
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                          <Clock className="mr-1 h-3 w-3" /> Pendiente
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {invoice.status === 'ISSUED' ? (
                          <>
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-2" /> PDF
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" /> XML
                            </Button>
                          </>
                        ) : (
                          <Button variant="default" size="sm">
                            <Receipt className="h-4 w-4 mr-2" /> Timbrar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredInvoices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                      {invoices.length === 0 ? "No hay facturas registradas." : "No se encontró ninguna factura."}
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
