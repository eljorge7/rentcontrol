"use client";

import { useEffect, useState } from "react";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getToken } from "@/lib/auth";
import { Loader2, Key, Save, AlertCircle, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

interface FacturaProSettings {
  invoicePrefix: string;
  invoiceCurrentFolio: number;
  quotePrefix: string;
  quoteCurrentFolio: number;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  isActive: boolean;
  createdAt: string;
  lastUsedAt: string | null;
}

export function FacturaProSettings() {
  const token = getToken();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState<FacturaProSettings>({
    invoicePrefix: "F-",
    invoiceCurrentFolio: 1,
    quotePrefix: "COT-",
    quoteCurrentFolio: 1,
  });

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [settingsRes, keysRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/facturapro-settings`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/facturapro-settings/api-keys`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (settingsRes.ok) {
        const s = await settingsRes.json();
        setSettings(s);
      }
      
      if (keysRes.ok) {
        setApiKeys(await keysRes.json());
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar la configuración");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/facturapro-settings`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          invoicePrefix: settings.invoicePrefix,
          invoiceCurrentFolio: Number(settings.invoiceCurrentFolio),
          quotePrefix: settings.quotePrefix,
          quoteCurrentFolio: Number(settings.quoteCurrentFolio)
        })
      });

      if (!res.ok) throw new Error("");
      toast.success("Configuración actualizada correctamente");
    } catch (e) {
      toast.error("No se pudo guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  const generateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    try {
      setGenerating(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/facturapro-settings/api-keys`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ name: newKeyName })
      });

      if (res.ok) {
        const newKey = await res.json();
        setApiKeys([newKey, ...apiKeys]);
        setNewKeyName("");
        toast.success("Llave API generada. Cópiala ahora, no se volverá a mostrar.");
      } else {
        throw new Error();
      }
    } catch (e) {
      toast.error("Ocurrió un error al generar la llave");
    } finally {
      setGenerating(false);
    }
  };

  const revokeKey = async (id: string) => {
    if(!confirm("¿Estás seguro de revocar esta llave? Cualquier integración asociada dejará de funcionar de inmediato.")) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/facturapro-settings/api-keys/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setApiKeys(apiKeys.filter(k => k.id !== id));
        toast.success("Llave API revocada devinitivamente.");
      } else {
        throw new Error();
      }
    } catch {
      toast.error("Error al revocar la llave API");
    }
  };

  if (loading) {
    return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Ajustes de Ecosistema</h2>
          <p className="text-muted-foreground mt-1">Administra los folios de FacturaPro y llaves API para conectar otros módulos.</p>
        </div>
      </div>

      <Tabs defaultValue="series" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="series">Series y Folios</TabsTrigger>
          <TabsTrigger value="developer">Llaves API</TabsTrigger>
        </TabsList>
        
        <TabsContent value="series" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Formatos de Emisión</CardTitle>
              <CardDescription>
                Define los prefijos y correlativos de avance para tus documentos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b">
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Facturas Emitidas (CFDI)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="invoicePrefix">Prefijo Fijo</Label>
                      <Input id="invoicePrefix" value={settings.invoicePrefix} onChange={(e) => setSettings({...settings, invoicePrefix: e.target.value})} placeholder="Ej: F-" />
                    </div>
                    <div>
                      <Label htmlFor="invoiceFolio">Folio Siguiente</Label>
                      <Input id="invoiceFolio" type="number" min="1" value={settings.invoiceCurrentFolio} onChange={(e) => setSettings({...settings, invoiceCurrentFolio: parseInt(e.target.value) || 1})} placeholder="Ej: 1" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1"/>
                    Siguiente CFDI se timbrará como: <strong>{settings.invoicePrefix}{String(settings.invoiceCurrentFolio).padStart(4, '0')}</strong>
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Cotizaciones M2M</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quotePrefix">Prefijo Fijo</Label>
                      <Input id="quotePrefix" value={settings.quotePrefix} onChange={(e) => setSettings({...settings, quotePrefix: e.target.value})} placeholder="Ej: COT-" />
                    </div>
                    <div>
                      <Label htmlFor="quoteFolio">Folio Siguiente</Label>
                      <Input id="quoteFolio" type="number" min="1" value={settings.quoteCurrentFolio} onChange={(e) => setSettings({...settings, quoteCurrentFolio: parseInt(e.target.value) || 1})} placeholder="Ej: 1" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1"/>
                    Siguiente Cotización se generará como: <strong>{settings.quotePrefix}{String(settings.quoteCurrentFolio).padStart(4, '0')}</strong>
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 dark:bg-zinc-900/50 justify-end py-4 rounded-b-xl border-t dark:border-zinc-800">
              <Button onClick={handleSaveSettings} disabled={saving} className="min-w-[120px]">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2"/>Guardar Cambios</>}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="developer" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Desarrolladores e Integraciones (M2M)</CardTitle>
              <CardDescription>
                Emite tokens REST API para conectar OmniChat, CRMs externos u otras piezas del ecosistema para automatizar FacturaPro.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <form onSubmit={generateKey} className="flex gap-4 items-end bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="keyName">Nombre Descriptivo de la Llave</Label>
                  <Input id="keyName" required value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} placeholder="Ej: Conexión Bot OmniChat WhatsApp" />
                </div>
                <Button type="submit" disabled={generating} className="bg-blue-600 hover:bg-blue-700">
                  {generating ? <Loader2 className="w-4 h-4 animate-spin"/> : <><Key className="w-4 h-4 mr-2"/> Generar Nueva Llave</>}
                </Button>
              </form>

              <div className="rounded-md border mt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Llave API</TableHead>
                      <TableHead>Fecha de Creación</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeys.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                          No tienes llaves API generadas.
                        </TableCell>
                      </TableRow>
                    ) : apiKeys.map((key) => (
                      <TableRow key={key.id}>
                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">{key.name}</TableCell>
                        <TableCell>
                          <code className="text-xs bg-gray-100 dark:bg-zinc-800 py-1 px-2 rounded font-mono text-gray-800 dark:text-gray-300">
                            {key.key}
                          </code>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                           {new Date(key.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => revokeKey(key.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
      </Tabs>
    </div>
  );
}
