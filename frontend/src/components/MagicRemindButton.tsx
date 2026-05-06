"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wand2, Loader2, Check } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

interface MagicRemindButtonProps {
  chargeId: string;
  tenantName: string;
}

export function MagicRemindButton({ chargeId, tenantName }: MagicRemindButtonProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRemind = async () => {
    try {
      setLoading(true);
      await api.post(`/charges/${chargeId}/remind`);
      
      setSuccess(true);
      toast.success("WhatsApp Enviado", {
        description: `El recordatorio ha sido enviado a ${tenantName} vía OmniChat.`,
      });

      // Reset success state after a few seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error: any) {
      toast.error("Error al enviar", {
        description: error.response?.data?.message || "Ocurrió un error al contactar el motor de OmniChat.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={`transition-all duration-300 relative overflow-hidden group ${
        success 
          ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-700" 
          : "bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-indigo-100 hover:border-purple-300 hover:text-purple-800"
      }`}
      onClick={handleRemind}
      disabled={loading || success}
      title="Cobranza Mágica por WhatsApp"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
      ) : success ? (
        <>
          <Check className="h-4 w-4 mr-1.5" />
          <span>Enviado</span>
        </>
      ) : (
        <>
          <Wand2 className="h-4 w-4 mr-1.5 transition-transform group-hover:rotate-12 group-hover:scale-110 text-purple-500" />
          <span className="font-bold">Recordar</span>
        </>
      )}
    </Button>
  );
}
