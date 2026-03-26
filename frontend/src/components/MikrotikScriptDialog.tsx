"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Copy, Terminal, CheckCircle2 } from "lucide-react";
import api from "@/lib/api";

interface MikrotikScriptDialogProps {
  routerId: string;
  routerName: string;
}

export function MikrotikScriptDialog({ routerId, routerName }: MikrotikScriptDialogProps) {
  const [open, setOpen] = useState(false);
  const [script, setScript] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchScript = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/mikrotik/${routerId}/install-script`);
      setScript(res.data.script);
    } catch (error) {
      console.error("Error fetching script", error);
      setScript("Error al generar el script. Verifique conexión al servidor.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (val) {
        fetchScript();
        setCopied(false);
      }
    }}>
      <DialogTrigger>
        <span className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-3 text-blue-600 border border-blue-200 hover:bg-blue-50">
          <Terminal className="h-4 w-4 mr-2" />
          Script
        </span>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-slate-800" />
            Script de Instalación: {routerName}
          </DialogTitle>
          <DialogDescription>
            Copia este bloque de código y pégalo en una terminal ("New Terminal") dentro de tu Mikrotik (usando Winbox o WebFig). Esto activará la API y creará el usuario seguro para que RentControl maneje automáticamente los cortes y velocidades.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 relative bg-slate-900 rounded-md p-4 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12 text-slate-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400 mr-3"></div>
              Generando comandos...
            </div>
          ) : (
            <>
              <div className="absolute top-2 right-2">
                <Button 
                  size="sm" 
                  variant="secondary" 
                  onClick={copyToClipboard}
                  className={`${copied ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
                >
                  {copied ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copied ? '¡Copiado!' : 'Copiar'}
                </Button>
              </div>
              <pre className="text-emerald-400 font-mono text-xs whitespace-pre-wrap pt-8 max-h-96 overflow-y-auto w-full break-all">
                {script}
              </pre>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
