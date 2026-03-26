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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit } from "lucide-react";

const routerSchema = z.object({
  name: z.string().min(2, "Obligatorio (ej. Router Central)"),
  ipAddress: z.string().min(7, "IP inválida (ej. 192.168.1.1)"),
  apiPort: z.coerce.number().int().min(1, "Puerto inválido").default(8728),
  username: z.string().min(1, "Usuario obligatorio"),
  password: z.string().optional(), // Opcional al editar
  propertyId: z.string().optional(),
  vpnIp: z.string().optional().or(z.literal('')),
  vpnUser: z.string().optional().or(z.literal('')),
  vpnPassword: z.string().optional().or(z.literal('')),
  vpnHost: z.string().optional().or(z.literal('')),
});

type RouterFormValues = z.infer<typeof routerSchema>;

interface EditRouterDialogProps {
  router: {
    id: string;
    name: string;
    ipAddress: string;
    apiPort: number;
    username: string;
    property?: { id: string; name: string };
    vpnIp?: string;
    vpnUser?: string;
    vpnPassword?: string;
    vpnHost?: string;
  };
  onRouterUpdated: () => void;
}

export function EditRouterDialog({ router, onRouterUpdated }: EditRouterDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);

  const fetchProperties = async () => {
    try {
      const res = await api.get('/properties');
      setProperties(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(routerSchema),
    defaultValues: {
      name: router.name,
      ipAddress: router.ipAddress,
      apiPort: router.apiPort,
      username: router.username,
      password: "",
      propertyId: router.property?.id || "",
      vpnIp: router.vpnIp || "",
      vpnUser: router.vpnUser || "",
      vpnPassword: router.vpnPassword || "",
      vpnHost: router.vpnHost || "",
    },
  });

  async function onSubmit(data: RouterFormValues) {
    try {
      setLoading(true);
      
      const payload = { ...data };
      if (!payload.password) {
        delete payload.password; // No enviar contraseña si el admin no la cambió
      }

      await api.patch(`/mikrotik/${router.id}`, payload);
      setOpen(false);
      reset();
      onRouterUpdated();
    } catch (error) {
      console.error("Error updating router:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (val) {
        fetchProperties();
        reset({
          name: router.name,
          ipAddress: router.ipAddress,
          apiPort: router.apiPort,
          username: router.username,
          password: "",
          propertyId: router.property?.id || "",
          vpnIp: router.vpnIp || "",
          vpnUser: router.vpnUser || "",
          vpnPassword: router.vpnPassword || "",
          vpnHost: router.vpnHost || "",
        });
      }
    }}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Edit className="h-4 w-4 text-slate-500" />
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Equipo Mikrotik</DialogTitle>
          <DialogDescription>
            Actualice la credenciales o de acceso API. Deje la contraseña en blanco para no modificarla.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 flex flex-col pt-4">
              <Label htmlFor="edit-name">Nombre / Ubicación</Label>
              <Input id="edit-name" placeholder="Ej. Nodo Principal" {...register("name")} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2 flex flex-col pt-4 pb-2">
              <Label>Vincular a Edificio (Opcional)</Label>
              <Select defaultValue={router.property?.id || "none"} onValueChange={(val) => register("propertyId").onChange({ target: { value: val === "none" ? "" : val, name: "propertyId" } })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar propiedad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin asignación</SelectItem>
                  {properties.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="edit-ipAddress">Dirección IP</Label>
              <Input id="edit-ipAddress" placeholder="192.168.1.1" {...register("ipAddress")} />
              {errors.ipAddress && <p className="text-sm text-red-500">{errors.ipAddress.message}</p>}
            </div>
            
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="edit-apiPort">Puerto API</Label>
              <Input id="edit-apiPort" type="number" placeholder="8728" {...register("apiPort")} />
              {errors.apiPort && <p className="text-sm text-red-500">{errors.apiPort.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="edit-username">Usuario</Label>
              <Input id="edit-username" placeholder="admin" {...register("username")} />
              {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
            </div>
            
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="edit-password">Nueva Contraseña</Label>
              <Input id="edit-password" type="password" placeholder="(Opcional)" {...register("password")} />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>
          </div>

          <div className="pt-2 border-t mt-4">
            <h4 className="text-sm font-semibold mb-2 text-slate-700">Configuración VPN Opcional (Cloud)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 flex flex-col">
                <Label htmlFor="edit-vpnHost">Servidor VPN (Host)</Label>
                <Input id="edit-vpnHost" placeholder="vpn.radiotecpro.com" {...register("vpnHost")} />
              </div>
              <div className="space-y-2 flex flex-col">
                <Label htmlFor="edit-vpnIp">IP Estática VPN</Label>
                <Input id="edit-vpnIp" placeholder="172.26.128.5" {...register("vpnIp")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="space-y-2 flex flex-col">
                <Label htmlFor="edit-vpnUser">Usuario SSTP</Label>
                <Input id="edit-vpnUser" placeholder="router-sur-01" {...register("vpnUser")} />
              </div>
              <div className="space-y-2 flex flex-col">
                <Label htmlFor="edit-vpnPassword">Password SSTP (Opcional)</Label>
                <Input id="edit-vpnPassword" type="password" placeholder="(Opcional)" {...register("vpnPassword")} />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Actualizar Equipo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
