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

const unitSchema = z.object({
  name: z.string().min(1, "El identificador es obligatorio"),
  basePrice: z.coerce.number().min(0, "El precio base debe ser mayor o igual a 0"),
  propertyId: z.string(),
  photos: z.string().optional(),
  description: z.string().optional(),
  area: z.coerce.number().optional(),
  bedrooms: z.coerce.number().optional(),
  bathrooms: z.coerce.number().optional(),
  isFurnished: z.boolean().default(false),
  amenities: z.string().optional(),
});

type UnitFormValues = z.infer<typeof unitSchema>;

interface AddUnitDialogProps {
  propertyId: string;
  onUnitAdded: () => void;
}

export function AddUnitDialog({ propertyId, onUnitAdded }: AddUnitDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      name: "",
      basePrice: 0,
      propertyId: propertyId,
      photos: "",
      description: "",
      area: 0,
      bedrooms: 0,
      bathrooms: 0,
      isFurnished: false,
      amenities: "",
    },
  });

  async function onSubmit(data: any) {
    try {
      setLoading(true);

      let uploadedUrls: string[] = [];
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach(f => formData.append('files', f));
        const uploadRes = await api.post('/uploads', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploadedUrls = uploadRes.data.urls || [];
      }

      const payload = {
        ...data,
        photos: JSON.stringify(uploadedUrls),
        amenities: data.amenities ? JSON.stringify(data.amenities.split(',').map((s: string) => s.trim()).filter(Boolean)) : "[]",
      };
      await api.post('/units', payload);
      setOpen(false);
      reset({ name: "", basePrice: 0, propertyId: propertyId, photos: "", description: "", area: 0, bedrooms: 0, bathrooms: 0, isFurnished: false, amenities: "" });
      setFiles([]);
      onUnitAdded();
    } catch (error) {
      console.error("Error creating unit:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Agregar Local
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Añadir Local o Departamento</DialogTitle>
          <DialogDescription>
            Registra una nueva unidad disponible dentro de esta propiedad.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2 flex flex-col pt-4">
            <Label htmlFor="name">Identificador</Label>
            <Input id="name" placeholder="Ej. Local 1, Depto A, Bodega..." {...register("name")} />
            {errors.name && (
              <p className="text-sm font-medium text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2 flex flex-col">
            <Label htmlFor="basePrice">Precio Base (Mensual)</Label>
            <Input 
              id="basePrice" 
              type="number" 
              step="0.01" 
              placeholder="0.00" 
              {...register("basePrice")} 
            />
            {errors.basePrice && (
              <p className="text-sm font-medium text-red-500">{errors.basePrice?.message?.toString()}</p>
            )}
          </div>
          <div className="space-y-2 flex flex-col">
            <Label htmlFor="description">Descripción</Label>
            <Input id="description" placeholder="Descripción detallada..." {...register("description")} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="area">Área (m²)</Label>
              <Input id="area" type="number" step="any" placeholder="Ej. 65" {...register("area")} />
            </div>
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="bedrooms">Habitaciones</Label>
              <Input id="bedrooms" type="number" placeholder="Ej. 2" {...register("bedrooms")} />
            </div>
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="bathrooms">Baños</Label>
              <Input id="bathrooms" type="number" step="0.5" placeholder="Ej. 1.5" {...register("bathrooms")} />
            </div>
          </div>
          <div className="space-y-2 flex flex-col">
            <Label htmlFor="photos">Fotos del Local/Depto</Label>
            <Input id="photos" type="file" multiple accept="image/*" onChange={(e) => setFiles(Array.from(e.target.files || []))} />
            {files.length > 0 && <p className="text-xs text-slate-500">{files.length} archivo(s) seleccionado(s)</p>}
          </div>
          <div className="space-y-2 flex flex-col">
            <Label htmlFor="amenities">Amenidades del Local/Depto (Aire Acond., etc)</Label>
            <Input id="amenities" placeholder="Internet, Clima" {...register("amenities")} />
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="isFurnished" className="rounded" {...register("isFurnished")} />
            <Label htmlFor="isFurnished">¿Está amueblado?</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
