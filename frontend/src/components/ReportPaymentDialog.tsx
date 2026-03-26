"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUp, Info } from "lucide-react";
import api from "@/lib/api";

interface ReportPaymentDialogProps {
  chargeId: string;
  amount: number;
  onSuccess: () => void;
}

export function ReportPaymentDialog({ chargeId, amount, onSuccess }: ReportPaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reference, setReference] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference.trim()) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("reference", reference);
      formData.append("paymentDate", date);
      formData.append("notes", notes);
      if (file) {
        formData.append("file", file);
      }

      await api.post(`/charges/${chargeId}/report`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Error reporting payment:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* @ts-ignore */}
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800">
          <FileUp className="h-4 w-4 mr-2" />
          Reportar Pago
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reportar Pago por Transferencia</DialogTitle>
          <DialogDescription>
            Notifica a tu administrador que has depositado <strong>${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>. Se validará en las próximas 24 horas.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="reference">Número de Referencia o Clave de Rastreo *</Label>
            <Input 
              id="reference" 
              placeholder="Ej. 129381203" 
              value={reference} 
              onChange={(e) => setReference(e.target.value)}
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date">Fecha del Depósito *</Label>
            <Input 
              id="date" 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas o captura (Opcional)</Label>
            <Textarea 
              id="notes" 
              placeholder="Ej. Transferencia hecha desde Bancomer a nombre de Juan." 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Comprobante (Imagen o PDF)</Label>
            <Input 
              id="file" 
              type="file" 
              accept="image/*,.pdf"
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              className="text-ellipsis overflow-hidden max-w-[370px]"
            />
          </div>

          <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm flex gap-2 items-start mt-2">
            <Info className="h-5 w-5 shrink-0 text-blue-600" />
            <p>Al reportar tu pago, el cargo dejará de marcar como Vencido mientras el administrador lo confirma.</p>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={loading || !reference.trim()}>
              {loading ? "Enviando..." : "Enviar Reporte"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
