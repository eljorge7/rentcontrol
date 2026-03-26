"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getAuthHeaders, getToken } from "@/lib/auth";
import { Plus, Building2, UserCircle, Edit, Trash2, ShieldAlert, X, Loader2, Upload, FileText, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Owner {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  maxProperties: number;
  planType: string;
  managerId?: string | null;
  managementPlanId?: string | null;
  createdAt: string;
}

export default function AdminOwnersPage() {
  const { user } = useAuth();
  const [owners, setOwners] = useState<Owner[]>([]);
  const [managers, setManagers] = useState<{id: string, name: string}[]>([]);
  const [plans, setPlans] = useState<{id: string, name: string, maxProperties?: number}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Registration Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Basic & Legal Info
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    password: "",
    maxProperties: 2,
    planType: "SAAS",
    managerId: "",
    managementPlanId: "",
    legalName: "",
    rfc: "",
    taxRegime: "",
    bankName: "",
    bankAccount: "",
    bankClabe: "",
  });

  // Files
  const [files, setFiles] = useState<{
    ine: File | null;
    rfcDocument: File | null;
    addressProof: File | null;
    propertyDeed: File | null;
    bankStatement: File | null;
  }>({
    ine: null,
    rfcDocument: null,
    addressProof: null,
    propertyDeed: null,
    bankStatement: null,
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [ownersRes, managersRes, plansRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}"}/users/owners`, { headers: getAuthHeaders() }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}"}/users/managers`, { headers: getAuthHeaders() }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}"}/management-plans`, { headers: getAuthHeaders() })
      ]);
      
      if (ownersRes.ok) setOwners(await ownersRes.json());
      if (managersRes.ok) setManagers(await managersRes.json());
      if (plansRes.ok) setPlans(await plansRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const isEditing = !!formData.id;

      if (isEditing) {
        // Simple JSON update for editing basic fields (KYC edit not supported yet)
        const payload = {
          name: formData.name,
          email: formData.email,
          ...(formData.password && { password: formData.password }),
          planType: formData.planType,
          maxProperties: Number(formData.maxProperties),
          managerId: formData.managerId || null,
          managementPlanId: formData.managementPlanId || null
        };
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/users/${formData.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          setIsModalOpen(false);
          resetForm();
          fetchData();
        } else {
          const error = await res.json();
          alert(error.message || "Error al actualizar el propietario");
        }
      } else {
        // Create new Owner with KYC docs (Multipart FormData)
        const formPayload = new FormData();
        formPayload.append("name", formData.name);
        formPayload.append("email", formData.email);
        if (formData.password) formPayload.append("password", formData.password);
        formPayload.append("planType", formData.planType);
        formPayload.append("maxProperties", formData.maxProperties.toString());
        if (formData.managerId) formPayload.append("managerId", formData.managerId);
        if (formData.managementPlanId) formPayload.append("managementPlanId", formData.managementPlanId);
        
        // Legal Info
        if (formData.legalName) formPayload.append("legalName", formData.legalName);
        if (formData.rfc) formPayload.append("rfc", formData.rfc);
        if (formData.taxRegime) formPayload.append("taxRegime", formData.taxRegime);
        if (formData.bankName) formPayload.append("bankName", formData.bankName);
        if (formData.bankAccount) formPayload.append("bankAccount", formData.bankAccount);
        if (formData.bankClabe) formPayload.append("bankClabe", formData.bankClabe);

        // Files
        if (files.ine) formPayload.append("ine", files.ine);
        if (files.rfcDocument) formPayload.append("rfcDocument", files.rfcDocument);
        if (files.addressProof) formPayload.append("addressProof", files.addressProof);
        if (files.propertyDeed) formPayload.append("propertyDeed", files.propertyDeed);
        if (files.bankStatement) formPayload.append("bankStatement", files.bankStatement);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}"}/users/owner`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${getToken()}`
          },
          body: formPayload
        });

        if (res.ok) {
          setIsModalOpen(false);
          resetForm();
          fetchData();
        } else {
          const error = await res.json();
          alert(error.message || "Error al registrar propietario");
        }
      }
    } catch (error) {
      console.error("Error saving owner:", error);
      alert("Error de conexión");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id: "", name: "", email: "", password: "", maxProperties: 2, planType: "SAAS",
      managerId: user?.role === "MANAGER" ? user.id : "", 
      managementPlanId: "", legalName: "", rfc: "", taxRegime: "", bankName: "", bankAccount: "", bankClabe: ""
    });
    setFiles({ ine: null, rfcDocument: null, addressProof: null, propertyDeed: null, bankStatement: null });
  };

  const handleDeleteOwner = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente a ${name}? Toda su información será borrada.`)) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}"}`;
      const res = await fetch(`${apiUrl}/users/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      if (res.ok) {
        fetchData();
      } else {
        const error = await res.json();
        alert(error.message || "Error al eliminar propietario");
      }
    } catch (error) {
      console.error("Error deleting owner:", error);
      alert("Error de conexión al servidor");
    }
  };

  const filteredOwners = owners.filter(o => 
    o.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Propietarios (Owners)</h1>
          <p className="text-slate-500 mt-1">
            {user?.role === "MANAGER" ? "Da de alta y gestiona tu cartera de clientes." : "Gestiona a todos los dueños globalmente."}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar propietario..."
              className="pl-9 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => { resetForm(); setIsModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 whitespace-nowrap">
            <Plus className="mr-2 h-4 w-4" />
            Onboarding
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : owners.length > 0 ? (
        <>
          {filteredOwners.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredOwners.map((owner) => (
            <div key={owner.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md">
              <div className="p-5 flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      <UserCircle className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{owner.name}</h3>
                      <p className="text-xs text-slate-500">{owner.email}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${owner.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {owner.isActive ? "Activo" : "Inactivo"}
                  </span>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="text-sm font-medium text-slate-600 flex items-center gap-2">Gestor Asignado</span>
                    <span className="text-sm text-slate-900 border border-slate-200 bg-white rounded px-2 py-0.5">
                      {managers.find(m => m.id === owner.managerId)?.name || 'Ninguno'}
                    </span>
                  </div>
                  {owner.managerId && (
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="text-sm font-medium text-slate-600 flex items-center gap-2">Plan Comercial</span>
                      <span className="text-sm font-bold text-slate-900 bg-slate-100 rounded px-2 py-0.5">
                        {plans.find(p => p.id === owner.managementPlanId)?.name || 'Plan No Definido'}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="text-sm font-medium text-slate-600 flex items-center gap-2">Operativa</span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${owner.planType === 'SAAS' ? 'bg-indigo-100 text-indigo-700' : 'bg-purple-100 text-purple-700'}`}>
                      {owner.planType === 'SAAS' ? 'SaaS Autónomo' : 'Gestión Completa'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-500" />
                      Límite Propiedades
                    </span>
                    <span className="text-lg font-bold text-slate-900">
                      {owner.managementPlanId 
                        ? `${plans.find(p => p.id === owner.managementPlanId)?.maxProperties || owner.maxProperties}`
                        : owner.maxProperties || 2}
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
                      ...formData,
                      id: owner.id,
                      name: owner.name,
                      email: owner.email,
                      maxProperties: owner.maxProperties,
                      planType: owner.planType || "SAAS",
                      managerId: owner.managerId || "",
                      managementPlanId: owner.managementPlanId || "",
                    });
                    setFiles({ ine: null, rfcDocument: null, addressProof: null, propertyDeed: null, bankStatement: null });
                    setIsModalOpen(true);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Básico
                </Button>
                {user?.role === "ADMIN" && (
                  <Button variant="ghost" size="sm" className="h-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50" onClick={() => handleDeleteOwner(owner.id, owner.name)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                )}
              </div>
            </div>
          ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <Search className="mx-auto h-8 w-8 text-slate-300 mb-3" />
              <h3 className="text-base font-medium text-slate-900">No se encontraron resultados</h3>
              <p className="text-sm text-slate-500 mt-1">No hay propietarios que coincidan con tu búsqueda.</p>
              <Button variant="ghost" onClick={() => setSearchTerm("")} className="mt-4 text-blue-600">Limpiar búsqueda</Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
          <ShieldAlert className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium tracking-tight text-slate-900">No tienes propietarios registrados</h3>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto">Agrega a tus clientes (dueños) para comenzar a delegar propiedades a nombre de ellos.</p>
          <Button onClick={() => { resetForm(); setIsModalOpen(true); }} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Empezar Onboarding
          </Button>
        </div>
      )}

      {/* Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">{formData.id ? "Editar Perfil Básico del Propietario" : "Onboarding Completo de Propietario"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white rounded-full p-1 border border-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleRegisterOwner} className="max-h-[75vh] overflow-y-auto">
              {/* Contenedor Grid */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Columna Izquierda: Datos Básicos */}
                <div className="space-y-5">
                  <h4 className="font-semibold text-slate-900 border-b pb-2 flex items-center gap-2">
                    <UserCircle className="h-4 w-4 text-indigo-500" />
                    1. Credenciales y Acceso
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Nombre Completo de Contacto *</label>
                      <Input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Ej. Juan Pérez" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Correo Electrónico *</label>
                      <Input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="juan@gmail.com" className="mt-1" />
                    </div>
                    {!formData.id && (
                      <div>
                        <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Contraseña Inicial</label>
                        <Input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="Se auto-generará si se deja en blanco" className="mt-1" />
                      </div>
                    )}
                  </div>

                  <h4 className="font-semibold text-slate-900 border-b pb-2 mt-8 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-emerald-500" />
                    2. Plan de Negocios
                  </h4>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-slate-700 uppercase tracking-wide block mb-1">Modelo de Servicio Operativo</label>
                      <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-1 focus:ring-blue-600" value={formData.planType} onChange={(e) => setFormData({...formData, planType: e.target.value})}>
                        <option value="SAAS">SaaS Autónomo (Dueño Administra)</option>
                        <option value="FULL_MANAGEMENT">Gestión Completa (Nosotros Administramos)</option>
                      </select>
                    </div>

                    {user?.role === "ADMIN" && (
                      <div>
                        <label className="text-xs font-medium text-slate-700 uppercase tracking-wide block mb-1">Tu Gestor Asignado (Admin View)</label>
                        <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={formData.managerId} onChange={(e) => setFormData({...formData, managerId: e.target.value})}>
                          <option value="">-- Sin Gestor Asignado (Directo Mío) --</option>
                          {managers.map(manager => <option key={manager.id} value={manager.id}>{manager.name}</option>)}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="text-xs font-medium text-slate-700 uppercase tracking-wide block mb-1">Plan de Comisiones/Facturación</label>
                      <select className="flex h-10 w-full rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm" value={formData.managementPlanId} onChange={(e) => setFormData({...formData, managementPlanId: e.target.value})}>
                        <option value="">-- Elegir Plan Comercial --</option>
                        {plans.map(plan => <option key={plan.id} value={plan.id}>{plan.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Columna Derecha: KYC y Documentos */}
                <div className="space-y-5 bg-slate-50 p-5 rounded-xl border border-slate-100">
                  <h4 className="font-semibold text-slate-900 border-b pb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-orange-500" />
                    3. Perfil Legal (KYC)
                  </h4>
                  
                  {!formData.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-slate-700">Razón Social o Nombre Legal</label>
                          <Input value={formData.legalName} onChange={(e) => setFormData({...formData, legalName: e.target.value})} placeholder="Ej. Juan Pérez" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-700">RFC con Homoclave</label>
                          <Input value={formData.rfc} onChange={(e) => setFormData({...formData, rfc: e.target.value})} placeholder="XAXX010101000" />
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium text-slate-700">Régimen Fiscal</label>
                        <Input value={formData.taxRegime} onChange={(e) => setFormData({...formData, taxRegime: e.target.value})} placeholder="Ej. 606 - Arrendamiento" />
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200">
                        <div className="col-span-2">
                          <label className="text-xs font-medium text-slate-700">CLABE Interbancaria (18 dígitos)</label>
                          <Input value={formData.bankClabe} onChange={(e) => setFormData({...formData, bankClabe: e.target.value})} placeholder="Para remanentes/pagos" />
                        </div>
                      </div>

                      <div className="pt-4 space-y-3">
                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <Upload className="h-4 w-4 text-rose-500" /> Documentos Adjuntos (PDF/IMG)
                        </h4>
                        
                        <div className="text-xs space-y-2">
                          <div className="flex justify-between items-center bg-white p-2 rounded border border-slate-200">
                            <span className="font-medium text-slate-700">1. INE / Pasaporte</span>
                            <input type="file" className="w-[180px]" onChange={(e) => setFiles({...files, ine: e.target.files?.[0] || null})} />
                          </div>
                          <div className="flex justify-between items-center bg-white p-2 rounded border border-slate-200">
                            <span className="font-medium text-slate-700">2. Constancia (RFC)</span>
                            <input type="file" className="w-[180px]" onChange={(e) => setFiles({...files, rfcDocument: e.target.files?.[0] || null})} />
                          </div>
                          <div className="flex justify-between items-center bg-white p-2 rounded border border-slate-200">
                            <span className="font-medium text-slate-700">3. Título / Escritura</span>
                            <input type="file" className="w-[180px]" onChange={(e) => setFiles({...files, propertyDeed: e.target.files?.[0] || null})} />
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          Estos documentos ayudarán a conformar el expediente legal para que los contratos generados desde el ERP tengan validez jurídica.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-8 bg-white border border-slate-200 rounded-lg">
                      <ShieldAlert className="mx-auto h-8 w-8 text-amber-500 mb-2" />
                      <p className="text-sm text-slate-600">La edición de documentos KYC y perfil fiscal debe realizarse desde la vista detallada del propietario para mantener el control de auditoría.</p>
                    </div>
                  )}

                </div>
              </div>

              <div className="p-5 bg-slate-100 border-t border-slate-200 flex justify-end gap-3 rounded-b-2xl">
                <Button type="button" variant="outline" className="bg-white" onClick={() => setIsModalOpen(false)}>Cancelar Operación</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px] shadow-lg shadow-blue-500/30">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldAlert className="h-4 w-4 mr-2" />}
                  {isSubmitting ? "Procesando..." : formData.id ? "Guardar Cambios" : "Verificar & Crear Propietario"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
