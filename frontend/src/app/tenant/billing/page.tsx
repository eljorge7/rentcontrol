"use client";

import { useState, useEffect } from "react";
import { AlertCircle, Clock, CheckCircle2, Download, Printer, FileText, CreditCard, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { getAuthHeaders } from "@/lib/auth";
import { cleanDescription } from "@/lib/utils";
import { ReportPaymentDialog } from "@/components/ReportPaymentDialog";

export default function TenantBillingPage() {
  const [charges, setCharges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchCharges();
  }, []);

  const fetchCharges = async () => {
    try {
      const response = await api.get("/charges");
      if (Array.isArray(response.data)) {
        setCharges(response.data);
      } else {
        setCharges([]);
      }
    } catch (error) {
      console.error("Error fetching charges:", error);
      setCharges([]);
    } finally {
      setLoading(false);
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
      case 'REPORTED':
        return <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold uppercase"><Clock className="h-3 w-3" /> En Revisión</span>;
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const handleDownloadPDF = async () => {
    const leaseId = charges.length > 0 ? charges[0].leaseId : null;
    if (!leaseId) return alert("No tienes un contrato activo o estado de cuenta disponible.");
    
    setDownloading(true);
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
      alert("Hubo un error al descargar tu estado de cuenta.");
    } finally {
      setDownloading(false);
    }
  };

  // Calculate stats
  const pendingCharges = (charges || []).filter(c => c && c.status !== 'PAID' && c.status !== 'CANCELLED');
  const totalDebt = pendingCharges.reduce((sum, charge) => {
    const paid = charge?.payments?.reduce((s: number, p: any) => s + (p?.amount || 0), 0) || 0;
    return sum + ((charge?.amount || 0) - paid);
  }, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Estado de Cuenta</h1>
          <p className="text-slate-500 mt-1">Revisa tus últimos cargos y el historial de tus pagos registrados.</p>
        </div>
        <button 
          disabled={downloading || charges.length === 0} 
          onClick={handleDownloadPDF} 
          className={`inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm ${downloading || charges.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {downloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          Descargar PDF
        </button>
      </div>

      {totalDebt > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-red-800 uppercase tracking-wider mb-1">Total a Pagar</p>
              <h2 className="text-3xl font-black text-red-600">${totalDebt.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
            </div>
            <div className="p-3 bg-red-100 text-red-600 rounded-full">
              <AlertCircle className="h-8 w-8" />
            </div>
          </div>
          <p className="text-sm text-red-700 mt-4 font-medium">Tienes adeudos pendientes. Por favor, realiza tu pago para evitar cargos moratorios o la suspensión de tus servicios.</p>
        </div>
      )}

      {totalDebt === 0 && charges.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-800 uppercase tracking-wider mb-1">Estado al corriente</p>
              <h2 className="text-xl font-bold text-emerald-700">¡Gracias por tu puntualidad!</h2>
            </div>
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
              <CheckCircle2 className="h-8 w-8" />
            </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-indigo-500" />
            Historial de Movimientos
          </h3>
        </div>

        <div className="p-0">
          {charges.length === 0 ? (
            <div className="p-8 text-center bg-slate-50/30">
              <h4 className="text-sm font-medium text-slate-600">No hay movimientos</h4>
              <p className="text-xs text-slate-400 mt-2">Aún no se han generado cargos en tu cuenta.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {charges.map(charge => {
                const totalPaid = charge?.payments?.reduce((sum: number, p: any) => sum + (p?.amount || 0), 0) || 0;
                const remaining = (charge?.amount || 0) - totalPaid;
                
                return (
                  <div key={charge?.id || Math.random()} className="p-5 hover:bg-slate-50/50 transition-colors">
                    <div className="flex justify-between items-start flex-wrap gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-slate-900">${(charge?.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          {getStatusBadge(charge?.status)}
                          {charge?.dueDate && new Date(charge.dueDate) < new Date() && charge.status !== 'PAID' && charge.status !== 'CANCELLED' && charge.status !== 'REPORTED' && (
                            <span className="flex items-center gap-1 text-xs text-red-600 font-bold"><AlertCircle className="h-3 w-3" /> VENCIDO</span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-slate-800">
                          {cleanDescription(charge?.description) || getTypeTranslate(charge?.type)}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">Vence: {charge?.dueDate ? new Date(charge.dueDate).toLocaleDateString() : 'N/A'}</p>
                      </div>
                      
                      {charge.status !== 'PAID' && charge.status !== 'CANCELLED' && (
                        <div className="text-right flex flex-col items-end gap-2">
                          <div>
                            <p className="text-xs text-slate-500">Restante por pagar</p>
                            <p className="text-sm font-bold text-red-600">${remaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                          </div>
                          {charge.status !== 'REPORTED' && (
                            <div className="flex flex-col gap-2">
                              <button 
                                onClick={async () => {
                                  try {
                                    const res = await api.post('/stripe/create-checkout-session', { chargeId: charge.id });
                                    if (res.data.url) {
                                      window.location.href = res.data.url;
                                    }
                                  } catch (error) {
                                    console.error("Error iniciando pago:", error);
                                    alert("Hubo un error al iniciar el pago. Intenta de nuevo.");
                                  }
                                }}
                                className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 bg-indigo-600 text-white hover:bg-indigo-700 h-9 px-4 py-2 rounded-md shadow-sm"
                              >
                                <CreditCard className="mr-2 h-4 w-4" />
                                Pagar con Stripe
                              </button>
                              
                              <button 
                                onClick={async () => {
                                  try {
                                    const res = await api.post('/mercadopago/create-preference', { chargeId: charge.id });
                                    if (res.data.url) {
                                      window.location.href = res.data.url;
                                    }
                                  } catch (error) {
                                    console.error("Error iniciando pago MP:", error);
                                    alert("Hubo un error al iniciar el pago con Mercado Pago.");
                                  }
                                }}
                                className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 bg-[#009ee3] text-white hover:bg-[#008cc7] h-9 px-4 py-2 rounded-md shadow-sm"
                              >
                                <CreditCard className="mr-2 h-4 w-4" />
                                Mercado Pago
                              </button>

                              <ReportPaymentDialog
                                chargeId={charge.id}
                                amount={remaining}
                                onSuccess={fetchCharges}
                              />
                            </div>
                          )}
                        </div>
                      )}
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
                            <span className="font-semibold text-emerald-700">+${payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
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
      </div>
    </div>
  );
}
