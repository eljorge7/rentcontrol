"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

interface LeaseDetail {
  id: string;
  startDate: string;
  endDate: string | null;
  rentAmount: number;
  paymentDay: number;
  status: string;
  unit: {
    name: string;
    property: {
      name: string;
      address: string;
      owner?: {
        name: string;
      }
    }
  };
  tenant: {
    name: string;
    email: string;
    phone: string | null;
  };
}

export default function PrintLeaseContractPage() {
  const { id } = useParams() as { id: string };
  const [lease, setLease] = useState<LeaseDetail | null>(null);

  useEffect(() => {
    const fetchLease = async () => {
      try {
        const response = await api.get(`/leases/${id}`);
        setLease(response.data);
      } catch (error) {
        console.error("Error fetching lease for print:", error);
      }
    };
    fetchLease();
  }, [id]);

  if (!lease) {
    return <div className="p-10 font-sans text-center print:hidden">Cargando contrato...</div>;
  }

  const startDateText = new Date(lease.startDate).toLocaleDateString('es-MX', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  });
  
  const endDateText = lease.endDate ? new Date(lease.endDate).toLocaleDateString('es-MX', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  }) : 'tiempo indefinido';

  return (
    <div className="bg-slate-100 min-h-screen py-8 print:bg-white print:py-0 font-serif text-slate-900">
      
      {/* Botonera Flotante (Oculta al imprimir) */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden px-4">
        <Link href={`/owner/leases/${id}`} className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Contrato
        </Link>
        <button 
          onClick={() => window.print()}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-10 px-4"
        >
          <Printer className="mr-2 h-4 w-4" />
          Imprimir / Guardar PDF
        </button>
      </div>

      {/* Documento A4 */}
      <div className="max-w-[210mm] mx-auto bg-white shadow-lg print:shadow-none print:w-full print:max-w-none px-12 py-16 text-justify leading-relaxed text-sm">
        
        {/* Cabecera */}
        <div className="text-center mb-10 pb-6 border-b-2 border-slate-900">
          <h1 className="text-xl font-bold uppercase tracking-widest mb-2">CONTRATO DE ARRENDAMIENTO</h1>
          <p className="text-slate-500 font-sans text-xs uppercase">Documento Privado No. {lease.id.split('-')[0].toUpperCase()}</p>
        </div>

        {/* Proemio */}
        <p className="mb-6 space-y-2 indent-8">
          Contrato de arrendamiento que celebran por una parte <strong>{lease.unit.property.owner?.name || "EL ARRENDADOR"}</strong>, a quien en lo sucesivo se le denominará como <strong>"EL ARRENDADOR"</strong>; y por la otra parte <strong>{lease.tenant.name}</strong>, a quien en lo sucesivo se le denominará como <strong>"EL ARRENDATARIO"</strong>, quienes se sujetan al tenor de las siguientes Declaraciones y Cláusulas.
        </p>

        <h2 className="font-bold text-center mt-8 mb-4">DECLARACIONES</h2>
        
        <p className="mb-4"><strong>I. DEL ARRENDADOR:</strong></p>
        <ol className="list-decimal pl-10 mb-6 space-y-2">
          <li>Que es legal propietario y tiene las facultades suficientes para dar en arrendamiento el inmueble ubicado en: <strong>{lease.unit.property.address}</strong> (en adelante el "Inmueble"), el cual cuenta con el local/departamento o espacio identificado como <strong>{lease.unit.name}</strong>, mismo que será materia del presente contrato.</li>
          <li>Que el Inmueble se encuentra en condiciones óptimas de higiene, seguridad y salubridad para ser habitado y/o utilizado, no teniendo el ARRENDATARIO objeción alguna en recibiri el inmueble en el estado en el que se encuentra.</li>
        </ol>

        <p className="mb-4"><strong>II. DEL ARRENDATARIO:</strong></p>
        <ol className="list-decimal pl-10 mb-8 space-y-2">
          <li>Tener plena capacidad legal y económica para sujetarse en los términos del presente contrato.</li>
          <li>Señala como vía de comunicación electrónica el correo <strong>{lease.tenant.email}</strong> y teléfono <strong>{lease.tenant.phone || 'N/A'}</strong>.</li>
          <li>Que es su libre voluntad tomar en arrendamiento el inmueble descrito en la primera declaración del presente acuerdo.</li>
        </ol>

        <h2 className="font-bold text-center mt-10 mb-4">CLÁUSULAS</h2>

        <p className="mb-4"><strong>PRIMERA. (OBJETO): </strong> EL ARRENDADOR otorga en arrendamiento y EL ARRENDATARIO recibe conforme a derecho y satisfacción, el uso o goce temporal del inmueble ubicado y descrito en las Declaraciones.</p>
        
        <p className="mb-4">
          <strong>SEGUNDA. (RENTA): </strong> EL ARRENDATARIO pagará a EL ARRENDADOR por concepto de renta mensual la cantidad de 
          <strong> ${lease.rentAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN </strong> (Pesos Mexicanos). 
          La renta deberá cubrirse en su totalidad los días <strong>{lease.paymentDay}</strong> de cada mes. 
          El retraso en el pago generará recargos según lo acuerden las partes o administre el Gestor.
        </p>

        <p className="mb-4"><strong>TERCERA. (VIGENCIA): </strong> La duración del presente contrato será a partir del <strong>{startDateText}</strong> y terminará el <strong>{endDateText}</strong>. En caso de no existir una fecha de término estipulada, el contrato se considerará por tiempo indefinido sujeto a aviso de terminación con previo mes de anticipación.</p>

        <p className="mb-4"><strong>CUARTA. (SERVICIOS Y MANTENIMIENTO): </strong> EL ARRENDATARIO se obliga a pagar puntualmente los servicios de agua, electricidad, y cualquier otro servicio contratado con terceros o por medio de la misma administración (Ej. Internet Mikrotik) generados durante la vigencia de este contrato. Cualquier alteración al inmueble requerirá permiso por escrito del ARRENDADOR.</p>

        <p className="mb-4"><strong>QUINTA. (INCUMPLIMIENTO): </strong> El incumplimiento de cualquiera de las cláusulas por parte del ARRENDATARIO, especialmente la falta de pago de renta mensual por más de un periodo, dará derecho al ARRENDADOR a rescindir el contrato y exigir la desocupación inmediata del inmueble.</p>

        <div className="mt-16 text-center">
          <p>Leído que fue el presente contrato y enteradas las partes de su contenido y alcance legal, lo firman de conformidad.</p>
        </div>

        {/* Firmas */}
        <div className="mt-24 w-full grid grid-cols-2 gap-16 px-8">
          <div className="text-center flex flex-col items-center">
            <div className="w-48 h-px bg-slate-900 mb-2"></div>
            <p className="font-bold text-sm uppercase">EL ARRENDADOR</p>
            <p className="text-xs text-slate-500 mt-1">{lease.unit.property.owner?.name || "Representante Legal"}</p>
          </div>
          <div className="text-center flex flex-col items-center">
            <div className="w-48 h-px bg-slate-900 mb-2"></div>
            <p className="font-bold text-sm uppercase">EL ARRENDATARIO</p>
            <p className="text-xs text-slate-500 mt-1">{lease.tenant.name}</p>
          </div>
        </div>

        {/* Footer Numeración */}
        <div className="mt-16 text-center text-xs text-slate-400 print:fixed print:bottom-10 print:w-full font-sans uppercase">
           Generado automáticamente por RentControl Platform
        </div>

      </div>
    </div>
  );
}
