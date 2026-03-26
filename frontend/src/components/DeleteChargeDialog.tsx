"use client";

import { useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

interface DeleteChargeDialogProps {
  chargeId: string;
  amount: number;
  description: string;
  onChargeDeleted: () => void;
}

export function DeleteChargeDialog({ chargeId, amount, description, onChargeDeleted }: DeleteChargeDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    try {
      setLoading(true);
      await api.delete(`/charges/${chargeId}`);
      setOpen(false);
      onChargeDeleted();
    } catch (error) {
      console.error("Error deleting charge:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {/* @ts-ignore */}
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Anular Cargo / Recibo?</AlertDialogTitle>
          <AlertDialogDescription>
            Estás a punto de borrar el cobro por <strong>${amount.toLocaleString()} ({description})</strong>.
            <br/><br/>
            Esta acción es irreversible y eliminará el recibo del estado de cuenta del inquilino de forma permanente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Eliminando..." : "Eliminar Cargo"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
