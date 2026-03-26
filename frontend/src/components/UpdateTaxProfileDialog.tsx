import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Loader2, UploadCloud, CheckCircle2 } from "lucide-react";
import api from "@/lib/api";

interface UpdateTaxProfileDialogProps {
  tenant?: any;
  user?: any;
  onUpdated: () => void;
}

const REGIMENES_FISCALES = [
  { value: "601", label: "601 - General de Ley Personas Morales" },
  { value: "603", label: "603 - Personas Morales con Fines no Lucrativos" },
  { value: "605", label: "605 - Sueldos y Salarios e Ingresos Asimilados a Salarios" },
  { value: "606", label: "606 - Arrendamiento" },
  { value: "608", label: "608 - Demás ingresos" },
  { value: "610", label: "610 - Residentes en el Extranjero sin Establecimiento Permanente en México" },
  { value: "611", label: "611 - Ingresos por Dividendos (socios y accionistas)" },
  { value: "612", label: "612 - Personas Físicas con Actividades Empresariales y Profesionales" },
  { value: "614", label: "614 - Ingresos por intereses" },
  { value: "615", label: "615 - Régimen de los ingresos por obtención de premios" },
  { value: "616", label: "616 - Sin obligaciones fiscales" },
  { value: "620", label: "620 - Sociedades Cooperativas de Producción que optan por diferir sus ingresos" },
  { value: "621", label: "621 - Incorporación Fiscal" },
  { value: "622", label: "622 - Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras" },
  { value: "623", label: "623 - Opcional para Grupos de Sociedades" },
  { value: "624", label: "624 - Coordinados" },
  { value: "625", label: "625 - Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas" },
  { value: "626", label: "626 - Régimen Simplificado de Confianza (RESICO)" }
];

