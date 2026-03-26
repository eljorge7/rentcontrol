"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import api from "@/lib/api";

interface Router {
  id: string;
  name: string;
  ipAddress: string;
}

interface Property {
  id: string;
  name: string;
}

export function GenerateVouchersDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [routers, setRouters] = useState<Router[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);

  const [amount, setAmount] = useState(10);
  const [duration, setDuration] = useState(24);
  const [price, setPrice] = useState(50);
  const [routerId, setRouterId] = useState("");
  const [propertyId, setPropertyId] = useState("");

  useEffect(() => {
    if (open) {
      api.get("/mikrotik").then((res) => setRouters(res.data)).catch(console.error);
      api.get("/properties").then((res) => setProperties(res.data)).catch(console.error);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routerId) return alert("Selecciona un Router Mikrotik.");
    
    setLoading(true);
    try {
      await api.post("/vouchers/batch", {
        amount: Number(amount),
        duration: Number(duration),
        price: Number(price),
        routerId,
        propertyId: propertyId || undefined
      });
      setOpen(false);
      onSuccess();
    } catch (error) {
      alert("Error al generar las fichas. Verifica la consola.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2">
        <Plus className="h-4 w-4 mr-2" />
        Generar Fichas
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generar Lote de Fichas (Hotspot)</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Cantidad de Fichas</Label>
              <Input id="amount" type="number" min="1" max="100" value={amount} onChange={e => setAmount(Number(e.target.value))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duración (Horas)</Label>
              <Select value={duration.toString()} onValueChange={val => setDuration(Number(val))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Hora</SelectItem>
                  <SelectItem value="2">2 Horas</SelectItem>
                  <SelectItem value="4">4 Horas</SelectItem>
                  <SelectItem value="12">12 Horas</SelectItem>
                  <SelectItem value="24">1 Día (24h)</SelectItem>
                  <SelectItem value="72">3 Días (72h)</SelectItem>
                  <SelectItem value="168">1 Semana (168h)</SelectItem>
                  <SelectItem value="720">1 Mes (720h)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Precio de Venta ($ MXN)</Label>
            <Input id="price" type="number" min="0" step="0.01" value={price} onChange={e => setPrice(Number(e.target.value))} required />
          </div>

          <div className="space-y-2">
            <Label>Router de Destino</Label>
            <Select value={routerId} onValueChange={(val) => setRouterId(val || "")}>
              <SelectTrigger>
                <SelectValue placeholder="Mikrotik donde funcionarán..." />
              </SelectTrigger>
              <SelectContent>
                {routers.map(r => (
                  <SelectItem key={r.id} value={r.id}>{r.name} ({r.ipAddress})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Propiedad (Opcional - Para control)</Label>
            <Select value={propertyId} onValueChange={(val) => setPropertyId(val || "")}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar Propiedad..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Ninguna</SelectItem>
                {properties.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 border-t">
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? "Generando e inyectando..." : "Generar Fichas"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
