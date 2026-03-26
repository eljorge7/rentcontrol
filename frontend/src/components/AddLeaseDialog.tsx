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
import { AddTenantDialog } from "./AddTenantDialog";

const leaseSchema = z.object({
  tenantId: z.string().min(1, "Debe seleccionar un inquilino"),
  unitId: z.string().min(1, "Debe seleccionar un local / departamento"),
  startDate: z.string().min(1, "La fecha de inicio es requerida"),
  rentAmount: z.coerce.number().min(1, "El monto de renta debe ser mayor a 0"),
  depositAmount: z.coerce.number().min(0).optional(),
  paymentDay: z.coerce.number().min(1).max(31, "El día de pago debe estar entre 1 y 31"),
  lateFeeAmount: z.coerce.number().min(0).optional(),
  gracePeriodDays: z.coerce.number().min(0).optional(),
});

type LeaseFormValues = z.infer<typeof leaseSchema>;

interface AddLeaseDialogProps {
  onLeaseAdded: () => void;
  defaultPropertyId?: string;
  defaultUnitId?: string;
  customTrigger?: React.ReactElement;
}

type Tenant = { id: string; name: string };
type Unit = { id: string; name: string; isOccupied: boolean; basePrice: number };
type Property = { id: string; name: string; units: Unit[] };

