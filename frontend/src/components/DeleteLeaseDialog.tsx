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

interface DeleteLeaseDialogProps {
  lease: { 
    id: string; 
    tenant: { name: string }; 
    unit: { name: string } 
  };
  onLeaseDeleted: () => void;
}

export function DeleteLeaseDialog({ lease, onLeaseDeleted }: DeleteLeaseDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    try {
      setLoading(true);
      await api.delete(`/leases/${lease.id}`);
      setOpen(false);
      onLeaseDeleted();
    } catch (error) {
      console.error("Error deleting lease:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button variant="destructive" size="icon" className="h-8 w-8">
            <Trash2 className="h-4 w-4" />
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Anular Contrato?</AlertDialogTitle>
          <AlertDialogDescription>
            Estás a punto de borrar el contrato de <strong>{lease.tenant?.name}</strong> para el local <strong>{lease.unit?.name}</strong>. 
            Esta acción liberará el local para que pueda ser rentado a otra persona.
            <br/><br/>
            Si el contrato finalizó pacíficamente, lo mejor es Editarlo y marcarlo como "Terminado" en lugar de eliminar el historial. ¿Estás seguro de continuar?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Eliminando..." : "Eliminar Contrato"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
