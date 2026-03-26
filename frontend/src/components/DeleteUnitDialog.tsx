"use client";

import { useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

interface DeleteUnitDialogProps {
  unit: { id: string; name: string; isOccupied: boolean };
  onUnitDeleted: () => void;
}

export function DeleteUnitDialog({ unit, onUnitDeleted }: DeleteUnitDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    try {
      setLoading(true);
      await api.delete(`/units/${unit.id}`);
      setOpen(false);
      onUnitDeleted();
    } catch (error) {
      console.error("Error deleting unit:", error);
    } finally {
      setLoading(false);
    }
  }

  // Prevent deletion of occupied unit from the UI interface
  if (unit.isOccupied) {
    return (
      <Button variant="destructive" size="icon" className="h-8 w-8 opacity-50 cursor-not-allowed" title="No puedes eliminar un local ocupado">
        <Trash2 className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button variant="outline" size="icon" className="h-8 w-8 hover:bg-red-50 hover:text-red-500 transition-colors">
            <Trash2 className="h-4 w-4 text-slate-500" />
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar este local?</AlertDialogTitle>
          <AlertDialogDescription>
            Estás a punto de borrar "{unit.name}". Esta acción es definitiva y 
            no se podrá deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Eliminando..." : "Eliminar Local"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
