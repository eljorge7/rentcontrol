"use client";

import { useState, useEffect } from "react";
import { CreditCard, Plus, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import { getAuthHeaders } from "@/lib/auth";
import { cleanDescription } from "@/lib/utils";

interface AccountStatementProps {
  leaseId: string;
}

export function AccountStatement({ leaseId }: AccountStatementProps) {
  const [charges, setCharges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Formularios
  const [isChargeDialogOpen, setChargeDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedCharge, setSelectedCharge] = useState<any>(null);

  const fetchCharges = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/charges?leaseId=${leaseId}`);
      setCharges(response.data);
    } catch (error) {
      console.error("Error fetching charges:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharges();
  }, [leaseId]);

  const handleCreateCharge = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await api.post('/charges', {
        leaseId,
        amount: parseFloat(formData.get('amount') as string),
        type: formData.get('type'),
        description: formData.get('description'),
        dueDate: formData.get('dueDate'),
        status: 'PENDING'
      });
      setChargeDialogOpen(false);
      fetchCharges();
    } catch (error) {
      console.error("Error creating charge:", error);
      alert("No se pudo crear el cargo.");
    }
  };

  const handleRegisterPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCharge) return;
    const formData = new FormData(e.currentTarget);
    try {
      await api.post('/payments', {
        chargeId: selectedCharge.id,
        amount: parseFloat(formData.get('amount') as string),
        method: formData.get('method'),
        reference: formData.get('reference') || '',
        date: new Date().toISOString()
      });
      setPaymentDialogOpen(false);
      setSelectedCharge(null);
      fetchCharges();
    } catch (error) {
      console.error("Error registering payment:", error);
      alert("No se pudo registrar el pago.");
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const res = await fetch(`http://localhost:3001/pdfs/account-statement/${leaseId}`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error("File not found");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `estado_de_cuenta_${leaseId.split('-')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Hubo un error al descargar el PDF.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <span className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-xs font-semibold uppercase"><CheckCircle2 className="h-3 w-3" /> Pagado</span>;
      case 'PARTIAL':
        return <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs font-semibold uppercase"><Clock className="h-3 w-3" /> Parcial</span>;
      case 'PENDING':
        return <span className="flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-800 rounded text-xs font-semibold uppercase"><Clock className="h-3 w-3" /> Pendiente</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-semibold uppercase">{status}</span>;
    }
  };

  const getTypeTranslate = (type: string) => {
    const map: any = {
      'RENT': 'Renta Mensual',
      'INTERNET': 'Servicio de Internet',
      'MAINTENANCE': 'Mantenimiento',
      'PENALTY': 'Recargo/Multa',
      'OTHER': 'Otro Cargo'
    };
    return map[type] || type;
  };

  if (loading) return <div className="p-8 text-center text-sm text-slate-500">Cargando estado de cuenta...</div>;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center flex-wrap gap-4">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-indigo-500" />
          Estado de Cuenta
        </h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleDownloadPDF} className="border-slate-200">
            Descargar PDF
          </Button>
          <Dialog open={isChargeDialogOpen} onOpenChange={setChargeDialogOpen}>
          {/* @ts-ignore */}
          <DialogTrigger asChild>
            <Button size="sm" className="bg-slate-900 text-white hover:bg-slate-800"><Plus className="h-4 w-4 mr-2" /> Nuevo Cargo</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Añadir Cargo al Contrato</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateCharge} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Tipo de Cargo</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="type-rent" name="type" value="RENT" required defaultChecked className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                    <label htmlFor="type-rent" className="text-sm font-medium text-gray-900">Renta</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="type-penalty" name="type" value="PENALTY" className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                    <label htmlFor="type-penalty" className="text-sm font-medium text-gray-900">Multa</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="type-maintenance" name="type" value="MAINTENANCE" className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                    <label htmlFor="type-maintenance" className="text-sm font-medium text-gray-900">Mtto.</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="type-other" name="type" value="OTHER" className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                    <label htmlFor="type-other" className="text-sm font-medium text-gray-900">Otro</label>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Input id="description" name="description" placeholder="Ej. Renta de Mayo, Reparación puerta..." required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Monto ($)</Label>
                  <Input id="amount" name="amount" type="number" step="0.01" min="0" placeholder="0.00" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Fecha de Vencimiento</Label>
                  <Input id="dueDate" name="dueDate" type="date" required />
                </div>
              </div>
              <Button type="submit" className="w-full">Generar Cargo</Button>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="p-0">
        {charges.length === 0 ? (
          <div className="p-8 text-center bg-slate-50/30">
            <h4 className="text-sm font-medium text-slate-600">No hay historial financiero</h4>
            <p className="text-xs text-slate-400 mt-2">
              Aún no se han generado cargos ni registrado pagos para este contrato.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {charges.map(charge => {
              const totalPaid = charge.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;
              const remaining = charge.amount - totalPaid;
              
              return (
                <div key={charge.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                  <div className="flex justify-between items-start flex-wrap gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-bold text-slate-900">${charge.amount.toLocaleString()}</span>
                        {getStatusBadge(charge.status)}
                        {new Date(charge.dueDate) < new Date() && charge.status !== 'PAID' && (
                          <span className="flex items-center gap-1 text-xs text-red-600 font-bold"><AlertCircle className="h-3 w-3" /> VENCIDO</span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-slate-800">{cleanDescription(charge.description) || getTypeTranslate(charge.type)}</p>
                      <p className="text-xs text-slate-500 mt-1">Vence: {new Date(charge.dueDate).toLocaleDateString()}</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {charge.status !== 'PAID' && (
                        <div className="text-right mr-4">
                          <p className="text-xs text-slate-500">Restante</p>
                          <p className="text-sm font-bold text-slate-700">${remaining.toLocaleString()}</p>
                        </div>
                      )}
                      
                      {charge.status !== 'PAID' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                          onClick={() => { setSelectedCharge(charge); setPaymentDialogOpen(true); }}
                        >
                          Abonar Pago
                        </Button>
                      )}
                    </div>
                  </div>

                  {charge.payments && charge.payments.length > 0 && (
                    <div className="mt-4 pl-4 border-l-2 border-slate-100 space-y-2">
                      {charge.payments.map((payment: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            <span className="text-slate-600">Abono {new Date(payment.date).toLocaleDateString()}</span>
                            <span className="text-xs px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-mono">{payment.method}</span>
                          </div>
                          <span className="font-semibold text-emerald-700">+${payment.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={isPaymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pago Recibido</DialogTitle>
          </DialogHeader>
          {selectedCharge && (
            <form onSubmit={handleRegisterPayment} className="space-y-4 mt-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm mb-4">
                <p className="text-slate-500 mb-1">Abonando a:</p>
                <p className="font-medium">{cleanDescription(selectedCharge.description) || getTypeTranslate(selectedCharge.type)}</p>
                <p className="font-bold text-slate-900 mt-1">
                  Deuda restante: ${(selectedCharge.amount - (selectedCharge.payments?.reduce((s:number, p:any) => s + p.amount, 0) || 0)).toLocaleString()}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Monto del Pago ($)</Label>
                <Input 
                  id="amount" 
                  name="amount" 
                  type="number" 
                  step="0.01" 
                  min="0.01" 
                  max={selectedCharge.amount - (selectedCharge.payments?.reduce((s:number, p:any) => s + p.amount, 0) || 0)} 
                  defaultValue={selectedCharge.amount - (selectedCharge.payments?.reduce((s:number, p:any) => s + p.amount, 0) || 0)}
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label>Método de Pago</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="method-cash" name="method" value="CASH" required defaultChecked className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                    <label htmlFor="method-cash" className="text-sm font-medium text-gray-900">Efectivo</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="method-transfer" name="method" value="TRANSFER" className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                    <label htmlFor="method-transfer" className="text-sm font-medium text-gray-900">Transferencia</label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference">Referencia / Folio (Opcional)</Label>
                <Input id="reference" name="reference" placeholder="Ej. FOLIO-12345" />
              </div>
              
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">Confirmar Recepción</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
