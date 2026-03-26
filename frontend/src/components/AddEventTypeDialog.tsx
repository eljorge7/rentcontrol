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
import { Settings } from "lucide-react";

const eventTypeSchema = z.object({
  name: z.string().min(2, "Obligatorio (ej. Instalación de Equipo)"),
  description: z.string().optional(),
  basePrice: z.coerce.number().min(0, "Monto inválido"),
});

type EventTypeFormValues = z.infer<typeof eventTypeSchema>;

interface AddEventTypeDialogProps {
  onAdded?: () => void;
}

export function AddEventTypeDialog({ onAdded }: AddEventTypeDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EventTypeFormValues>({
    resolver: zodResolver(eventTypeSchema) as any,
    defaultValues: { name: "", description: "", basePrice: 0 },
  });

  async function onSubmit(data: EventTypeFormValues) {
    try {
      setLoading(true);
      await api.post('/event-types', data);
      setOpen(false);
      reset();
      if (onAdded) onAdded();
    } catch (error) {
      console.error("Error creating event type:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) reset();
    }}>
      {/* @ts-ignore */}
      <DialogTrigger asChild>
        <Button variant="outline" className="text-slate-600 border-slate-300">
          <Settings className="mr-2 h-4 w-4" /> Tipos de Eventos
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Tipo de Evento / Trabajo</DialogTitle>
          <DialogDescription>
            Define los trabajos que pagan comisión extra (Ej. "Instalar Antena = $250").
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Evento</Label>
            <Input id="name" placeholder="Ej. Cambio de Domicilio" {...register("name")} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción (Opcional)</Label>
            <Input id="description" placeholder="Migrar equipos de un departamento a otro" {...register("description")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="basePrice">Comisión Fija ($ MXN)</Label>
            <Input id="basePrice" type="number" placeholder="200" {...register("basePrice")} />
            {errors.basePrice && <p className="text-sm text-red-500">{errors.basePrice.message}</p>}
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Crear Evento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
