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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const quotationSchema = z.object({
  prospectName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  prospectEmail: z.string().email("Correo electrónico inválido").or(z.literal("")),
  managementPlanId: z.string().min(1, "Debes seleccionar un plan"),
  propertyCount: z.coerce.number().min(1, "Debe ser mínimo 1 propiedad"),
  taxRegime: z.string().optional(),
});

type QuotationFormValues = z.infer<typeof quotationSchema>;

interface ManagementPlan {
  id: string;
  name: string;
  fixedFee: number;
}

interface AddQuotationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AddQuotationDialog({ open, onOpenChange, onSuccess }: AddQuotationDialogProps) {
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<ManagementPlan[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<QuotationFormValues>({
    resolver: zodResolver(quotationSchema) as any,
    defaultValues: {
      prospectName: "",
      prospectEmail: "",
      managementPlanId: "",
      propertyCount: 1,
      taxRegime: "612", // Personas Físicas con Actividades Empresariales by default
    },
  });

  useEffect(() => {
    if (open) {
      fetchPlans();
    }
  }, [open]);

  const fetchPlans = async () => {
    try {
      const res = await api.get("/management-plans");
      setPlans(res.data);
    } catch (error) {
      console.error("Error fetching management plans:", error);
    }
  };

  async function onSubmit(data: QuotationFormValues) {
    try {
      setLoading(true);
      // Clean up empty email to undefined
      const payload = {
        ...data,
        prospectEmail: data.prospectEmail === "" ? undefined : data.prospectEmail
      };
      
      await api.post('/quotations', payload);
      onOpenChange(false);
      reset();
      onSuccess();
    } catch (error) {
      console.error("Error creating quotation:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Nueva Cotización</DialogTitle>
          <DialogDescription>
            Genera una propuesta comercial para un nuevo cliente.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="prospectName">Nombre del Prospecto *</Label>
            <Input id="prospectName" placeholder="Ej. Juan Pérez" {...register("prospectName")} />
            {errors.prospectName && (
              <p className="text-sm font-medium text-red-500">{errors.prospectName.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="prospectEmail">Correo Electrónico</Label>
            <Input id="prospectEmail" type="email" placeholder="Ej. juan@empresa.com" {...register("prospectEmail")} />
            {errors.prospectEmail && (
              <p className="text-sm font-medium text-red-500">{errors.prospectEmail.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="managementPlanId">Plan Ofrecido *</Label>
              <select
                id="managementPlanId"
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                {...register("managementPlanId")}
              >
                <option value="" disabled>Seleccione un plan</option>
                {plans.map(plan => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} (${plan.fixedFee} MXN base)
                  </option>
                ))}
              </select>
              {errors.managementPlanId && (
                <p className="text-sm font-medium text-red-500">{errors.managementPlanId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="propertyCount">Propiedades *</Label>
              <Input id="propertyCount" type="number" min="1" {...register("propertyCount")} />
              {errors.propertyCount && (
                <p className="text-sm font-medium text-red-500">{errors.propertyCount.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxRegime">Régimen Fiscal (Opcional)</Label>
            <select
              id="taxRegime"
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              {...register("taxRegime")}
            >
              <option value="612">612 - Personas Físicas con Actividades Empresariales</option>
              <option value="601">601 - General de Ley Personas Morales</option>
              <option value="626">626 - Régimen Simplificado de Confianza (RESICO)</option>
              <option value="605">605 - Sueldos y Salarios</option>
            </select>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? "Generando..." : "Generar Cotización"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
