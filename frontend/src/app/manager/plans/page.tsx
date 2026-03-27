"use client";

import { useEffect, useState } from "react";
import { getAuthHeaders } from "@/lib/auth";
import { Layers, Percent, DollarSign, FileText, X, Printer, Loader2, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ManagementPlan {
  id: string;
  name: string;
  description: string;
  commission: number | null;
  fixedFee: number | null;
  maxProperties: number;
}

interface NetworkProfile {
  id: string;
  name: string;
  bandwidth: string;
  price: number;
}

export default function ManagerPlansPage() {
  const [plans, setPlans] = useState<ManagementPlan[]>([]);
  const [profiles, setProfiles] = useState<NetworkProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Quotation Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<ManagementPlan | null>(null);
  const [prospectName, setProspectName] = useState("");
  const [selectedProfileId, setSelectedProfileId] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [plansRes, profilesRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/management-plans`, { headers: getAuthHeaders() }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/network-profiles`, { headers: getAuthHeaders() }),
      ]);
      
      if (plansRes.ok) {
        const pData = await plansRes.json();
        setPlans(pData);
      }
      if (profilesRes.ok) {
        const netData = await profilesRes.json();
        setProfiles(netData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenQuotation = (plan: ManagementPlan) => {
    setSelectedPlan(plan);
    setProspectName("");
    setSelectedProfileId("");
    setIsModalOpen(true);
  };

  const selectedProfile = profiles.find(p => p.id === selectedProfileId);
  const totalMonthlyCost = (selectedPlan?.fixedFee || 0) + (selectedProfile?.price || 0);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Catálogo SaaS y Servicios</h1>
        <p className="text-slate-500 mt-1">Cotiza los planes de gestión e internet para prospectos y clientes.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md">
              <div className="p-5 flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      <Layers className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{plan.name}</h3>
                      <p className="text-xs text-slate-500 line-clamp-1">{plan.description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
                      <Percent className="h-4 w-4 text-emerald-500" /> Comisión Cobranza
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {plan.commission ? `${plan.commission}%` : "No aplica"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-indigo-500" /> Cuota Base SaaS
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {plan.fixedFee !== null ? `$${Number(plan.fixedFee).toLocaleString()} MXN` : "No aplica"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>Límite de Propiedades Soportadas</span>
                    <span className="font-semibold px-2 py-0.5 bg-slate-200 rounded text-slate-700">{plan.maxProperties}</span>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-slate-100 p-4">
                <Button 
                  onClick={() => handleOpenQuotation(plan)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                >
                  <FileText className="h-4 w-4 mr-2" /> Generar Cotización
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quotation Dialog */}
      {isModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" /> Generador de Propuesta Comercial
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Client Info */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700">Nombre del Prospecto / Propietario</label>
                <Input 
                  value={prospectName}
                  onChange={(e) => setProspectName(e.target.value)}
                  placeholder="Ej. Inmobiliaria del Valle S.A." 
                  className="bg-slate-50"
                />
              </div>

              {/* Add-ons */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-indigo-500" />
                  Agregar Servicio de Internet (Para Residentes)
                </label>
                <select 
                  className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedProfileId}
                  onChange={(e) => setSelectedProfileId(e.target.value)}
                >
                  <option value="">-- No incluir paquete de internet en cotización --</option>
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.bandwidth}) - ${p.price} mensuales</option>
                  ))}
                </select>
              </div>

              {/* Preview */}
              <div className="border border-slate-200 rounded-xl overflow-hidden mt-6 print-container" id="quotation-print-area">
                <div className="bg-slate-900 p-6 text-white text-center">
                  <h2 className="text-2xl font-bold">Propuesta de Servicios RentControl</h2>
                  <p className="text-slate-400 mt-1">Para: {prospectName || "_______________________"}</p>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <h4 className="text-sm uppercase tracking-wider text-slate-500 font-semibold mb-3 border-b pb-2">Plan de Gestión Tecnológica</h4>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-900">{selectedPlan.name}</span>
                      <span className="font-bold">${selectedPlan.fixedFee?.toLocaleString() || 0} MXN / mes</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">{selectedPlan.description}</p>
                    <div className="text-sm text-slate-600 flex justify-between">
                      <span>Comisión por Cobranza Exitosa:</span>
                      <span className="font-medium text-emerald-600">{selectedPlan.commission}%</span>
                    </div>
                    <div className="text-sm text-slate-600 flex justify-between mt-1">
                      <span>Límite de Inmuebles a Administrar:</span>
                      <span className="font-medium">{selectedPlan.maxProperties} Propiedades</span>
                    </div>
                  </div>

                  {selectedProfile && (
                    <div>
                      <h4 className="text-sm uppercase tracking-wider text-slate-500 font-semibold mb-3 border-b pb-2">Amenidades de Red (Internet)</h4>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900">Paquete Base {selectedProfile.name}</span>
                        <span className="font-bold">${selectedProfile.price.toLocaleString()} MXN / mes</span>
                      </div>
                      <p className="text-xs text-slate-500">{selectedProfile.bandwidth} - Servicio provisionado mediante fibra o enlace dedicado.</p>
                      <p className="text-xs text-indigo-600 italic mt-1">Este cargo es opcional y puede transferirse directamente a la renta del inquilino final.</p>
                    </div>
                  )}

                  <div className="border-t-2 border-slate-900 pt-4 mt-6">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-slate-900">Inversión Fija Estimada</span>
                      <span className="text-2xl font-bold text-blue-600">${totalMonthlyCost.toLocaleString()} MXN <span className="text-sm text-slate-500 font-normal">/ mensual</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cerrar</Button>
              <Button 
                onClick={() => {
                  const printContent = document.getElementById("quotation-print-area");
                  if (printContent) {
                    const originalContents = document.body.innerHTML;
                    document.body.innerHTML = printContent.innerHTML;
                    window.print();
                    document.body.innerHTML = originalContents;
                    window.location.reload();
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white min-w-[150px]"
                disabled={!prospectName}
              >
                <Printer className="h-4 w-4 mr-2" /> Imprimir B2B
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
