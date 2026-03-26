"use client";

import { useState, useEffect } from "react";
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

const editLeaseSchema = z.object({
  status: z.string(),
  rentAmount: z.coerce.number().min(1, "El monto de renta debe ser mayor a 0"),
  paymentDay: z.coerce.number().min(1).max(31, "El día de pago debe estar entre 1 y 31"),
});

type EditLeaseFormValues = z.infer<typeof editLeaseSchema>;

interface EditLeaseDialogProps {
  lease: {
    id: string;
    rentAmount: number;
    paymentDay: number;
    status: string;
    tenant: { name: string };
    unit: { name: string };
  };
  onLeaseUpdated: () => void;
}

export function EditLeaseDialog({ lease, onLeaseUpdated }: EditLeaseDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(editLeaseSchema),
    defaultValues: {
      status: lease.status,
      rentAmount: lease.rentAmount,
      paymentDay: lease.paymentDay || 1, // Fallback si no existiera
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        status: lease.status,
        rentAmount: lease.rentAmount,
        paymentDay: lease.paymentDay || 1,
      });
      setValue("status", lease.status);
    }
  }, [open, lease, reset, setValue]);

  async function onSubmit(data: any) {
    try {
      setLoading(true);
      await api.patch(`/leases/${lease.id}`, {
        ...data,
        // Si el estado cambia a TERMINATED, idealmente registramos fecha final
        endDate: data.status === 'TERMINATED' ? new Date().toISOString() : null
      });
      
      // Si el estado es TERMINATED, deberíamos llamar también a Units para desocuparla (si se maneja así en este negocio)
      // Como no lo expusimos, por ahora modificamos sólo la UI.
      
      setOpen(false);
      onLeaseUpdated();
    } catch (error) {
      console.error("Error updating lease:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Contrato</DialogTitle>
          <DialogDescription>
            Actualiza datos financieros o cambia el estado a Terminado.
            <br />
            <strong>Inquilino:</strong> {lease.tenant?.name} <br />
            <strong>Local:</strong> {lease.unit?.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          <div className="space-y-2 flex flex-col pt-4">
            <Label>Estado del Contrato</Label>
            <Select 
              defaultValue={lease.status} 
              onValueChange={(val) => setValue("status", val || "ACTIVE")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Estado actual" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Activo (Vigente)</SelectItem>
                <SelectItem value="TERMINATED">Terminado (Finalizado)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="edit-rentAmount">Renta Mensual</Label>
              <Input id="edit-rentAmount" type="number" step="0.01" {...register("rentAmount")} />
              {errors.rentAmount && <p className="text-sm text-red-500">{errors.rentAmount.message?.toString()}</p>}
            </div>
            
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="edit-paymentDay">Día de pago</Label>
              <Input id="edit-paymentDay" type="number" min="1" max="31" {...register("paymentDay")} />
              {errors.paymentDay && <p className="text-sm text-red-500">{errors.paymentDay.message?.toString()}</p>}
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
