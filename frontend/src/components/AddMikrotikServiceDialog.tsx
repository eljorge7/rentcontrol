"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Wifi, Server, Terminal } from "lucide-react";
import api from "@/lib/api";

interface NetworkProfile {
  id: string;
  name: string;
  downloadSpeed: number;
  uploadSpeed: number;
  price?: number;
}

interface AddMikrotikServiceDialogProps {
  leaseId: string;
  onServiceAdded: () => void;
}

export function AddMikrotikServiceDialog({ leaseId, onServiceAdded }: AddMikrotikServiceDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [profiles, setProfiles] = useState<NetworkProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState("");
  const [pppoeUser, setPppoeUser] = useState("");
  const [pppoePassword, setPppoePassword] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [macAddress, setMacAddress] = useState("");

  useEffect(() => {
    if (open) {
      fetchProfiles();
    }
  }, [open]);

  const fetchProfiles = async () => {
    try {
      const response = await api.get('/network-profiles');
      setProfiles(response.data);
    } catch (error) {
      console.error("Error fetching network profiles:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfile || !pppoeUser || !pppoePassword) return;

    setLoading(true);
    try {
      await api.post(`/leases/${leaseId}/services`, {
        networkProfileId: selectedProfile,
        pppoeUser,
        pppoePassword,
        ipAddress: ipAddress || undefined,
        macAddress: macAddress || undefined
      });
      // Optionally toast success here
      setOpen(false);
      onServiceAdded();
      
      // Reset form
      setSelectedProfile("");
      setPppoeUser("");
      setPppoePassword("");
      setIpAddress("");
      setMacAddress("");
    } catch (error: any) {
      console.error("Error adding service:", error);
      alert(error.response?.data?.message || "Ocurrió un error al añadir el servicio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <span className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-3 text-blue-600 border border-blue-200 hover:bg-blue-50">
          <Plus className="h-4 w-4 mr-2" />
          Añadir Internet Mikrotik
        </span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5 text-amber-500" />
            Nuevo Servicio de Internet
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          
          <div className="space-y-2">
            <Label htmlFor="profile" className="flex items-center gap-2">
              <Server className="h-4 w-4 text-slate-500" />
              Perfil de Conexión (Plan)
            </Label>
            <Select value={selectedProfile} onValueChange={(val) => setSelectedProfile(val || "")} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un plan de velocidad" />
              </SelectTrigger>
              <SelectContent>
                {profiles.map(profile => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.name} ({profile.downloadSpeed}M / {profile.uploadSpeed}M) - ${profile.price || 0} MXN
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pppoeUser" className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-slate-500" />
                Usuario PPPoE
              </Label>
              <Input
                id="pppoeUser"
                type="text"
                placeholder="ej. santiago"
                value={pppoeUser}
                onChange={(e) => setPppoeUser(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pppoePassword">Contraseña PPPoE</Label>
              <Input
                id="pppoePassword"
                type="text"
                placeholder="ej. rent2026"
                value={pppoePassword}
                onChange={(e) => setPppoePassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ipAddress">IP Estática (Opcional)</Label>
              <Input
                id="ipAddress"
                type="text"
                placeholder="Vía Pool si en blanco"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="macAddress">MAC (Opcional)</Label>
              <Input
                id="macAddress"
                type="text"
                placeholder="00:1A:2B:3C:4D:5E"
                value={macAddress}
                onChange={(e) => setMacAddress(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !selectedProfile || !pppoeUser || !pppoePassword}>
              {loading ? "Añadiendo..." : "Guardar Servicio"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
