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
import { Edit } from "lucide-react";

const unitSchema = z.object({
  name: z.string().min(1, "El identificador es obligatorio"),
  basePrice: z.coerce.number().min(0, "El precio base debe ser mayor o igual a 0"),
});

type UnitFormValues = z.infer<typeof unitSchema>;

interface EditUnitDialogProps {
  unit: {
    id: string;
    name: string;
    basePrice: number;
  };
  onUnitUpdated: () => void;
}

export function EditUnitDialog({ unit, onUnitUpdated }: EditUnitDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      name: unit.name,
      basePrice: unit.basePrice,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: unit.name,
        basePrice: unit.basePrice,
      });
    }
  }, [open, unit, reset]);

  async function onSubmit(data: any) {
    try {
      setLoading(true);
      await api.patch(`/units/${unit.id}`, data);
      setOpen(false);
      onUnitUpdated();
    } catch (error) {
      console.error("Error updating unit:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="icon" className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600 transition-colors">
            <Edit className="h-4 w-4 text-slate-500" />
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Local</DialogTitle>
          <DialogDescription>
            Actualiza el nombre o la tarifa base de este espacio.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2 flex flex-col pt-4">
            <Label htmlFor="edit-name">Identificador</Label>
            <Input id="edit-name" placeholder="Ej. Depto A" {...register("name")} />
            {errors.name && (
              <p className="text-sm font-medium text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2 flex flex-col">
            <Label htmlFor="edit-basePrice">Precio Base (Mensual)</Label>
            <Input 
              id="edit-basePrice" 
              type="number" 
              step="0.01" 
              {...register("basePrice")} 
            />
            {errors.basePrice && (
              <p className="text-sm font-medium text-red-500">{errors.basePrice.message}</p>
            )}
          </div>

          <DialogFooter>
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
