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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const tenantSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  phone: z.string().optional(),
  rfc: z.string().optional().refine((val) => {
    if (!val) return true;
    return /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/i.test(val);
  }, "Formato de RFC inválido (Ej. ABCD801231XYZ)"),
  taxRegimen: z.string().optional(),
  zipCode: z.string().optional(),
  password: z.string().optional().refine(val => !val || val.length >= 6, "Debe tener al menos 6 caracteres"),
});

type TenantFormValues = z.infer<typeof tenantSchema>;

interface EditTenantDialogProps {
  tenant: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    rfc?: string;
    taxRegimen?: string;
    zipCode?: string;
  };
  onTenantUpdated: () => void;
}

export function EditTenantDialog({ tenant, onTenantUpdated }: EditTenantDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      name: tenant.name,
      email: tenant.email,
      phone: tenant.phone || "",
      rfc: tenant.rfc || "",
      taxRegimen: tenant.taxRegimen || "",
      zipCode: tenant.zipCode || "",
      password: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: tenant.name,
        email: tenant.email,
        phone: tenant.phone || "",
        rfc: tenant.rfc || "",
        taxRegimen: tenant.taxRegimen || "",
        zipCode: tenant.zipCode || "",
        password: "",
      });
    }
  }, [open, tenant, reset]);

  async function onSubmit(data: TenantFormValues) {
    try {
      setLoading(true);
      await api.patch(`/tenants/${tenant.id}`, data);
      setOpen(false);
      onTenantUpdated();
    } catch (error) {
      console.error("Error updating tenant:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Inquilino</DialogTitle>
          <DialogDescription>
            Modifica la información de contacto y facturación.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2 flex flex-col pt-4">
            <Label htmlFor="edit-name">Nombre Completo</Label>
            <Input id="edit-name" placeholder="Ej. Juan Pérez" {...register("name")} />
            {errors.name && (
              <p className="text-sm font-medium text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2 flex flex-col">
            <Label htmlFor="edit-email">Correo Electrónico</Label>
            <Input id="edit-email" type="email" placeholder="ejemplo@correo.com" {...register("email")} />
            {errors.email && (
              <p className="text-sm font-medium text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2 flex flex-col">
            <Label htmlFor="edit-phone">Teléfono (Opcional)</Label>
            <Input id="edit-phone" placeholder="Ej. 55 1234 5678" {...register("phone")} />
          </div>

          <div className="pt-2">
            <h4 className="text-sm font-medium mb-2 border-b pb-1">Restablecer Contraseña (Opcional)</h4>
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="password">Nueva Contraseña</Label>
              <Input id="password" type="text" placeholder="Dejar en blanco para no cambiarla" {...register("password")} />
              {errors.password && (
                <p className="text-sm font-medium text-red-500">{errors.password.message}</p>
              )}
            </div>
          </div>
          
          <div className="pt-2">
            <h4 className="text-sm font-medium mb-2 border-b pb-1">Datos de Facturación (Opcional)</h4>
            <div className="space-y-4">
              <div className="space-y-2 flex flex-col">
                <Label htmlFor="edit-rfc">RFC</Label>
                <Input id="edit-rfc" placeholder="ABCD123456XYZ" className="uppercase" {...register("rfc")} />
                {errors.rfc && (
                  <p className="text-sm font-medium text-red-500">{errors.rfc.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 flex flex-col">
                  <Label htmlFor="taxRegimen">Régimen Fiscal</Label>
                  <Select defaultValue={tenant.taxRegimen || undefined} onValueChange={(val) => setValue("taxRegimen", val as string | undefined)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un régimen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="601">601 - Personas Morales</SelectItem>
                      <SelectItem value="603">603 - Personas Morales sin Fines Lucrativos</SelectItem>
                      <SelectItem value="605">605 - Sueldos y Salarios</SelectItem>
                      <SelectItem value="606">606 - Arrendamiento</SelectItem>
                      <SelectItem value="612">612 - Personas Físicas, Actividades Profesionales</SelectItem>
                      <SelectItem value="616">616 - Sin obligaciones fiscales</SelectItem>
                      <SelectItem value="621">621 - Incorporación Fiscal</SelectItem>
                      <SelectItem value="625">625 - Plataformas Tecnológicas</SelectItem>
                      <SelectItem value="626">626 - Régimen Simplificado de Confianza (RESICO)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 flex flex-col">
                  <Label htmlFor="edit-zipCode">C.P.</Label>
                  <Input id="edit-zipCode" placeholder="Ej. 01000" {...register("zipCode")} />
                </div>
              </div>
            </div>
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
