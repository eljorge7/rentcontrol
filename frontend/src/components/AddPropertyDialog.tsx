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

const propertySchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  address: z.string().min(5, "La dirección debe ser más específica"),
  ownerId: z.string().min(1, "Debes asignar un propietario"),
  lat: z.string().optional(),
  lng: z.string().optional(),
  mapUrl: z.string().optional(),
  photos: z.string().optional(),
  amenities: z.string().optional(),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

interface AddPropertyDialogProps {
  owners: { id: string; name: string; planType: string }[];
  onPropertyAdded: () => void;
}

export function AddPropertyDialog({ owners, onPropertyAdded }: AddPropertyDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: "",
      address: "",
      ownerId: "",
      mapUrl: "",
      photos: "",
      amenities: "",
    },
  });

  async function onSubmit(data: PropertyFormValues) {
    try {
      setLoading(true);
      
      let uploadedUrls: string[] = [];
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach(f => formData.append('files', f));
        
        // This assumes api is an axios instance
        const uploadRes = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploadedUrls = uploadRes.data.urls || [];
      }

      // Format photos and amenities into JSON arrays of strings
      const payload = {
        ...data,
        lat: data.lat ? Number(data.lat) : undefined,
        lng: data.lng ? Number(data.lng) : undefined,
        photos: JSON.stringify(uploadedUrls),
        amenities: data.amenities ? JSON.stringify(data.amenities.split(',').map(s => s.trim()).filter(Boolean)) : "[]",
      };
      await api.post('/properties', payload);
      setOpen(false);
      reset();
      setFiles([]);
      onPropertyAdded(); // Recarga la lista
    } catch (error) {
      console.error("Error creating property:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Nueva Propiedad
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Añadir Propiedad</DialogTitle>
          <DialogDescription>
            Ingresa los detalles principales del edificio o plaza.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2 flex flex-col pt-4">
            <Label htmlFor="name">Nombre Comercial</Label>
            <Input id="name" placeholder="Ej. Plaza Central" {...register("name")} />
            {errors.name && (
              <p className="text-sm font-medium text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2 flex flex-col">
            <Label htmlFor="address">Dirección Completa</Label>
            <Input id="address" placeholder="Ej. Av. Universidad 100" {...register("address")} />
            {errors.address && (
              <p className="text-sm font-medium text-red-500">{errors.address.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="lat">Latitud</Label>
              <Input id="lat" type="number" step="any" placeholder="Ej. 25.6866" {...register("lat")} />
            </div>
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="lng">Longitud</Label>
              <Input id="lng" type="number" step="any" placeholder="Ej. -100.316" {...register("lng")} />
            </div>
          </div>
          <div className="space-y-2 flex flex-col">
            <Label htmlFor="mapUrl">Enlace Google Maps</Label>
            <Input id="mapUrl" placeholder="https://maps.google.com/..." {...register("mapUrl")} />
          </div>
          <div className="space-y-2 flex flex-col">
            <Label htmlFor="photos">Fotos del Edificio/Plaza</Label>
            <Input id="photos" type="file" multiple accept="image/*" onChange={(e) => setFiles(Array.from(e.target.files || []))} />
            {files.length > 0 && <p className="text-xs text-slate-500">{files.length} archivo(s) seleccionado(s)</p>}
          </div>
          <div className="space-y-2 flex flex-col">
            <Label htmlFor="amenities">Amenidades (Aparcamiento, Elevador, etc. Separados por comas)</Label>
            <Input id="amenities" placeholder="Seguridad, Elevador, Estacionamiento" {...register("amenities")} />
          </div>
          <div className="space-y-2 flex flex-col">
            <Label htmlFor="ownerId">Propietario Asignado</Label>
            <select
              id="ownerId"
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
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
