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
import { Wifi, Trash2 } from "lucide-react";

const serviceSchema = z.object({
  networkProfileId: z.string().min(1, "Debe seleccionar un perfil"),
  ipAddress: z.string().regex(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/, "IP inválida"),
});

interface ManageInternetDialogProps {
  lease: any;
  onServiceUpdated: () => void;
}

export function ManageInternetDialog({ lease, onServiceUpdated }: ManageInternetDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState<any[]>([]);

  const activeService = lease?.services?.[0]; // Assuming 1 service per lease for now

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      networkProfileId: "",
      ipAddress: "",
    },
  });

  useEffect(() => {
    if (open) {
      api.get('/network-profiles').then(res => setProfiles(res.data)).catch(console.error);
      
      if (activeService) {
        reset({
          networkProfileId: activeService.networkProfileId,
          ipAddress: activeService.ipAddress,
        });
      } else {
        reset({ networkProfileId: "", ipAddress: "" });
      }
    }
  }, [open, activeService, reset]);

  async function onSubmit(data: any) {
    try {
      setLoading(true);
      if (activeService) {
        // Update existing service
        await api.patch(`/lease-services/${activeService.id}`, data);
      } else {
        // Create new service
        await api.post('/lease-services', {
          ...data,
          leaseId: lease.id,
        });
      }
      setOpen(false);
      onServiceUpdated();
    } catch (error) {
      console.error("Error saving internet service:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveService() {
    if (!activeService) return;
    try {
      setLoading(true);
      await api.delete(`/lease-services/${activeService.id}`);
      setOpen(false);
      onServiceUpdated();
    } catch (error) {
      console.error("Error removing internet service:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant={activeService ? "default" : "outline"} size="icon" className="h-8 w-8" title="Servicio de Internet" onClick={() => setOpen(true)}>
        <Wifi className="h-4 w-4" />
      </Button>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manejar Servicio de Internet</DialogTitle>
          <DialogDescription>
            Inquilino: {lease?.tenant?.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2 flex flex-col pt-4">
            <Label>Perfil de Velocidad</Label>
            <Select 
              value={activeService?.networkProfileId} 
              onValueChange={(val) => setValue("networkProfileId" as any, val)}
              defaultValue={activeService?.networkProfileId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un perfil" />
              </SelectTrigger>
              <SelectContent>
                {profiles.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name} ({p.downloadSpeed}Mbps / {p.uploadSpeed}Mbps)</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.networkProfileId && <p className="text-sm text-red-500">{errors.networkProfileId.message as string}</p>}
          </div>

          <div className="space-y-2 flex flex-col">
            <Label>Dirección IP Asignada</Label>
            <Input placeholder="Ej. 192.168.1.50" {...register("ipAddress")} />
            <p className="text-xs text-slate-500">La IP del router del inquilino en Mikrotik</p>
            {errors.ipAddress && <p className="text-sm text-red-500">{errors.ipAddress.message as string}</p>}
          </div>

          <DialogFooter className="mt-6 flex justify-between w-full sm:justify-between">
            {activeService ? (
              <Button type="button" variant="destructive" onClick={handleRemoveService} disabled={loading}>
                <Trash2 className="mr-2 h-4 w-4" /> Quitar Servicio
              </Button>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
