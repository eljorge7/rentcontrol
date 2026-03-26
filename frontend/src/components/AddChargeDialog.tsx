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
import { Plus } from "lucide-react";

const chargeSchema = z.object({
  leaseId: z.string().min(1, "Debe seleccionar un contrato activo"),
  amount: z.coerce.number().min(0.01, "El monto debe ser mayor a 0"),
  type: z.string().min(1, "Debe seleccionar un tipo de cargo"),
  description: z.string().min(2, "Agregue una descripción corta"),
  dueDate: z.string().min(1, "La fecha de vencimiento es requerida"),
});

type ChargeFormValues = z.infer<typeof chargeSchema>;

interface AddChargeDialogProps {
  onChargeAdded: () => void;
}

export function AddChargeDialog({ onChargeAdded }: AddChargeDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [leases, setLeases] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(chargeSchema),
    defaultValues: {
      leaseId: "",
      amount: 0,
      type: "RENT",
      description: "",
      dueDate: new Date().toISOString().split("T")[0],
    },
  });

  useEffect(() => {
    if (open) {
      api.get('/leases').then(res => setLeases(res.data)).catch(console.error);
    }
  }, [open]);

  async function onSubmit(data: any) {
    try {
      setLoading(true);
      await api.post('/charges', { ...data, status: 'PENDING' });
      setOpen(false);
      reset();
      onChargeAdded();
    } catch (error) {
      console.error("Error creating charge:", error);
    } finally {
      setLoading(false);
    }
  }

  const activeLeases = leases.filter(l => l.status === 'ACTIVE');

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) reset();
    }}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Cargo Adicional
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generar Cargo Manual</DialogTitle>
          <DialogDescription>
            Crea un cargo a un contrato activo (ej. Renta, Mantenimiento, Multa).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          <div className="space-y-2 flex flex-col pt-4">
            <Label>Contrato / Inquilino</Label>
            <Select onValueChange={(val) => setValue("leaseId" as any, val || "")}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un contrato" />
              </SelectTrigger>
              <SelectContent>
                {activeLeases.map(l => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.tenant?.name} ({l.unit?.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.leaseId && <p className="text-sm text-red-500">{errors.leaseId.message as string}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 flex flex-col">
              <Label>Tipo de Cargo</Label>
              <Select defaultValue="RENT" onValueChange={(val) => setValue("type" as any, val || "RENT")}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RENT">Renta</SelectItem>
                  <SelectItem value="MAINTENANCE">Mantenimiento</SelectItem>
                  <SelectItem value="INTERNET">Internet</SelectItem>
                  <SelectItem value="PENALTY">Multa / Recargo</SelectItem>
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
            <Input id="description" placeholder="Ej. Pago de Mantenimiento Enero" {...register("description")} />
            {errors.description && <p className="text-sm text-red-500">{errors.description.message as string}</p>}
          </div>

          <div className="space-y-2 flex flex-col">
            <Label htmlFor="dueDate">Fecha de Vencimiento (Límite)</Label>
            <Input id="dueDate" type="date" {...register("dueDate")} />
            {errors.dueDate && <p className="text-sm text-red-500">{errors.dueDate.message as string}</p>}
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creando..." : "Emitir Cargo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
