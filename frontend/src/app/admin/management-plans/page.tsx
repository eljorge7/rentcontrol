"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getAuthHeaders } from "@/lib/auth";
import { Plus, Edit, Trash2, ShieldAlert, X, Loader2, Layers, DollarSign, Percent, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ManagementPlan {
  id: string;
  name: string;
  description: string;
  commission: number | null;
  fixedFee: number | null;
  maxProperties: number;
  createdAt: string;
}

export default function AdminManagementPlansPage() {
  const [plans, setPlans] = useState<ManagementPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Registration Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    commission: "",
    fixedFee: "",
    maxProperties: 5,
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/management-plans`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setPlans(data);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        commission: formData.commission ? Number(formData.commission) : 0,
        fixedFee: formData.fixedFee ? Number(formData.fixedFee) : 0,
        maxProperties: Number(formData.maxProperties),
      };

      const isEditing = !!formData.id;
      const url = isEditing ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/management-plans/${formData.id}` : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/management-plans`;
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ id: "", name: "", description: "", commission: "", fixedFee: "", maxProperties: 5 });
        fetchPlans();
      } else {
        const error = await res.json();
        alert(error.message || "Error al guardar el plan");
      }
    } catch (error) {
      console.error("Error saving plan:", error);
      alert("Error de conexión");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este plan?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/management-plans/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      if (res.ok) {
        fetchPlans();
      } else {
        alert("No se pudo eliminar el plan. Tal vez tenga dueños asignados.");
      }
    } catch (error) {
      console.error("Error deleting plan:", error);
    }
  };

  const filteredPlans = plans.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Planes de Gestión</h1>
          <p className="text-slate-500 mt-1">Configura las comisiones y tarifas a cobrar por los gestores.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar plan..."
              className="pl-9 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 whitespace-nowrap">
            <Plus className="mr-2 h-4 w-4" />
            Crear Plan
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : plans.length > 0 ? (
        <>
          {filteredPlans.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPlans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md">
              <div className="p-5 flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      <Layers className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{plan.name}</h3>
                      <p className="text-xs text-slate-500 line-clamp-1">{plan.description}</p>
                    </div>
                  </div>
                  <div className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-semibold">
                    Max: {plan.maxProperties} Propiedades
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
                      <Percent className="h-4 w-4 text-emerald-500" />
                      Comisión
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {plan.commission ? `${plan.commission}%` : "No aplica"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-indigo-500" />
                      Cuota Fija
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {plan.fixedFee !== null ? `$${Number(plan.fixedFee).toFixed(2)}` : "No aplica"}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-slate-100 bg-slate-50 p-3 flex justify-end gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 text-slate-500 hover:text-blue-600"
                  onClick={() => {
                    setFormData({
                      id: plan.id,
                      name: plan.name,
                      description: plan.description || "",
                      commission: plan.commission?.toString() || "",
                      fixedFee: plan.fixedFee?.toString() || "",
                      maxProperties: plan.maxProperties || 5,
                    });
                    setIsModalOpen(true);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                  onClick={() => handleDelete(plan.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <Search className="mx-auto h-8 w-8 text-slate-300 mb-3" />
              <h3 className="text-base font-medium text-slate-900">No se encontraron resultados</h3>
              <p className="text-sm text-slate-500 mt-1">No hay planes que coincidan con tu búsqueda.</p>
              <Button variant="ghost" onClick={() => setSearchTerm("")} className="mt-4 text-blue-600">Limpiar búsqueda</Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
          <ShieldAlert className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium tracking-tight text-slate-900">No hay planes registrados</h3>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto">Comienza agregando modelos de plan para comisionar a tus gestores.</p>
          <Button onClick={() => setIsModalOpen(true)} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Crear Primer Plan
          </Button>
        </div>
      )}

      {/* Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">{formData.id ? "Editar Plan" : "Crear Nuevo Plan"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleRegisterPlan}>
              <div className="p-5 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Nombre del Plan</label>
                  <Input 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ej. Plan Básico 10%" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Descripción</label>
                  <Input 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe los beneficios o servicios incluidos" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Comisión (%)</label>
                    <Input 
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.commission}
                      onChange={(e) => setFormData({...formData, commission: e.target.value})}
                      placeholder="Ej. 10" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Cuota Fija ($)</label>
                    <Input 
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.fixedFee}
                      onChange={(e) => setFormData({...formData, fixedFee: e.target.value})}
                      placeholder="Ej. 500" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">LímITE de Propiedades</label>
                  <Input 
                    type="number"
                    min="1"
                    required
                    value={formData.maxProperties}
                    onChange={(e) => setFormData({...formData, maxProperties: Number(e.target.value)})}
                    placeholder="Ej. 5" 
                  />
                  <p className="text-xs text-slate-500">Cuántos edificios puede manejar un Propietario bajo este plan.</p>
                </div>
              </div>
              <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar Plan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
