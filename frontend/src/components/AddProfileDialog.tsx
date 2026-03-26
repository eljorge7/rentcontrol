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
import { Plus } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Obligatorio (ej. 20 Megas)"),
  downloadSpeed: z.coerce.number().min(1, "Debe ser mayor a 0"),
  uploadSpeed: z.coerce.number().min(1, "Debe ser mayor a 0"),
  price: z.coerce.number().min(0, "Debe ser mayor o igual a 0"),
});

interface AddProfileDialogProps {
  onProfileAdded: () => void;
}

export function AddProfileDialog({ onProfileAdded }: AddProfileDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      downloadSpeed: 20,
      uploadSpeed: 5,
      price: 300,
    },
  });

  async function onSubmit(data: any) {
    try {
      setLoading(true);
      await api.post('/network-profiles', data);
      setOpen(false);
      reset();
      onProfileAdded();
    } catch (error) {
      console.error("Error creating profile:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) reset();
    }}>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" /> Nuevo Plan de Internet
      </Button>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Plan de Velocidad (Perfil)</DialogTitle>
          <DialogDescription>
            Defina la velocidad de descarga y subida para limitar a los inquilinos.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          <div className="space-y-2 flex flex-col pt-4">
            <Label htmlFor="name">Nombre del Plan</Label>
            <Input id="name" placeholder="Ej. Residencial 20 Mbps" {...register("name")} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message as string}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="downloadSpeed">Descarga (Mbps)</Label>
              <Input id="downloadSpeed" type="number" {...register("downloadSpeed")} />
              {errors.downloadSpeed && <p className="text-sm text-red-500">{errors.downloadSpeed.message as string}</p>}
            </div>
            
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="uploadSpeed">Subida (Mbps)</Label>
              <Input id="uploadSpeed" type="number" {...register("uploadSpeed")} />
              {errors.uploadSpeed && <p className="text-sm text-red-500">{errors.uploadSpeed.message as string}</p>}
            </div>
          </div>

          <div className="space-y-2 flex flex-col">
            <Label htmlFor="price">Costo Mensual (MXN)</Label>
            <Input id="price" type="number" {...register("price")} />
            {errors.price && <p className="text-sm text-red-500">{errors.price.message as string}</p>}
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
