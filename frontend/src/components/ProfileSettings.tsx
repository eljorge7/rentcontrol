"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getAuthHeaders, setToken, getToken } from "@/lib/auth";
import { User, Lock, Save, Camera, CheckCircle2, Loader2, AlertCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UpdateTaxProfileDialog } from "@/components/UpdateTaxProfileDialog";

export function ProfileSettings() {
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [fullUser, setFullUser] = useState<any>(null);

  const fetchFullProfile = () => {
    // Only Admin/Manager/Owner have full extended fields via /users/my-profile
    if (user?.role === 'TENANT') {
      // Tenants do not have extended Users configuration like requiresInvoice on the User model
      return;
    }
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}"}/users/my-profile`, { headers: getAuthHeaders() })
      .then(async res => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then(data => setFullUser(data))
      .catch(err => console.error("Error fetching full profile:", err));
  };

  useEffect(() => {
    if (user) {
      setFormData(prev => ({ ...prev, name: user.name || "", email: user.email || "" }));
      fetchFullProfile();
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setErrorMsg("Las contraseñas nuevas no coinciden");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}"}/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          name: formData.name,
          currentPassword: formData.currentPassword || undefined,
          newPassword: formData.newPassword || undefined,
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al actualizar perfil");
      }

      setSuccessMsg("¡Perfil actualizado con éxito!");
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));
      
      // Update local storage user data
      if (data.user && getToken()) {
        setToken(getToken() as string, data.user);
      }

    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Configuración de Perfil</h2>
        <p className="text-slate-500 mt-1">Administra tu información personal y seguridad de cuenta.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <form onSubmit={handleUpdateProfile}>
          <div className="p-6 sm:p-8 space-y-8">
            
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {formData.name ? formData.name.charAt(0).toUpperCase() : "U"}
                </div>
                <button type="button" className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-colors">
                  <Camera size={14} />
                </button>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Foto de Perfil</h3>
                <p className="text-sm text-slate-500 mt-1 mb-3">Sube una imagen para reconocerte más fácilmente.</p>
                <div className="flex gap-3">
                  <Button variant="outline" type="button" className="h-9 text-xs font-semibold">Cambiar</Button>
                  <Button variant="ghost" type="button" className="h-9 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50">Eliminar</Button>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100"></div>

            {/* General Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-500" /> Información General
              </h3>
              
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Nombre Completo</label>
                  <Input 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="bg-slate-50 border-slate-200 focus:bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Rol en el Sistema</label>
                  <Input 
                    value={user.role} 
                    disabled 
                    className="bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed font-medium"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Correo Electrónico</label>
                  <Input 
                    name="email"
                    value={formData.email}
                    disabled
                    className="bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-400">El correo electrónico no se puede cambiar ya que está ligado a tu cuenta principal.</p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100"></div>

            {/* Tax / Billing Info (Hidden for Tenants as they have a dedicated section in their Dashboard) */}
            {user.role !== 'TENANT' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-500" /> Facturación Fiscal
                </h3>
                <p className="text-sm text-slate-500 pb-2">
                  Configura tus datos para la emisión automática o manual de comprobantes fiscales (CFDI).
                </p>
                
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">
                      {fullUser?.requiresInvoice ? "Facturación Activada" : "Sin Configurar Facturación"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      {fullUser?.requiresInvoice 
                        ? `RFC: ${fullUser.rfc} | CP: ${fullUser.zipCode}` 
                        : "Al no activar facturación no se te requerirá CSF. Si deseas CFDI, completa el registro presionando el botón de configuración."}
                    </p>
                  </div>
                  {fullUser && (
                    <UpdateTaxProfileDialog 
                      user={fullUser} 
                      onUpdated={fetchFullProfile} 
                    />
                  )}
                </div>
              </div>
            )}

            <div className="border-t border-slate-100"></div>

            {/* Password */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Lock className="h-5 w-5 text-amber-500" /> Seguridad
              </h3>
              <p className="text-sm text-slate-500 pb-2">Deja los campos en blanco si no deseas cambiar tu contraseña.</p>

              <div className="space-y-5">
                <div className="space-y-2 max-w-md">
                  <label className="text-sm font-medium text-slate-700">Contraseña Actual <span className="text-rose-500">*</span></label>
                  <Input 
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    placeholder="Requerido para guardar cambios"
                    className="bg-slate-50 border-slate-200 focus:bg-white"
                  />
                </div>
                
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Nueva Contraseña</label>
                    <Input 
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="Mínimo 8 caracteres"
                      className="bg-slate-50 border-slate-200 focus:bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Confirmar Nueva Contraseña</label>
                    <Input 
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="bg-slate-50 border-slate-200 focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-6 border-t border-slate-200 flex items-center justify-between">
            <div className="flex-1">
              {errorMsg && <p className="text-sm font-medium text-rose-600 flex items-center gap-1"><AlertCircle size={14}/> {errorMsg}</p>}
              {successMsg && <p className="text-sm font-medium text-emerald-600 flex items-center gap-1"><CheckCircle2 size={14}/> {successMsg}</p>}
            </div>
            <Button 
              type="submit" 
              disabled={isLoading || (!formData.name && !formData.newPassword) || (!!formData.newPassword && !formData.currentPassword)}
              className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px] shadow-md shadow-blue-600/20"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Guardar Cambios
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
