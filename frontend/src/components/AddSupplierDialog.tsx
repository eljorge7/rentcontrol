import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Wrench, Phone, Mail, User, Building2, CheckCircle2 } from "lucide-react";

export function AddSupplierDialog({ 
  isOpen, 
  onClose, 
  onSave,
  initialData
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData?: any;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contactName: "",
    phone: "",
    email: "",
    category: "PLUMBING"
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: initialData?.name || "",
        contactName: initialData?.contactName || "",
        phone: initialData?.phone || "",
        email: initialData?.email || "",
        category: initialData?.category || "PLUMBING"
      });
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSave = { ...formData };
      if (dataToSave.phone && !dataToSave.phone.startsWith('52') && !dataToSave.phone.startsWith('+52')) {
        dataToSave.phone = '52' + dataToSave.phone.replace(/\D/g, '');
      }
      await onSave(dataToSave);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="bg-slate-900 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/20 p-2 rounded-xl">
              <Wrench className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">{initialData ? "Editar Técnico" : "Nuevo Técnico"}</h3>
              <p className="text-slate-400 text-sm mt-0.5">Visibilidad global para toda la agencia.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-slate-400" /> Razón Social o Empresa (Requerido)
              </label>
              <input 
                required 
                type="text"
                placeholder="Ej. Plomería Express o Juan Pérez"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-medium text-slate-900" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-400" /> Responsable
                </label>
                <input 
                  type="text"
                  placeholder="Ej. Roberto"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none transition-all font-medium text-slate-900 focus:border-indigo-500" 
                  value={formData.contactName}
                  onChange={e => setFormData({...formData, contactName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400" /> Celular (WhatsApp)
                </label>
                <div className="flex">
                  <span className="flex items-center justify-center bg-slate-100 border border-r-0 border-slate-200 px-3 rounded-l-xl text-slate-500 font-bold text-sm">
                    +52
                  </span>
                  <input 
                    type="tel"
                    placeholder="10 dígitos"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-r-xl focus:bg-white outline-none transition-all font-medium text-slate-900 focus:border-indigo-500" 
                    value={formData.phone.replace(/^(\+?52)/, '')}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" /> Correo Electrónico
                </label>
                <input 
                  type="email"
                  placeholder="proveedor@correo.com"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none transition-all font-medium text-slate-900 focus:border-indigo-500" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Especialidad Principal</label>
              <select 
                title="category"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option value="PLUMBING">Fontanería / Plomería</option>
                <option value="ELECTRICAL">Electricidad</option>
                <option value="NETWORK">Sistemas y Redes (WISP)</option>
                <option value="CONSTRUCTION">Albañilería / Obra</option>
                <option value="GENERAL">Mantenimiento General</option>
                <option value="APPLIANCES">Línea Blanca / Electrodomésticos</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.name}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
            >
              {loading ? "Guardando..." : <><CheckCircle2 className="h-4 w-4 mr-2" /> {initialData ? "Guardar Cambios" : "Registrar Técnico"}</>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
