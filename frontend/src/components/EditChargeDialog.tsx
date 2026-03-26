"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/api";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit } from "lucide-react";

const updateChargeSchema = z.object({
  amount: z.coerce.number().min(0.01, "El monto debe ser mayor a 0"),
  type: z.string().min(1, "Debe seleccionar un tipo de cargo"),
  description: z.string().min(2, "Agregue una descripción corta"),
  dueDate: z.string().min(1, "La fecha de vencimiento es requerida"),
  status: z.string().min(1)
});

type UpdateChargeFormValues = z.infer<typeof updateChargeSchema>;

interface EditChargeDialogProps {
  charge: {
    id: string;
    amount: number;
    type: string;
    description: string;
    dueDate: string;
    status: string;
  };
  onChargeUpdated: () => void;
}

export function EditChargeDialog({ charge, onChargeUpdated }: EditChargeDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Parse original description to remove reports if editing raw description
  const cleanDesc = charge.description?.replace(/ \[Reportado el.*?\]/, '') || charge.description;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(updateChargeSchema),
    defaultValues: {
      amount: charge.amount,
      type: charge.type || "RENT",
      description: cleanDesc,
      dueDate: charge.dueDate ? new Date(charge.dueDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      status: charge.status || "PENDING"
    },
  });

  async function onSubmit(data: any) {
    try {
      setLoading(true);
      await api.patch(`/charges/${charge.id}`, data);
      setOpen(false);
      onChargeUpdated();
    } catch (error) {
      console.error("Error updating charge:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) {
        reset({
          amount: charge.amount,
          type: charge.type || "RENT",
          description: cleanDesc,
          dueDate: charge.dueDate ? new Date(charge.dueDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
          status: charge.status || "PENDING"
        });
      }
    }}>
      {/* @ts-ignore */}
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100">
          <Edit className="h-4 w-4 text-slate-500" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Cargo</DialogTitle>
          <DialogDescription>
            Modifica la cantidad, descripción o fecha de vencimiento de este recibo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="space-y-2 flex flex-col">
              <Label>Tipo de Cargo</Label>
              <Select defaultValue={charge.type || "RENT"} onValueChange={(val) => setValue("type" as any, val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RENT">Renta</SelectItem>
                  <SelectItem value="MAINTENANCE">Mantenimiento</SelectItem>
                  <SelectItem value="INTERNET">Internet</SelectItem>
                  <SelectItem value="PENALTY">Multa / Recargo</SelectItem>
                  <SelectItem value="OTHER">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="amount">Monto (MXN)</Label>
              <Input id="amount" type="number" step="0.01" {...register("amount")} />
              {errors.amount && <p className="text-sm text-red-500">{errors.amount.message as string}</p>}
            </div>
          </div>

          <div className="space-y-2 flex flex-col">
            <Label htmlFor="description">Descripción</Label>
            <Input id="description" {...register("description")} />
            {errors.description && <p className="text-sm text-red-500">{errors.description.message as string}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="dueDate">Fecha de Vencimiento</Label>
              <Input id="dueDate" type="date" {...register("dueDate")} />
              {errors.dueDate && <p className="text-sm text-red-500">{errors.dueDate.message as string}</p>}
            </div>
            
            <div className="space-y-2 flex flex-col">
              <Label>Estatus</Label>
              <Select defaultValue={charge.status || "PENDING"} onValueChange={(val) => setValue("status" as any, val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Estatus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pendiente</SelectItem>
                  <SelectItem value="PARTIAL">Parcial</SelectItem>
                  <SelectItem value="PAID">Cobrado</SelectItem>
                  <SelectItem value="REPORTED">En Revisión</SelectItem>
                  <SelectItem value="CANCELLED">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
              {loading ? "Guardando..." : "Actualizar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
