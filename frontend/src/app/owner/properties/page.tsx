"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getAuthHeaders } from "@/lib/auth";
import { Plus, Building2, Edit, Trash2, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PropertiesViewer, SharedProperty } from "@/components/PropertiesViewer";

export default function OwnerPropertiesPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<SharedProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Registration Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    description: ""
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/properties`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setProperties(data);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        address: formData.address,
        description: formData.description,
        ownerId: user?.id
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/properties`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ name: "", address: "", description: "" });
        fetchProperties();
      } else {
        const error = await res.json();
        alert(error.message || "Error al registrar la propiedad");
      }
    } catch (error) {
      console.error("Error creating property:", error);
      alert("Error de conexión");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PropertiesViewer 
        title="Mis Edificios"
        subtitle={`Gestiona tus inmuebles (Límite de consumo: ${user?.maxProperties || 2})`}
        properties={properties}
        owners={[]}
        loading={isLoading}
        basePath="/owner/properties"
        onRefresh={fetchProperties}
        customHeaderAction={
          <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20">
            <Plus className="mr-2 h-4 w-4" />
            Registrar Edificio
          </Button>
        }
        renderCardActions={(property) => (
          <>
            {/* Implementación simplificada para dueño de momento */}
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" onClick={(e) => { e.preventDefault(); alert("Vista edición simplificada próximamente"); }}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={(e) => { e.preventDefault(); alert("Vista eliminación simplificada próximamente"); }}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      />

      {/* Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Añadir Nuevo Edificio</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateProperty}>
              <div className="p-5 space-y-4">
                
                <div className="bg-blue-50 text-blue-800 p-3 rounded-md flex items-center text-sm mb-2 border border-blue-100">
                  <Building2 className="h-5 w-5 mr-2 text-blue-500" />
                  Límite de Consumo: {properties.length} / {user?.maxProperties || 2}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Nombre del Edificio / Recinto</label>
                  <Input 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ej. Torre Zafiro" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Dirección</label>
                  <Input 
                    required 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Calle, Número, Colonia, C.P." 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Descripción (Opcional)</label>
                  <Input 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Ej. Edificio de 3 pisos con portón negro" 
                  />
                </div>
              </div>
              <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar Edificio"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
