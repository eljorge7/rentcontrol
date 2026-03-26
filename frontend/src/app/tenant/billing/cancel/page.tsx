"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";

export default function PaymentCancelPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/tenant/billing");
    }, 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="bg-red-100 p-4 rounded-full mb-6">
        <XCircle className="h-16 w-16 text-red-600" />
      </div>
      <h1 className="text-3xl font-black text-slate-900 mb-2">Pago Cancelado</h1>
      <p className="text-slate-600 max-w-md">
        El proceso de pago fue cancelado o la tarjeta fue rechazada. No se ha realizado ningn cargo.
      </p>
      <button 
        onClick={() => router.push("/tenant/billing")}
        className="mt-8 px-6 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition"
      >
        Intentar de nuevo
      </button>
    </div>
  );
}
