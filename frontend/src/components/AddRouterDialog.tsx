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
import { Plus } from "lucide-react";

const routerSchema = z.object({
  name: z.string().min(2, "Obligatorio (ej. Router Central)"),
  ipAddress: z.string().min(7, "IP inválida (ej. 192.168.1.1)"),
  apiPort: z.coerce.number().int().min(1, "Puerto inválido").default(8728),
  username: z.string().min(1, "Usuario obligatorio"),
  password: z.string().min(1, "Contraseña obligatoria"),
  propertyId: z.string().optional(),
  vpnIp: z.string().optional().or(z.literal('')),
  vpnUser: z.string().optional().or(z.literal('')),
  vpnPassword: z.string().optional().or(z.literal('')),
  vpnHost: z.string().optional().or(z.literal('')),
});

type RouterFormValues = z.infer<typeof routerSchema>;

interface AddRouterDialogProps {
  onRouterAdded: () => void;
}

export function AddRouterDialog({ onRouterAdded }: AddRouterDialogProps) {
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
      name: "",
      ipAddress: "",
      apiPort: 8728,
      username: "admin",
      password: "",
      propertyId: "",
      vpnIp: "",
      vpnUser: "",
      vpnPassword: "",
      vpnHost: "",
    },
  });

  async function onSubmit(data: RouterFormValues) {
    try {
      setLoading(true);
      await api.post('/mikrotik', data);
      setOpen(false);
      reset();
      onRouterAdded();
    } catch (error) {
      console.error("Error creating router:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (val) {
        fetchProperties();
      } else {
        reset();
      }
    }}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Agregar Router
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nuevo Equipo Mikrotik</DialogTitle>
          <DialogDescription>
            Ingresa los datos para conectar con la API de RouterOS. Verifique que el servicio API esté habilitado en el equipo (IP - Services).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 flex flex-col pt-4">
              <Label htmlFor="name">Nombre / Ubicación</Label>
              <Input id="name" placeholder="Ej. Nodo Principal" {...register("name")} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2 flex flex-col pt-4 pb-2">
              <Label>Vincular a Edificio (Opcional)</Label>
              <Select onValueChange={(val) => register("propertyId").onChange({ target: { value: val === "none" ? "" : val, name: "propertyId" } })}>
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
              <Label htmlFor="ipAddress">Dirección IP (Pública/Local)</Label>
              <Input id="ipAddress" placeholder="192.168.1.1" {...register("ipAddress")} />
              {errors.ipAddress && <p className="text-sm text-red-500">{errors.ipAddress.message}</p>}
            </div>
            
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="apiPort">Puerto API</Label>
              <Input id="apiPort" type="number" placeholder="8728" {...register("apiPort")} />
              {errors.apiPort && <p className="text-sm text-red-500">{errors.apiPort.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="username">Usuario</Label>
              <Input id="username" placeholder="admin" {...register("username")} />
              {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
            </div>
            
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>
          </div>

          <div className="pt-2 border-t mt-4">
            <h4 className="text-sm font-semibold mb-2 text-slate-700">Configuración VPN Opcional (Cloud)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 flex flex-col">
                <Label htmlFor="vpnHost">Servidor VPN (Host)</Label>
                <Input id="vpnHost" placeholder="vpn.radiotecpro.com" {...register("vpnHost")} />
              </div>
              <div className="space-y-2 flex flex-col">
                <Label htmlFor="vpnIp">IP Estática VPN</Label>
                <Input id="vpnIp" placeholder="172.26.128.5" {...register("vpnIp")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="space-y-2 flex flex-col">
                <Label htmlFor="vpnUser">Usuario SSTP</Label>
                <Input id="vpnUser" placeholder="router-sur-01" {...register("vpnUser")} />
              </div>
              <div className="space-y-2 flex flex-col">
                <Label htmlFor="vpnPassword">Password SSTP</Label>
                <Input id="vpnPassword" type="password" {...register("vpnPassword")} />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Equipo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
