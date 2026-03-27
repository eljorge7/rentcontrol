"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Plus, Edit, Calendar, FileText, ExternalLink } from "lucide-react";
import api from "@/lib/api";
import { AddPaymentDialog } from "@/components/AddPaymentDialog";
import { AddChargeDialog } from "@/components/AddChargeDialog";
import { EditChargeDialog } from "@/components/EditChargeDialog";
import { DeleteChargeDialog } from "@/components/DeleteChargeDialog";

type Charge = {
  id: string;
  tenant: {
    name: string;
  };
  lease: {
      tenant: {
        name: string;
      }
  };
  description: string;
  amount: number;
  dueDate: string;
  status: string;
  type?: string;
  payments?: { amount: number }[];
};

export default function PaymentsListPage() {
  const [charges, setCharges] = useState<Charge[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCharges = async () => {
    try {
      const response = await api.get('/charges');
      setCharges(response.data);
    } catch (error) {
      console.error("Error fetching charges:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharges();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Pagos y Cargos</h2>
        <div className="flex gap-2">
          <AddChargeDialog onChargeAdded={fetchCharges} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estado de Cuenta</CardTitle>
          <CardDescription>
            Administre los cargos mensuales y registre los pagos de los inquilinos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-6 text-center text-slate-500">Cargando cargos...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Inquilino</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Monto Base</TableHead>
                  <TableHead>Abonado / Resta</TableHead>
                  <TableHead>Fecha Venc...</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {charges.map((charge) => {
                  const paid = charge.payments?.reduce((acc, p) => acc + p.amount, 0) || 0;
                  const remaining = charge.amount - paid;
                  
                  // Parsear descripción de pagos reportados de forma segura
                  const desc = charge.description || "";
                  const isReported = desc.includes('[Reportado el');
                  const cleanDesc = desc.replace(/ \[Reportado el.*?\]/, '');
                  
                  // Regex ultra-flexible para extraer datos sin importar errores de separadores
                  const refMatch = desc.match(/Ref: ([^|\]]+)/);
                  const notaMatch = desc.match(/Notas: ([^|\]]+)/);
                  const receiptMatch = desc.match(/Archivo: (\/.*?charges\/receipt\/[^\]]+)/);
                  
                  const receiptPath = receiptMatch ? receiptMatch[1].trim() : null;
                  const finalReceiptPath = receiptPath?.replace(/^\/api/, '') || receiptPath;
                  const fullReceiptUrl = finalReceiptPath ? `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}`}${finalReceiptPath}` : null;

                  const reference = refMatch ? refMatch[1].trim() : null;
                  const nota = notaMatch ? notaMatch[1].trim() : null;

                  return (
                  <TableRow key={charge.id}>
                    <TableCell className="font-medium">
                      {charge.lease?.tenant?.name}
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="font-semibold block">{cleanDesc}</span>
                        {isReported && (
                          <div className="mt-1 space-y-1">
                            {reference && <span className="text-xs text-slate-500 block">Ref: {reference}</span>}
                            {nota && nota !== 'N/A' && (
                              <span className="text-[10px] text-slate-400 block italic whitespace-pre-wrap">Nota: {nota}</span>
                            )}
                            {fullReceiptUrl && (
                               <a href={fullReceiptUrl} target="_blank" rel="noreferrer" className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded transition-colors mt-1">
                                 <FileText className="h-3 w-3 mr-1" />
                                 Ver Comprobante
                                 <ExternalLink className="h-3 w-3 ml-1" />
                               </a>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>${charge.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className="text-green-600 block text-xs">Abono: ${paid.toLocaleString()}</span>
                      <span className="text-red-600 block text-xs font-semibold">Resta: ${remaining.toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-slate-500">
                        <Calendar className="mr-2 h-3 w-3" />
                        {new Date(charge.dueDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        charge.status === 'PAID' ? 'bg-green-100 text-green-800' : charge.status === 'REPORTED' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {charge.status === 'PAID' ? 'Pagado' : charge.status === 'REPORTED' ? 'En Revisión (Pagado en Banco)' : 'Pendiente'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {charge.status !== 'PAID' && (
                          <>
                            <AddPaymentDialog charge={charge} onPaymentAdded={fetchCharges} />
                            <EditChargeDialog charge={{...charge, type: charge.type || "RENT", description: cleanDesc}} onChargeUpdated={fetchCharges} />
                            <DeleteChargeDialog chargeId={charge.id} amount={charge.amount} description={cleanDesc} onChargeDeleted={fetchCharges} />
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  );
                })}
                {charges.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                      No hay cargos registrados.
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
