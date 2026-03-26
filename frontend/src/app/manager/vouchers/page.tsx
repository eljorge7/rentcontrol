"use client";

import { useState, useEffect } from "react";
import { Ticket, Search, Printer, Trash2, Wifi, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GenerateVouchersDialog } from "@/components/GenerateVouchersDialog";
import api from "@/lib/api";

interface Voucher {
  id: string;
  code: string;
  password?: string;
  duration: number;
  price: number;
  status: string;
  createdAt: string;
  property?: { name: string };
  router?: { name: string };
}

export default function ManagerVouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchVouchers = async () => {
    try {
      const res = await api.get("/vouchers");
      setVouchers(res.data);
    } catch (error) {
      console.error("Error fetching vouchers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`¿Eliminar la ficha ${code}? Esto también la borrará del router Mikrotik si aún existe.`)) return;
    setDeletingId(id);
    try {
      await api.delete(`/vouchers/${id}`);
      fetchVouchers();
    } catch (error) {
      console.error("Error deleting voucher:", error);
      alert("No se pudo eliminar la ficha.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredVouchers = vouchers.filter(v => 
    v.code.toLowerCase().includes(search.toLowerCase()) || 
    (v.property?.name && v.property.name.toLowerCase().includes(search.toLowerCase()))
  );

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Ticket className="h-6 w-6 text-blue-600" />
            Fichas de Internet (Hotspot)
          </h1>
          <p className="text-slate-500 mt-1">Genera y administra pines temporales para venta de WiFi en tus propiedades.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="print:hidden h-10 border-slate-200" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir Visibles
          </Button>
          <GenerateVouchersDialog onSuccess={fetchVouchers} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden print:shadow-none print:border-none">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 print:hidden">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Buscar por código o propiedad..." 
              className="pl-9 bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="text-sm text-slate-500 font-medium">
            Mostrando {filteredVouchers.length} fichas
          </div>
        </div>

        {filteredVouchers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
              <Ticket className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No hay fichas generadas</h3>
            <p className="text-slate-500 mt-2">Crea un nuevo lote para empezar a vender Internet temporal.</p>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVouchers.map(voucher => (
              <div key={voucher.id} className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow relative bg-white">
                <div className="bg-blue-600 p-4 text-center text-white">
                  <Wifi className="h-6 w-6 mx-auto mb-2 opacity-80" />
                  <p className="text-xs uppercase tracking-widest font-semibold opacity-80 mb-1">CÓDIGO DE ACCESO</p>
                  <p className="text-2xl font-mono font-bold tracking-[0.2em]">{voucher.code}</p>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-sm text-slate-500 flex items-center gap-1"><Clock className="h-3.5 w-3.5"/> Tiempo</span>
                    <span className="font-bold text-slate-900">{voucher.duration >= 24 ? `${voucher.duration / 24} Día(s)` : `${voucher.duration} Horas`}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-sm text-slate-500">Precio</span>
                    <span className="font-bold text-emerald-600">${voucher.price} MXN</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Estado</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${voucher.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {voucher.status === 'AVAILABLE' ? 'DISPONIBLE' : voucher.status}
                    </span>
                  </div>
                </div>
                <div className="px-4 pb-4 print:hidden">
                  <Button 
                    variant="ghost" 
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 h-8 text-xs"
                    onClick={() => handleDelete(voucher.id, voucher.code)}
                    disabled={deletingId === voucher.id}
                  >
                    {deletingId === voucher.id ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Trash2 className="h-3 w-3 mr-1" />}
                    Eliminar
                  </Button>
                </div>
                {/* Print watermark */}
                <div className="hidden print:block text-center text-[10px] text-slate-400 pb-2">
                  powered by RentControl OS
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .animate-in {
            animation: none !important;
          }
          .grid {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
          }
          .border {
            border: 1px solid #000 !important;
            break-inside: avoid;
            width: 48%; /* 2 per row printed */
          }
          .bg-blue-600 {
            background-color: #000 !important;
            color: #fff !important;
          }
          .text-emerald-600 {
            color: #000 !important;
          }
          .shadow-sm, .shadow-md {
            box-shadow: none !important;
          }
          /* Make the grid container and all its children visible */
          .grid, .grid * {
            visibility: visible;
          }
          /* Absolute position the grid at the top of the printed page */
          .grid {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}} />
    </div>
  );
}
