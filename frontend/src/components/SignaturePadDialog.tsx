"use client";

import { useRef } from "react";
import SignatureCanvas from 'react-signature-canvas';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SignaturePadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (base64Signature: string) => void;
  title: string;
}

export function SignaturePadDialog({ isOpen, onClose, onSave, title }: SignaturePadDialogProps) {
  const sigCanvas = useRef<any>(null);

  const clear = () => {
    sigCanvas.current?.clear();
  };

  const save = () => {
    if (sigCanvas.current?.isEmpty()) {
      alert("Por favor, dibuje una firma antes de guardar.");
      return;
    }
    const dataURL = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
    onSave(dataURL);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Utilice su dedo o el cursor para dibujar la firma gráfica dentro del recuadro. Esta firma se incrustará automáticamente en la hoja legal del Contrato.
          </DialogDescription>
        </DialogHeader>
        
        <div className="border-2 border-slate-300 rounded-xl overflow-hidden bg-[#fafafa] cursor-crosshair touch-none my-4">
          <SignatureCanvas 
            ref={sigCanvas} 
            penColor="#0f172a" 
            canvasProps={{ width: 500, height: 260, className: 'sigCanvas max-w-full' }} 
          />
        </div>

        <DialogFooter className="flex justify-between sm:justify-between w-full">
          <Button variant="outline" onClick={clear} className="text-slate-600">
            Limpiar Lienzo
          </Button>
          <div className="flex space-x-2">
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button onClick={save} className="bg-indigo-600 hover:bg-indigo-700 text-white">Aplicar Firma</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
