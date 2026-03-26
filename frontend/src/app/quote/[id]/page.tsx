"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, ShieldCheck, CreditCard, Building, ArrowRight, Loader2 } from "lucide-react";
import api from "@/lib/api";

interface PublicQuote {
  id: string;
  prospectName: string;
  prospectEmail: string;
  propertyCount: number;
  totalAmount: number;
  status: string;
  manager: {
    name: string;
    email: string;
  };
  managementPlan: {
    name: string;
    description: string;
    commission: number;
  };
  createdAt: string;
}

export default function QuotePage() {
  const params = useParams();
  const router = useRouter();
  const quoteId = params.id as string;

  const [quote, setQuote] = useState<PublicQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (quoteId) {
      fetchQuote();
    }
  }, [quoteId]);

  const fetchQuote = async () => {
    try {
      const res = await api.get(`/quotations/${quoteId}/public`);
      setQuote(res.data);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!acceptedTerms) return;
    try {
      setIsSubmitting(true);
      await api.post(`/quotations/${quoteId}/accept`);
      setSuccess(true);
      // Wait a few seconds to let them read success, then redirect to login
      setTimeout(() => {
        router.push('/login');
      }, 5000);
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error al procesar tu solicitud. Por favor contacta a tu gestor.");
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full text-center">
          <ShieldCheck className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Propuesta no encontrada</h2>
          <p className="text-slate-500 mb-6">El enlace es inválido o la propuesta ha expirado. Por favor contacta a tu gestor comercial.</p>
        </div>
      </div>
    );
  }

  if (quote.status === "ACCEPTED" || success) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 to-emerald-400" />
          <div className="h-20 w-20 bg-emerald-100 rounded-full flex flex-col items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">¡Bienvenido a RentControl!</h1>
          <p className="text-slate-600 text-lg mb-8 leading-relaxed">
            Tu propuesta ha sido aceptada exitosamente. Se ha creado tu cuenta de propietario usando el correo <span className="font-semibold text-slate-800">{quote.prospectEmail || 'proporcionado'}</span>. 
            Revisa tu bandeja de entrada para configurar tu contraseña.
          </p>
          <Button 
            onClick={() => router.push('/login')} 
            className="w-full h-14 text-lg bg-slate-900 hover:bg-slate-800 shadow-lg rounded-xl transition-all"
          >
            Ir al Portal de Acceso
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-100 selection:text-blue-900">
      {/* Header Premium */}
      <header className="bg-white border-b border-slate-200/60 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <img src="/logo-transparent.png" alt="RadioTec Pro" className="h-[40px] drop-shadow-sm" />
          <div className="text-right">
            <p className="text-sm font-medium text-slate-500">Propuesta Privada para</p>
            <p className="font-bold text-slate-900">{quote.prospectName}</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 grid md:grid-cols-12 gap-12">
        {/* Columna Izquierda - Detalles del Plan */}
        <div className="md:col-span-7 space-y-8">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
              Propuesta de Gestión en <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">RentControl</span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              Hola <span className="font-semibold text-slate-800">{quote.prospectName}</span>, tu gestor <span className="font-semibold text-slate-800">{quote.manager.name}</span> ha preparado la siguiente propuesta estratégica para la administración digital de tus inmuebles.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-8">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6 mb-6">
              <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <Building className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{quote.managementPlan.name}</h3>
                <p className="text-slate-500">{quote.managementPlan.description || "Gestión y administración tecnológica integral."}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-slate-50 rounded-xl p-5">
                <p className="text-sm text-slate-500 mb-1 font-medium">Volumen Cubierto</p>
                <p className="text-2xl font-bold text-slate-800">{quote.propertyCount} <span className="text-base font-normal text-slate-500">Propiedades</span></p>
              </div>
              <div className="bg-slate-50 rounded-xl p-5">
                <p className="text-sm text-slate-500 mb-1 font-medium">Comisión por Cobro</p>
                <p className="text-2xl font-bold text-emerald-600">{quote.managementPlan.commission}% <span className="text-base font-normal text-slate-500">del pago</span></p>
              </div>
            </div>
          </div>
          
          <div className="prose prose-slate max-w-none">
            <h3>¿Qué incluye esta propuesta?</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-blue-500" />
                <span>Portal web dedicado para ti y tus inquilinos.</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-blue-500" />
                <span>Facturación CFDI y cobranza automatizada.</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-blue-500" />
                <span>Soporte técnico y gestión de incidentes centralizado.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Columna Derecha - Resumen y Checkout */}
        <div className="md:col-span-5">
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden sticky top-28">
            <div className="bg-slate-900 p-8 text-white">
              <h2 className="font-semibold text-slate-300 mb-1 uppercase tracking-wider text-sm">Inversión Inicial</h2>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-extrabold tracking-tight">${quote.totalAmount.toLocaleString('es-MX')}</span>
                <span className="text-slate-400 font-medium mb-1">MXN</span>
              </div>
              <p className="text-sm text-slate-400 mt-4 flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> 
                Pago seguro gestionado por RentControl
              </p>
            </div>
            
            <div className="p-8 pb-10">
              <div className="flex items-start gap-3 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <Checkbox 
                  id="terms" 
                  checked={acceptedTerms} 
                  onCheckedChange={(c) => setAcceptedTerms(c as boolean)} 
                  className="mt-1 flex-shrink-0"
                />
                <label 
                  htmlFor="terms" 
                  className="text-sm text-slate-600 leading-relaxed cursor-pointer"
                >
                  He leído la propuesta comercial y estoy de acuerdo con los Términos de Servicio y el Aviso de Privacidad. Autorizo la creación de mi cuenta.
                </label>
              </div>

              <Button 
                onClick={handleAccept} 
                className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 rounded-xl transition-all font-semibold"
                disabled={!acceptedTerms || isSubmitting}
              >
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Procesando Alta...</>
                ) : (
                  <>Aceptar y Continuar <ArrowRight className="ml-2 h-5 w-5" /></>
                )}
              </Button>
              <p className="text-center text-xs text-slate-400 mt-4">
                Emitida el {new Date(quote.createdAt).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
