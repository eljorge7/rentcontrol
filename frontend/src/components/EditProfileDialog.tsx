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
import { Edit } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Obligatorio"),
  downloadSpeed: z.coerce.number().min(1, "Debe ser mayor a 0"),
  uploadSpeed: z.coerce.number().min(1, "Debe ser mayor a 0"),
  price: z.coerce.number().min(0, "Debe ser mayor o igual a 0"),
});

interface EditProfileDialogProps {
  profile: {
    id: string;
    name: string;
    downloadSpeed: number;
    uploadSpeed: number;
    price?: number;
  };
  onProfileUpdated: () => void;
}

export function EditProfileDialog({ profile, onProfileUpdated }: EditProfileDialogProps) {
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
      name: profile.name,
      downloadSpeed: profile.downloadSpeed,
      uploadSpeed: profile.uploadSpeed,
      price: profile.price || 0,
    },
  });

  async function onSubmit(data: any) {
    try {
      setLoading(true);
      await api.patch(`/network-profiles/${profile.id}`, data);
      setOpen(false);
      reset();
      onProfileUpdated();
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (val) {
        reset({
          name: profile.name,
          downloadSpeed: profile.downloadSpeed,
          uploadSpeed: profile.uploadSpeed,
          price: profile.price || 0,
        });
      }
    }}>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(true)}>
        <Edit className="h-4 w-4 text-slate-500" />
      </Button>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Plan de Velocidad</DialogTitle>
          <DialogDescription>
            Modifique los límites de velocidad del perfil.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          <div className="space-y-2 flex flex-col pt-4">
            <Label htmlFor="edit-name">Nombre del Plan</Label>
            <Input id="edit-name" {...register("name")} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message as string}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="edit-downloadSpeed">Descarga (Mbps)</Label>
              <Input id="edit-downloadSpeed" type="number" {...register("downloadSpeed")} />
              {errors.downloadSpeed && <p className="text-sm text-red-500">{errors.downloadSpeed.message as string}</p>}
            </div>
            
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="edit-uploadSpeed">Subida (Mbps)</Label>
              <Input id="edit-uploadSpeed" type="number" {...register("uploadSpeed")} />
              {errors.uploadSpeed && <p className="text-sm text-red-500">{errors.uploadSpeed.message as string}</p>}
            </div>
          </div>

          <div className="space-y-2 flex flex-col">
            <Label htmlFor="edit-price">Costo Mensual (MXN)</Label>
            <Input id="edit-price" type="number" {...register("price")} />
            {errors.price && <p className="text-sm text-red-500">{errors.price.message as string}</p>}
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Actualizando..." : "Actualizar Plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
