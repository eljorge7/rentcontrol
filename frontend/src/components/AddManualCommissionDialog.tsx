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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from "lucide-react";

const commissionSchema = z.object({
  managerId: z.string().min(1, "Seleccione un Gestor"),
  eventTypeId: z.string().min(1, "Seleccione el Tipo de Evento"),
});

type CommissionFormValues = z.infer<typeof commissionSchema>;

interface AddManualCommissionDialogProps {
  onCommissionAdded: () => void;
}

export function AddManualCommissionDialog({ onCommissionAdded }: AddManualCommissionDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [managers, setManagers] = useState<any[]>([]);
  const [eventTypes, setEventTypes] = useState<any[]>([]);

  const fetchDependencies = async () => {
    try {
      // Manda a llamar el endpoint que SÍ existe: /users/managers
      const [mgrRes, evtRes] = await Promise.all([
        api.get('/users/managers'),
        api.get('/event-types')
      ]);
      setManagers(mgrRes.data);
      setEventTypes(evtRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  const {
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<CommissionFormValues>({
    resolver: zodResolver(commissionSchema),
    defaultValues: { managerId: "", eventTypeId: "" },
  });

  async function onSubmit(data: CommissionFormValues) {
    try {
      setLoading(true);
      await api.post('/commissions/event', data);
      setOpen(false);
      reset();
      onCommissionAdded();
    } catch (error) {
      console.error("Error creating manual commission:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (val) fetchDependencies();
      else reset();
    }}>
      {/* @ts-ignore */}
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <PlusCircle className="mr-2 h-4 w-4" /> Registrar Comisión Extra
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Comisión Manual por Evento</DialogTitle>
          <DialogDescription>
            Registra una ganancia extra para un Gestor por instalaciones, soporte técnico o cobranza en sitio.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          
          <div className="space-y-2">
            <Label>Seleccionar Gestor</Label>
            <Select onValueChange={(val) => setValue("managerId", val as string)}>
              <SelectTrigger>
                <SelectValue placeholder="Elige un gestor..." />
              </SelectTrigger>
              <SelectContent>
                {managers.map(m => (
                  <SelectItem key={m.id} value={m.id}>{m.name} ({m.email})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.managerId && <p className="text-sm text-red-500">{errors.managerId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Seleccionar Tipo de Evento</Label>
            <Select onValueChange={(val) => setValue("eventTypeId", val as string)}>
              <SelectTrigger>
                <SelectValue placeholder="Ej. Instalación de Antena..." />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.length === 0 ? (
                  <SelectItem value="none" disabled>No hay eventos registrados</SelectItem>
                ) : (
                  eventTypes.map(e => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name} - ${e.basePrice}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.eventTypeId && <p className="text-sm text-red-500">{errors.eventTypeId.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || eventTypes.length === 0}>
              {loading ? "Asignando..." : "Asignar Comisión"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
