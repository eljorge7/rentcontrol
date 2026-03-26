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
import { List, CheckCircle2 } from "lucide-react";

interface Commission {
  id: string;
  amount: number;
  description: string;
  createdAt: string;
}

interface ViewPayrollDetailsDialogProps {
  commissions: Commission[];
  managerName?: string;
  totalAmount: number;
  date: string;
}

export function ViewPayrollDetailsDialog({ commissions, managerName, totalAmount, date }: ViewPayrollDetailsDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-slate-200 bg-transparent shadow-sm hover:bg-slate-100 h-8 px-3">
        <List className="h-4 w-4 mr-2 text-slate-500" />
        Ver Detalles
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Desglose de Nómina
          </DialogTitle>
          <DialogDescription>
            {managerName && <span>Gestor: <strong>{managerName}</strong><br/></span>}
            Liquidada el {new Date(date).toLocaleString()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 bg-slate-50 rounded-lg p-4 max-h-[300px] overflow-y-auto border border-slate-100 space-y-3">
          {commissions && commissions.length > 0 ? (
            commissions.map((c, idx) => (
              <div key={c.id || idx} className="flex justify-between items-start bg-white p-3 rounded shadow-sm border border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-800 break-words">{c.description}</p>
                  <p className="text-xs text-slate-400 mt-1">{new Date(c.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right pl-4">
                  <p className="text-sm font-bold text-emerald-600">+${c.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  <p className="text-[10px] text-emerald-500 flex items-center justify-end mt-1 font-bold uppercase"><CheckCircle2 className="h-3 w-3 mr-0.5"/> Pagado</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500 text-center py-4">No hay detalles disponibles para este registro histórico.</p>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
          <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Total Depositado</span>
          <span className="text-xl font-bold text-slate-900">${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
