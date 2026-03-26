"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

export default function PaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirige al inicio despus de 5 segundos
    const timer = setTimeout(() => {
      router.push("/tenant/billing");
    }, 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="bg-emerald-100 p-4 rounded-full mb-6 relative">
        <CheckCircle className="h-16 w-16 text-emerald-600" />
      </div>
      <h1 className="text-3xl font-black text-slate-900 mb-2">¡Pago Exitoso!</h1>
      <p className="text-slate-600 max-w-md">
        Tu pago ha sido procesado correctamente. En breve se reflejar en tu estado de cuenta.
      </p>
      <button 
        onClick={() => router.push("/tenant/billing")}
        className="mt-8 px-6 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition"
      >
        Volver a mis pagos
      </button>
    </div>
  );
}