export function UpdateTaxProfileDialog({ tenant, user, onUpdated }: UpdateTaxProfileDialogProps) {
  const entity = tenant || user;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [requiresInvoice, setRequiresInvoice] = useState(entity?.requiresInvoice || false);
  const [rfc, setRfc] = useState(entity?.rfc || "");
  const [taxRegimen, setTaxRegimen] = useState(entity?.taxRegimen || "");
  const [zipCode, setZipCode] = useState(entity?.zipCode || "");
  
  const [taxDocumentUrl, setTaxDocumentUrl] = useState(entity?.taxDocumentUrl || "");
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploadingDoc(true);
    const formData = new FormData();
    formData.append("files", file);

    try {
      const response = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data && response.data.urls && response.data.urls.length > 0) {
        setTaxDocumentUrl(response.data.urls[0]);
      }
    } catch (error) {
      console.error("Error al subir constancia:", error);
      alert("Hubo un error al subir el archivo. Intenta de nuevo.");
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleSave = async () => {
    if (requiresInvoice && (!rfc || !taxRegimen || !zipCode || !taxDocumentUrl)) {
      alert("Si solicitas factura, debes completar tu RFC, Régimen, CP y subir tu Constancia.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        requiresInvoice,
        rfc: requiresInvoice ? rfc : null,
        taxRegimen: requiresInvoice ? taxRegimen : null,
        zipCode: requiresInvoice ? zipCode : null,
        taxDocumentUrl: requiresInvoice ? taxDocumentUrl : null,
      };

      if (tenant) {
        await api.patch(`/tenants/${tenant.id}`, payload);
      } else {
        await api.patch('/users/my-profile/tax', payload);
      }

      setOpen(false);
      onUpdated();
    } catch (error: any) {
      console.error("Error updating tax profile:", error);
      const backendMessage = error?.response?.data?.message || error.message;
      alert(`Error al actualizar la configuración de facturación: ${backendMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={(props) => (
        <Button {...props} variant="outline" className="w-full sm:w-auto h-9 text-sm">
          <FileText className="mr-2 h-4 w-4 text-slate-500" />
          Configurar Facturación
        </Button>
      )} />
      <DialogContent className="sm:max-w-xl animate-in fade-in zoom-in-95 duration-200 p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
        <div className="bg-gradient-to-br from-indigo-50 to-white px-6 py-8 border-b border-indigo-100">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="h-6 w-6 text-indigo-500" />
              Datos de Facturación Fiscal
            </DialogTitle>
            <DialogDescription className="text-slate-500 mt-2 text-base">
              Si requieres Comprobante Fiscal (CFDI) por tus pagos de renta, actívalo y sube tu Constancia de Situación Fiscal actualizada.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6 bg-white">
          <div className="flex items-center justify-between bg-slate-50 p-4 border border-slate-200 rounded-xl">
            <div>
              <Label className="text-base font-bold text-slate-800">¿Requieres Factura Mensual?</Label>
              <p className="text-sm text-slate-500">Activarlo notificará a la administración para generar tu CFDI automáticamente tras realizar el pago.</p>
            </div>
            <Switch 
              checked={requiresInvoice}
              onCheckedChange={setRequiresInvoice}
              className="data-[state=checked]:bg-indigo-600"
            />
          </div>

          {requiresInvoice && (
            <div className="space-y-6 animate-in slide-in-from-top-4 duration-300 relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>RFC (Registro Federal de Contribuyentes) <span className="text-red-500">*</span></Label>
                  <Input 
                    placeholder="ABCD123456EF7" 
                    value={rfc} 
                    onChange={(e) => setRfc(e.target.value.toUpperCase())}
                    maxLength={13}
                    className="uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Código Postal (Domicilio Fiscal) <span className="text-red-500">*</span></Label>
                  <Input 
                    placeholder="12345" 
                    type="number"
                    value={zipCode} 
                    onChange={(e) => setZipCode(e.target.value)}
                    maxLength={5}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Régimen Fiscal <span className="text-red-500">*</span></Label>
                <Select value={taxRegimen} onValueChange={setTaxRegimen}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona tu régimen fiscal del SAT" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {REGIMENES_FISCALES.map((reg) => (
                      <SelectItem key={reg.value} value={reg.value}>
                        {reg.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <Label>Constancia de Situación Fiscal (PDF o Imagen) <span className="text-red-500">*</span></Label>
                <div className="border-2 border-dashed border-indigo-200 bg-indigo-50/50 rounded-xl p-6 text-center transition-colors hover:bg-indigo-50">
                  {uploadingDoc ? (
                    <div className="flex flex-col items-center justify-center text-indigo-600">
                      <Loader2 className="h-8 w-8 animate-spin mb-2" />
                      <p className="text-sm font-medium">Subiendo archivo...</p>
                    </div>
                  ) : taxDocumentUrl ? (
                    <div className="flex flex-col items-center justify-center text-emerald-600">
                      <CheckCircle2 className="h-10 w-10 mb-2" />
                      <p className="text-sm font-bold">¡Constancia subida exitosamente!</p>
                      <a href={taxDocumentUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline mt-2">
                        Ver Documento Actual
                      </a>
                      <div className="mt-4">
                        <Label htmlFor="tax-file" className="text-xs text-slate-500 hover:text-indigo-600 cursor-pointer border-b border-transparent hover:border-indigo-600 transition-colors">
                          Sustituir documento
                        </Label>
                        <input id="tax-file" type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileUpload} />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <UploadCloud className="h-10 w-10 mb-3 text-indigo-300" />
                      <p className="text-sm font-medium text-slate-700 mb-1">Haz clic para buscar tu archivo CSF</p>
                      <p className="text-xs text-slate-400">PDF, JPG o PNG. Máximo 5MB.</p>
                      <Label htmlFor="tax-file" className="mt-4 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 h-9 px-4 cursor-pointer shadow-sm">
                        Seleccionar Archivo
                      </Label>
                      <input id="tax-file" type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileUpload} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="bg-slate-50 p-6 border-t border-slate-100 flex items-center justify-end gap-3 rounded-b-2xl">
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading} className="text-slate-500 hover:text-slate-700 hover:bg-slate-200">
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading || uploadingDoc} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px] shadow-md hover:shadow-lg transition-all">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Guardar Configuración"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
