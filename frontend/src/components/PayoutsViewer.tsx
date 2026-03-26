"use client";

import { useState, useEffect } from "react";
import { AlertCircle, Copy, Plus, FileText, Search, RefreshCw, CheckCircle, ChevronRight, UserCog, DollarSign, ExternalLink } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PayoutsViewerProps {
  role: "ADMIN" | "MANAGER" | "OWNER";
}

export default function PayoutsViewer({ role }: PayoutsViewerProps) {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Selection and Generation State
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [ownersList, setOwnersList] = useState<any[]>([]);
  const [selectedOwnerId, setSelectedOwnerId] = useState("");
  const [pendingBalance, setPendingBalance] = useState<any | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [notes, setNotes] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      if (role !== 'OWNER') {
        const ownersRes = await api.get('/users/owners').catch(e => {
          console.error("Error fetching owners", e);
          return { data: [] };
        });
        setOwnersList(ownersRes.data);
      }
      
      const endpoint = role === 'OWNER' ? '/payouts/owner/my-payouts' : '/payouts/index';
      const response = await api.get(endpoint).catch(e => {
        console.error("Error fetching payouts", e);
        return { data: [] };
      });
      setPayouts(response.data);

    } catch (error) {
      console.error("Critical error in fetchData:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [role]);

  const handleSelectOwner = async (ownerId: string) => {
    setSelectedOwnerId(ownerId);
    if (!ownerId) {
      setPendingBalance(null);
      return;
    }
    setCalculating(true);
    try {
      const response = await api.get(`/payouts/balance/${ownerId}`);
      setPendingBalance(response.data);
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Error calculando saldo remanente.");
      setPendingBalance(null);
    } finally {
      setCalculating(false);
    }
  };

  const handleGeneratePayout = async () => {
    if (!selectedOwnerId) return;
    setGenerating(true);
    try {
      await api.post(`/payouts/generate/${selectedOwnerId}`, { notes });
      alert("Liquidación de mes generada con éxito.");
      setShowGenerateDialog(false);
      setSelectedOwnerId("");
      setPendingBalance(null);
      setNotes("");
      fetchData();
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Error al generar liquidación.");
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    if (!confirm("¿Marcar como Transferido / Pagado al Propietario?")) return;
    try {
      await api.patch(`/payouts/${id}/pay`);
      fetchData();
    } catch (e) {
      alert("Error.");
    }
  };

  const filteredPayouts = payouts.filter(p => {
    if (!searchQuery) return true;
    const term = searchQuery.toLowerCase();
    return p.owner?.name.toLowerCase().includes(term) || p.id.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Liquidaciones a Propietarios</h1>
          <p className="text-slate-500 text-sm mt-1">
            {role === 'OWNER' 
              ? "Historial de cortes mensuales y transferencias de utilidad."
              : "Calcula los cortes mensuales, descuenta comisiones y reporta utilidades."
            }
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Buscar liquidación..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 w-full rounded-full border-slate-200 bg-white focus-visible:ring-indigo-500"
            />
          </div>
          <Button variant="outline" size="icon" onClick={fetchData} className="h-10 w-10 shrink-0 rounded-full border-slate-200">
            <RefreshCw className={`h-4 w-4 text-slate-600 ${loading ? "animate-spin" : ""}`} />
          </Button>
          {role !== 'OWNER' && (
            <Button onClick={() => setShowGenerateDialog(true)} className="h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white px-5 shadow-md shadow-indigo-200">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Corte
            </Button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs font-semibold">
              <tr>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Fecha Corte</th>
                {role !== 'OWNER' && <th className="px-5 py-4">Propietario</th>}
                <th className="px-5 py-4">Ingresos Brutos</th>
                <th className="px-5 py-4">Egresos (Gastos + Comis.)</th>
                <th className="px-5 py-4 text-right">Transferencia Neta</th>
                {role !== 'OWNER' && <th className="px-5 py-4 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">Cargando cortes...</p>
                  </td>
                </tr>
              ) : filteredPayouts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <div className="bg-slate-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <DollarSign className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-base font-bold text-slate-700 mb-1">Sin liquidaciones</p>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto">
                      {role === 'OWNER' ? 'Aún no se han generado cortes de tus utilidades.' : 'Selecciona "Nuevo Corte" para calcular el balance vivo de un Propietario.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPayouts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        p.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {p.status === 'PAID' ? <CheckCircle className="h-3 w-3" /> : <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />}
                        {p.status === 'PAID' ? 'Pagado' : 'Pendiente Transferir'}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-700">
                      {new Date(p.createdAt).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    {role !== 'OWNER' && (
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">{p.owner?.name}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><UserCog className="h-3 w-3" /> Gestor: {p.manager?.name || 'Sistema'}</div>
                      </td>
                    )}
                    <td className="px-5 py-4 font-medium text-slate-700">
                      + ${p.totalRents.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 font-medium text-red-600">
                      - ${(p.totalExpenses + p.totalCommissions).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="text-base font-bold text-indigo-700 tabular-nums">
                        ${p.netAmount.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-1">ID: {p.id.substring(0,8)}</div>
                    </td>
                    {role !== 'OWNER' && (
                      <td className="px-5 py-4 text-right">
                        {p.status !== 'PAID' && (
                          <Button size="sm" variant="outline" className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 h-8" onClick={() => handleMarkAsPaid(p.id)}>
                            Marcar Pagado
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-slate-50">
          <DialogHeader className="p-6 pb-4 bg-white border-b">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-indigo-600" />
              Generar Corte Mensual
            </DialogTitle>
            <p className="text-sm text-slate-500 mt-1">Calcula exactamente cuánto se le debe enviar al propietario deduciendo todos los gastos pendientes.</p>
          </DialogHeader>

          <div className="p-6 space-y-6">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Seleccionar Propietario</label>
              <select 
                value={selectedOwnerId} 
                onChange={(e) => handleSelectOwner(e.target.value)}
                className="w-full h-10 border-slate-200 rounded-lg text-sm bg-slate-50 font-medium px-3 focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">-- Elige un inversionista --</option>
                {ownersList.map((o) => (
                  <option key={o.id} value={o.id}>{o.name} ({o.email})</option>
                ))}
              </select>
            </div>

            {calculating ? (
              <div className="flex flex-col items-center justify-center py-10">
                <RefreshCw className="h-8 w-8 animate-spin text-indigo-500 mb-4" />
                <p className="text-sm font-semibold text-slate-600">Calculando saldos huérfanos...</p>
              </div>
            ) : pendingBalance ? (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-emerald-500">
                    <p className="text-xs font-semibold text-slate-500 mb-1">Total Ingresos (+)</p>
                    <p className="text-2xl font-bold text-slate-900">${pendingBalance.financials.totalRents.toLocaleString()}</p>
                    <p className="text-xs text-emerald-600 font-medium mt-1">{pendingBalance.financials.paymentsCount} recibos cobrados</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-amber-500">
                    <p className="text-xs font-semibold text-slate-500 mb-1">Gastos Mto. (-)</p>
                    <p className="text-2xl font-bold text-slate-900">${pendingBalance.financials.totalExpenses.toLocaleString()}</p>
                    <p className="text-xs text-amber-600 font-medium mt-1">{pendingBalance.financials.expensesCount} incidencias</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-rose-500">
                    <p className="text-xs font-semibold text-slate-500 mb-1">Comisión Gestor (-)</p>
                    <p className="text-2xl font-bold text-slate-900">${pendingBalance.financials.totalCommissions.toLocaleString()}</p>
                    <p className="text-xs text-rose-600 font-medium mt-1">Deducción de honorarios</p>
                  </div>
                </div>

                <div className="bg-indigo-600 text-white rounded-xl p-5 shadow-lg flex justify-between items-center mb-6">
                  <div>
                    <p className="text-indigo-100 text-sm font-medium mb-1">Transferencia Neta a Cuenta</p>
                    <h2 className="text-3xl font-extrabold tracking-tight">${pendingBalance.financials.netAmount.toLocaleString()}</h2>
                  </div>
                  <DollarSign className="h-12 w-12 text-indigo-400 opacity-50" />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Notas de la Liquidación (Opcional)</label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full h-20 p-3 bg-white border border-slate-200 rounded-lg text-sm"
                    placeholder="Ej. Se le retuvieron $500 pesos de honorarios atrasados..."
                  />
                </div>
              </div>
            ) : selectedOwnerId ? (
              <div className="text-center py-10">
                <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-3" />
                <p className="text-base font-bold text-slate-800">Cálculo fallido</p>
              </div>
            ) : null}
          </div>

          <div className="p-4 bg-white border-t flex justify-end gap-3 px-6">
            <Button variant="outline" onClick={() => setShowGenerateDialog(false)} disabled={generating}>
              Cancelar
            </Button>
            <Button 
              onClick={handleGeneratePayout} 
              disabled={generating || !pendingBalance || (pendingBalance.financials.paymentsCount === 0 && pendingBalance.financials.expensesCount === 0)}
              className="bg-indigo-600 hover:bg-indigo-700 min-w-[150px]"
            >
              {generating ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : "Generar y Sellar Corte"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