export function AddLeaseDialog({ onLeaseAdded, defaultPropertyId, defaultUnitId, customTrigger }: AddLeaseDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(leaseSchema),
    defaultValues: {
      tenantId: "",
      unitId: defaultUnitId || "",
      startDate: new Date().toISOString().split("T")[0],
      rentAmount: 0,
      depositAmount: 0,
      paymentDay: 1,
      lateFeeAmount: 0,
      gracePeriodDays: 3,
    },
  });

  const selectedUnitId = watch("unitId");

  const fetchTenants = async () => {
    try {
      const res = await api.get('/tenants');
      setTenants(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (open) {
      if (defaultPropertyId) {
        setSelectedPropertyId(defaultPropertyId);
      }
      if (defaultUnitId) {
         setValue("unitId" as any, defaultUnitId);
      }
      setIsFetching(true);
      Promise.all([
        fetchTenants(),
        api.get('/properties').then(res => setProperties(res.data)).catch(console.error)
      ]).finally(() => setIsFetching(false));
    }
  }, [open]);

  // Manejar auto-relleno del precio base cuando selecciona una unidad
  useEffect(() => {
    if (selectedPropertyId && selectedUnitId) {
      const prop = properties.find((p) => p.id === selectedPropertyId);
      const unit = prop?.units.find((u) => u.id === selectedUnitId);
      if (unit) {
        setValue("rentAmount" as any, unit.basePrice);
      }
    }
  }, [selectedUnitId, selectedPropertyId, properties, setValue]);

  async function onSubmit(data: any) {
    try {
      setLoading(true);
      await api.post('/leases', data);
      setOpen(false);
      reset();
      setSelectedPropertyId("");
      onLeaseAdded();
    } catch (error) {
      console.error("Error creating lease:", error);
    } finally {
      setLoading(false);
    }
  }

  const selectedProperty = properties.find(p => p.id === selectedPropertyId);
  const availableUnits = selectedProperty?.units.filter(u => !u.isOccupied) || [];

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) {
        reset();
        setSelectedPropertyId("");
      }
    }}>
      <DialogTrigger
        render={
          customTrigger ?? (
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nuevo Contrato
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Contrato</DialogTitle>
          <DialogDescription>
            Asigna un local a un inquilino y establece las condiciones de pago.
          </DialogDescription>
        </DialogHeader>
        {isFetching ? (
          <div className="py-8 text-center flex flex-col items-center justify-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-sm text-slate-500">Cargando datos...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            <div className="space-y-2 flex flex-col pt-4">
              <Label>Inquilino</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 border rounded-md">
                  <Select onValueChange={(val) => setValue("tenantId" as any, val)} value={watch("tenantId") || undefined}>
                    <SelectTrigger className="border-0 ring-0 focus:ring-0">
                      <SelectValue placeholder="Seleccione un inquilino">
                        {watch("tenantId") ? tenants.find(t => t.id === watch("tenantId"))?.name : "Seleccione un inquilino"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {tenants.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <AddTenantDialog 
                  onTenantAdded={() => fetchTenants()} 
                  customTrigger={
                    <Button type="button" variant="outline" size="icon" className="shrink-0" title="Nuevo Inquilino">
                      <Plus className="h-4 w-4" />
                    </Button>
                  } 
                />
              </div>
              {errors.tenantId && <p className="text-sm text-red-500">{errors.tenantId.message?.toString()}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 flex flex-col">
                <Label>Propiedad / Edificio</Label>
                <Select disabled={!!defaultPropertyId} value={selectedPropertyId || undefined} onValueChange={(val) => {
                  setSelectedPropertyId(val as string);
                  setValue("unitId" as any, ""); // Reset unit when property changes
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione propiedad">
                      {selectedPropertyId ? properties.find(p => p.id === selectedPropertyId)?.name : "Seleccione propiedad"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 flex flex-col">
                <Label>Local / Departamento</Label>
                <Select disabled={!selectedPropertyId || !!defaultUnitId} onValueChange={(val) => setValue("unitId" as any, val)} value={selectedUnitId || undefined}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione local">
                      {selectedUnitId ? selectedProperty?.units.find(u => u.id === selectedUnitId)?.name : "Seleccione local"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {availableUnits.length === 0 ? (
                      <SelectItem value="empty" disabled>No hay locales disponibles</SelectItem>
                    ) : (
                      availableUnits.map(u => (
                        <SelectItem key={u.id} value={u.id}>{u.name} (Base: ${u.basePrice})</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.unitId && <p className="text-sm text-red-500">{errors.unitId.message?.toString()}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 flex flex-col">
                <Label htmlFor="startDate">Fecha de Inicio</Label>
                <Input id="startDate" type="date" {...register("startDate")} />
                {errors.startDate && <p className="text-sm text-red-500">{errors.startDate.message?.toString()}</p>}
              </div>
              
              <div className="space-y-2 flex flex-col">
                <Label htmlFor="paymentDay">Día de pago (1-31)</Label>
                <Input id="paymentDay" type="number" min="1" max="31" {...register("paymentDay")} />
                <p className="text-xs text-slate-500">Día de corte mensual</p>
                {errors.paymentDay && <p className="text-sm text-red-500">{errors.paymentDay.message?.toString()}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 flex flex-col pt-2 border-t border-slate-100">
                <Label htmlFor="gracePeriodDays" className="text-amber-700">Días de Gracia</Label>
                <Input id="gracePeriodDays" type="number" min="0" {...register("gracePeriodDays")} className="border-amber-200 focus-visible:ring-amber-500" />
                <p className="text-xs text-slate-500">Tolerancia antes de aplicar recargos</p>
                {errors.gracePeriodDays && <p className="text-sm text-red-500">{errors.gracePeriodDays.message?.toString()}</p>}
              </div>
              
              <div className="space-y-2 flex flex-col pt-2 border-t border-slate-100">
                <Label htmlFor="lateFeeAmount" className="text-red-700">Multa por Retraso ($)</Label>
                <Input id="lateFeeAmount" type="number" min="0" {...register("lateFeeAmount")} className="border-red-200 focus-visible:ring-red-500" />
                <p className="text-xs text-slate-500">Multa fija mensual en MXN</p>
                {errors.lateFeeAmount && <p className="text-sm text-red-500">{errors.lateFeeAmount.message?.toString()}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 flex flex-col">
                <Label htmlFor="rentAmount">Renta Mensual Ajustada</Label>
                <Input id="rentAmount" type="number" step="0.01" {...register("rentAmount")} />
                {errors.rentAmount && <p className="text-sm text-red-500">{errors.rentAmount.message?.toString()}</p>}
              </div>

              <div className="space-y-2 flex flex-col">
                <Label htmlFor="depositAmount">Depósito en Garantía</Label>
                <Input id="depositAmount" type="number" step="0.01" {...register("depositAmount")} />
                {errors.depositAmount && <p className="text-sm text-red-500">{errors.depositAmount.message?.toString()}</p>}
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creando..." : "Crear Contrato"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
