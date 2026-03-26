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

const propertySchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  address: z.string().min(5, "La dirección debe ser más específica"),
  ownerId: z.string().min(1, "Debes asignar un propietario"),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

interface EditPropertyDialogProps {
  property: { id: string; name: string; address: string; ownerId?: string };
  owners: { id: string; name: string; planType: string }[];
  onPropertyUpdated: () => void;
  customTrigger?: React.ReactElement;
}

export function EditPropertyDialog({ property, owners, onPropertyUpdated, customTrigger }: EditPropertyDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: property.name,
      address: property.address,
      ownerId: property.ownerId || "",
    },
  });

  // Ensure form updates if the property prop changes
  useEffect(() => {
    if (open) {
      reset({ 
        name: property.name, 
        address: property.address,
        ownerId: property.ownerId || ""
      });
    }
  }, [open, property, reset]);

  async function onSubmit(data: PropertyFormValues) {
    try {
      setLoading(true);
      await api.patch(`/properties/${property.id}`, data);
      setOpen(false);
      onPropertyUpdated();
    } catch (error) {
      console.error("Error updating property:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          customTrigger ?? (
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Propiedad</DialogTitle>
          <DialogDescription>
            Modifica los detalles del edificio o plaza.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2 flex flex-col pt-4">
            <Label htmlFor="edit-name">Nombre Comercial</Label>
            <Input id="edit-name" placeholder="Ej. Plaza Central" {...register("name")} />
            {errors.name && (
              <p className="text-sm font-medium text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2 flex flex-col">
            <Label htmlFor="edit-address">Dirección Completa</Label>
            <Input id="edit-address" placeholder="Ej. Av. Universidad 100" {...register("address")} />
            {errors.address && (
              <p className="text-sm font-medium text-red-500">{errors.address.message}</p>
            )}
          </div>
          <div className="space-y-2 flex flex-col">
            <Label htmlFor="edit-ownerId">Propietario Asignado</Label>
            <select
              id="edit-ownerId"
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              {...register("ownerId")}
            >
              <option value="" disabled>-- Selecciona un propietario --</option>
              {owners.map(owner => (
                <option key={owner.id} value={owner.id}>
                  {owner.name} ({owner.planType === 'FULL_MANAGEMENT' ? 'Gestión Completa' : 'SaaS'})
                </option>
              ))}
            </select>
            {errors.ownerId && (
              <p className="text-sm font-medium text-red-500">{errors.ownerId.message}</p>
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
