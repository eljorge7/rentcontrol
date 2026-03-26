"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FileText, PlusCircle } from "lucide-react";
import api from "@/lib/api";

interface AddExpenseDialogProps {
  propertyId: string;
  onExpenseAdded: () => void;
}

export function AddExpenseDialog({ propertyId, onExpenseAdded }: AddExpenseDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    amount: "",
    category: "MAINTENANCE",
    description: "",
    date: new Date().toISOString().split("T")[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.post("/expenses", {
        propertyId,
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        date: new Date(formData.date).toISOString()
      });
      
      setOpen(false);
      onExpenseAdded();
      setFormData({
        amount: "",
        category: "MAINTENANCE",
        description: "",
        date: new Date().toISOString().split("T")[0]
      });
    } catch (error) {
      console.error("Error creating expense:", error);
      alert("Hubo un error al registrar el gasto");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <span className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-orange-600 hover:bg-orange-700 shadow-sm text-white">
          <PlusCircle className="mr-2 h-4 w-4" />
          Registrar Gasto
        </span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-orange-600" />
            Nuevo Gasto Operativo
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Monto (MXN)</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              required
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Categoría de Gasto</Label>
            <Select 
              value={formData.category} 
              onValueChange={(v) => setFormData({ ...formData, category: v as string })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MAINTENANCE">Mantenimiento (Limpieza, Reparaciones)</SelectItem>
                <SelectItem value="UTILITIES">Servicios (Agua, Luz, Internet)</SelectItem>
                <SelectItem value="TAXES">Impuestos / Predial</SelectItem>
                <SelectItem value="UPGRADES">Mejoras / Remodelación</SelectItem>
                <SelectItem value="OTHER">Otros Gastos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Fecha de Egreso</Label>
            <Input
              id="date"
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc">Descripción / Motivo</Label>
            <Textarea
              id="desc"
              required
              placeholder="Ej. Pago de recibo de agua diciembre, Compra de pintura..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white" disabled={isLoading}>
              {isLoading ? "Guardando..." : "Registrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
