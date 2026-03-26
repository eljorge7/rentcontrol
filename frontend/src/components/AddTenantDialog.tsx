"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
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
  password: z.string().optional(),
  ownerId: z.string().optional(),
});

type TenantFormValues = z.infer<typeof tenantSchema>;

interface AddTenantDialogProps {
  onTenantAdded: () => void;
  customTrigger?: React.ReactElement;
}

export function AddTenantDialog({ onTenantAdded, customTrigger }: AddTenantDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const [owners, setOwners] = useState<{id: string, name: string}[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      rfc: "",
      taxRegimen: "",
      zipCode: "",
      password: "",
      ownerId: "",
    },
  });

  // Hydration fix
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch owners if the user is a MANAGER
  useEffect(() => {
    if (user?.role === 'MANAGER' && open) {
      api.get('/users/owners').then(res => setOwners(res.data)).catch(console.error);
    }
  }, [user, open]);

  async function onSubmit(data: TenantFormValues) {
    try {
      setLoading(true);
      const payload: any = { ...data };
      Object.keys(payload).forEach(key => {
        if (payload[key] === "") {
          delete payload[key];
        }
      });
      await api.post('/tenants', payload);
      setOpen(false);
      reset();
      onTenantAdded();
    } catch (error: any) {
      console.error("Error creating tenant:", error);
      alert(error.response?.data?.message || "Ocurrió un error al guardar el inquilino. Verifica que el correo o RFC no estén duplicados y revisa tu conexión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          customTrigger ?? (
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nuevo Inquilino
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Añadir Inquilino</DialogTitle>
          <DialogDescription>
            Ingresa los datos de contacto y facturación del inquilino.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {mounted && user?.role === 'MANAGER' && (
            <div className="space-y-2 flex flex-col pt-4 border-b pb-4">
              <Label htmlFor="ownerId">Propietario a quien pertenece</Label>
              <Select onValueChange={(val) => setValue("ownerId", val as string)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione el dueño" />
                </SelectTrigger>
                <SelectContent>
                  {owners.map(o => (
                    <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2 flex flex-col pt-2">
            <Label htmlFor="name">Nombre Completo</Label>
            <Input id="name" placeholder="Ej. Juan Pérez" {...register("name")} />
            {errors.name && (
              <p className="text-sm font-medium text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2 flex flex-col">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input id="email" type="email" placeholder="ejemplo@correo.com" {...register("email")} />
            {errors.email && (
              <p className="text-sm font-medium text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2 flex flex-col">
            <Label htmlFor="phone">Teléfono (Opcional)</Label>
            <Input id="phone" placeholder="Ej. 55 1234 5678" {...register("phone")} />
          </div>

          <div className="pt-2">
            <h4 className="text-sm font-medium mb-2 border-b pb-1">Credenciales de Acceso</h4>
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="password">Contraseña Inicial (Opcional)</Label>
              <Input id="password" type="text" placeholder="RentControl2026" {...register("password")} />
              <p className="text-xs text-slate-500">Si se deja en blanco se asignará: <span className="font-mono">RentControl2026</span></p>
              {errors.password && (
                <p className="text-sm font-medium text-red-500">{errors.password.message}</p>
              )}
            </div>
          </div>
          
          <div className="pt-2">
            <h4 className="text-sm font-medium mb-2 border-b pb-1">Datos de Facturación (Opcional)</h4>
            <div className="space-y-4">
              <div className="space-y-2 flex flex-col">
                <Label htmlFor="rfc">RFC</Label>
                <Input id="rfc" placeholder="ABCD123456XYZ" className="uppercase" {...register("rfc")} />
                {errors.rfc && (
                  <p className="text-sm font-medium text-red-500">{errors.rfc.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 flex flex-col">
                  <Label htmlFor="taxRegimen">Régimen Fiscal</Label>
                  <Select onValueChange={(val) => setValue("taxRegimen", val as string | undefined)}>
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
                  <Label htmlFor="zipCode">C.P.</Label>
                  <Input id="zipCode" placeholder="Ej. 01000" {...register("zipCode")} />
                </div>
              </div>
            </div>
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
