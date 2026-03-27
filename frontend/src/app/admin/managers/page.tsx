"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getAuthHeaders } from "@/lib/auth";
import { Plus, UserCircle, Edit, Trash2, ShieldAlert, X, Loader2, Briefcase, Layers, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Manager {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  managementPlanId: string | null;
  createdAt: string;
}

interface ManagementPlan {
  id: string;
  name: string;
  commission: number | null;
  fixedFee: number | null;
}

export default function AdminManagersPage() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [plans, setPlans] = useState<ManagementPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Registration Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [managersRes, plansRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/users/managers`, { headers: getAuthHeaders() }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/management-plans`, { headers: getAuthHeaders() })
      ]);

      if (managersRes.ok) setManagers(await managersRes.json());
      if (plansRes.ok) setPlans(await plansRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterManager = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        password: formData.password || undefined,
        role: "MANAGER",
      };

      const isEditing = !!formData.id;
      const url = isEditing ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/users/${formData.id}` : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/users`;
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
        setFormData({ id: "", name: "", email: "", phone: "", password: "" });
        fetchData();
      } else {
        const error = await res.json();
        alert(error.message || "Error al registrar el Gestor");
      }
    } catch (error) {
      console.error("Error creating manager:", error);
      alert("Error de conexión al servidor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este gestor?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/users/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      if (res.ok) {
        fetchData();
      } else {
        alert("No se pudo eliminar el Gestor. Asegúrate de reasignar sus propiedades antes.");
      }
    } catch (error) {
      console.error("Error deleting manager:", error);
    }
  };

  const getPlanName = (planId: string | null) => {
    if (!planId) return "Sin plan asignado";
    const plan = plans.find(p => p.id === planId);
    return plan ? plan.name : "Plan Desconocido";
  };

  const filteredManagers = managers.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Gestores de Agencia</h1>
          <p className="text-slate-500 mt-1">Registra y administra los perfiles de tu equipo de cobranza y gestión.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar gestor..."
              className="pl-9 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => { setFormData({ id: "", name: "", email: "", phone: "", password: "" }); setIsModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 whitespace-nowrap">
            <Plus className="mr-2 h-4 w-4" />
            Registrar Gestor
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : managers.length > 0 ? (
        <>
          {filteredManagers.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredManagers.map((manager) => (
            <div key={manager.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md">
              <div className="p-5 flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      <Briefcase className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 line-clamp-1">{manager.name}</h3>
                      <p className="text-xs text-slate-500">{manager.email}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${manager.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {manager.isActive ? "Activo" : "Inactivo"}
                  </span>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                    <span className="flex items-center gap-2">
                       Cartera Variable
                    </span>
                    <span className="text-xs">Los planes se gestionan por cliente</span>
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
                      id: manager.id,
                      name: manager.name,
                      email: manager.email,
                      phone: manager.phone || "",
                      password: "", // intentionally empty for safety
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
                  onClick={() => handleDelete(manager.id)}
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
              <p className="text-sm text-slate-500 mt-1">No hay gestores que coincidan con tu búsqueda.</p>
              <Button variant="ghost" onClick={() => setSearchTerm("")} className="mt-4 text-blue-600">Limpiar búsqueda</Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
          <ShieldAlert className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium tracking-tight text-slate-900">No tienes Gestores</h3>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto">Comienza agregando gestores para que puedan operar en lugar del dueño del edificio.</p>
          <Button onClick={() => setIsModalOpen(true)} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Registrar tu primer Gestor
          </Button>
        </div>
      )}

      {/* Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">{formData.id ? "Editar Gestor" : "Registrar Gestor"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleRegisterManager}>
              <div className="p-5 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Nombre Completo</label>
                  <Input 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ej. María Sánchez" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Correo Electrónico (Acceso)</label>
                  <Input 
                    required 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="gestor@agencia.com" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Celular (WhatsApp)</label>
                  <Input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="521..." 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Contraseña (Opcional si editas)</label>
                  <Input 
                    type="password" 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Déjalo en blanco para autogenerar" 
                    required={!formData.id}
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 italic mt-4">
                    Nota: Los planes de comisiones ahora se asignan directamente a cada Propietario (Cliente), permitiendo que un mismo Gestor maneje diferentes porcentajes.
                  </p>
                </div>
              </div>
              <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar Gestor"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
