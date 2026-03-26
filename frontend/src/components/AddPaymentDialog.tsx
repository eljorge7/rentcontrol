"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DollarSign } from "lucide-react";

const paymentSchema = z.object({
  amount: z.coerce.number().min(0.01, "El monto debe ser mayor a 0"),
  method: z.string().min(1, "Selecciona un método de pago"),
  invoiceRequested: z.boolean().default(false),
  date: z.string().min(1, "La fecha de pago es requerida"),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface AddPaymentDialogProps {
  charge: {
    id: string;
    amount: number;
    description: string;
    lease: {
      tenant: { name: string }
    };
    payments?: { amount: number }[];
  };
  onPaymentAdded: () => void;
}

export function AddPaymentDialog({ charge, onPaymentAdded }: AddPaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const paidAmount = charge.payments?.reduce((acc, p) => acc + p.amount, 0) || 0;
  const remainingAmount = charge.amount - paidAmount;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: remainingAmount, // Por defecto cobrar el saldo pendiente
      method: "CASH",
      invoiceRequested: false, // Opcional, aquí podría venir del Tenant si está configurado
      date: new Date().toISOString().split("T")[0],
    },
  });

  async function onSubmit(data: any) {
    try {
      setLoading(true);
      const paymentResponse = await api.post('/payments', {
        chargeId: charge.id,
        amount: data.amount,
        method: data.method,
        date: data.date,
      });

      if (data.invoiceRequested) {
        await api.post('/invoices', { paymentId: paymentResponse.data.id });
      }

      setOpen(false);
      reset();
      onPaymentAdded();
    } catch (error) {
      console.error("Error registering payment:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (val) {
        reset({
          amount: remainingAmount,
          method: "CASH",
          invoiceRequested: false,
          date: new Date().toISOString().split("T")[0],
        });
      }
    }}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <DollarSign className="h-4 w-4 mr-2" />
            Cobrar
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar Pago</DialogTitle>
          <DialogDescription>
            Registra el pago para el cargo: <strong>{charge.description}</strong> a nombre de <strong>{charge.lease?.tenant?.name}</strong>.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          <div className="space-y-2 flex flex-col pt-4">
            <Label htmlFor="date">Fecha de Pago</Label>
            <Input id="date" type="date" {...register("date")} />
            {errors.date && <p className="text-sm text-red-500">{errors.date.message as string}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="amount">Monto a Pagar (MXN)</Label>
              <Input id="amount" type="number" step="0.01" {...register("amount")} />
              <p className="text-xs text-slate-500">Saldo pendiente: ${remainingAmount.toLocaleString()}</p>
              {errors.amount && <p className="text-sm text-red-500">{errors.amount.message as string}</p>}
            </div>
            
            <div className="space-y-2 flex flex-col">
              <Label>Método de Pago</Label>
              <Select defaultValue="CASH" onValueChange={(val) => setValue("method", val as string)}>
                <SelectTrigger>
                  <SelectValue placeholder="Método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Efectivo</SelectItem>
                  <SelectItem value="SPEI">Transferencia (SPEI)</SelectItem>
                  <SelectItem value="STRIPE">Tarjeta (Stripe)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2 pb-2">
            <input 
              type="checkbox" 
              id="invoiceRequested" 
              {...register("invoiceRequested")} 
              className="h-4 w-4 rounded border-gray-300 accent-slate-900" 
            />
            <Label htmlFor="invoiceRequested" className="cursor-pointer">Generar Factura Electrónica (CFDI)</Label>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Registrando..." : "Registrar Pago"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
