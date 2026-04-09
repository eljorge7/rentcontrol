import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UploadCloud, CheckCircle2, FileText, Loader2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";

export function UploadXmlDialog({ 
  isOpen, 
  onClose,
  onUploaded 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onUploaded: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.toLowerCase().endsWith('.xml')) {
         setErrorMsg("El archivo debe ser formato .XML");
         return;
      }
      setSelectedFile(file);
      setErrorMsg("");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setErrorMsg("");
    
    try {
      const textContent = await selectedFile.text();
      // Send raw XML content as part of the body
      await api.post('/expenses/upload-xml', { xmlContent: textContent });
      toast.success("Factura extraída con éxito");
      onUploaded();
      onClose();
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.response?.data?.message || "Ocurrió un error leyendo el CFDI.");
      toast.error("Error al procesar XML");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="bg-emerald-600 p-6 text-white text-center">
          <UploadCloud className="h-10 w-10 mx-auto text-emerald-200 mb-2" />
          <h3 className="text-xl font-bold tracking-tight">Buzón Automático de Facturas</h3>
          <p className="text-emerald-100 text-sm mt-1">Sube el XML y extraeremos el gasto y proveedor al instante.</p>
        </div>

        <div className="p-6 space-y-6">
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 relative hover:bg-slate-100 transition-colors cursor-pointer"
               onClick={() => document.getElementById('xml-upload')?.click()}>
             {selectedFile ? (
               <>
                 <FileText className="h-8 w-8 text-emerald-500 mb-2" />
                 <p className="font-semibold text-slate-800 text-center text-sm">{selectedFile.name}</p>
                 <p className="text-xs text-slate-500 mt-1">{(selectedFile.size / 1024).toFixed(1)} KB</p>
               </>
             ) : (
               <>
                 <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
                 <p className="font-medium text-slate-700 text-sm">Haz clic aquí para seleccionar el XML</p>
                 <p className="text-xs text-slate-500 mt-1">CFDI 3.3 o 4.0 soportado</p>
               </>
             )}
             <input type="file" id="xml-upload" className="hidden" accept=".xml" onChange={handleFileChange} />
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 text-rose-600 bg-rose-50 p-3 rounded-lg text-sm font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => { setSelectedFile(null); onClose(); }} 
              className="rounded-xl border-slate-200 text-slate-700"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleUpload}
              disabled={loading || !selectedFile}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              Procesar Gasto
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
