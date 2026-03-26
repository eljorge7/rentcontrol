"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Camera, CheckSquare, XCircle, AlertTriangle, Loader2, ImagePlus } from "lucide-react";
import api from "@/lib/api";

interface AddChecklistDialogProps {
  leaseId: string;
  onChecklistAdded: () => void;
}

interface ChecklistItem {
  id: string; // temporary for react keys
  name: string;
  status: "BUENO" | "REGULAR" | "MALO";
  notes: string;
  photos: string[]; // URLs
}

export function AddChecklistDialog({ leaseId, onChecklistAdded }: AddChecklistDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<"MOVE_IN" | "MOVE_OUT">("MOVE_IN");
  const [globalNotes, setGlobalNotes] = useState("");
  
  const [items, setItems] = useState<ChecklistItem[]>([
    { id: '1', name: "Puerta Principal", status: "BUENO", notes: "", photos: [] },
    { id: '2', name: "Ventanas Frontales", status: "BUENO", notes: "", photos: [] },
  ]);

  const handleAddItem = () => {
    setItems([...items, { id: Math.random().toString(), name: "", status: "BUENO", notes: "", photos: [] }]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleItemChange = (id: string, field: keyof ChecklistItem, value: any) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const [uploadingImageFor, setUploadingImageFor] = useState<string | null>(null);

  const handleUploadPhoto = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploadingImageFor(id);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }
      
      const response = await api.post("/uploads", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      const uploadedUrls = response.data.urls || [];
      const currentItem = items.find(i => i.id === id);
      if (currentItem) {
        handleItemChange(id, "photos", [...currentItem.photos, ...uploadedUrls]);
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      alert("Error al subir la imagen. Verifica tu conexión.");
    } finally {
      setUploadingImageFor(null);
    }
  };

  const removePhoto = (itemId: string, photoIndex: number) => {
    const currentItem = items.find(i => i.id === itemId);
    if (!currentItem) return;
    const newPhotos = [...currentItem.photos];
    newPhotos.splice(photoIndex, 1);
    handleItemChange(itemId, "photos", newPhotos);
  };

  const onSubmit = async () => {
    setLoading(true);
    try {
      await api.post(`/leases/${leaseId}/checklists`, {
        type,
        notes: globalNotes,
        items
      });
      alert(`Inventario (${type === 'MOVE_IN' ? 'Check-in' : 'Check-out'}) guardado exitosamente.`);
      setOpen(false);
      onChecklistAdded();
    } catch (error: any) {
      console.error("Error creating checklist:", error);
      alert(error.response?.data?.message || "Ocurrió un error al guardar el inventario.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all gap-2">
        <CheckSquare className="h-4 w-4" />
        Realizar Inventario Físico
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] h-[90vh] flex flex-col p-0 overflow-hidden bg-slate-50">
        <DialogHeader className="p-6 pb-2 shrink-0 bg-white border-b">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Camera className="h-5 w-5 text-indigo-600" /> Nuevo Registro de Inventario
          </DialogTitle>
          <p className="text-sm text-slate-500">Documenta el estado actual de las instalaciones con fotos y notas.</p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${type === 'MOVE_IN' ? 'border-indigo-600 bg-indigo-50 shadow-sm' : 'border-slate-200 bg-white hover:border-indigo-300'}`} onClick={() => setType('MOVE_IN')}>
              <h4 className={`font-bold text-center ${type === 'MOVE_IN' ? 'text-indigo-700' : 'text-slate-600'}`}>Entrega (Check-in)</h4>
              <p className="text-xs text-center text-slate-500 mt-1">Al inicio del contrato</p>
            </div>
            <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${type === 'MOVE_OUT' ? 'border-amber-500 bg-amber-50 shadow-sm' : 'border-slate-200 bg-white hover:border-amber-300'}`} onClick={() => setType('MOVE_OUT')}>
              <h4 className={`font-bold text-center ${type === 'MOVE_OUT' ? 'text-amber-700' : 'text-slate-600'}`}>Devolución (Check-out)</h4>
              <p className="text-xs text-center text-slate-500 mt-1">Al finalizar el contrato</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Elementos a Evaluar</h3>
              <Button size="sm" variant="outline" onClick={handleAddItem} className="gap-1 h-8 text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                <Plus className="h-3.5 w-3.5" /> Agregar Ítem
              </Button>
            </div>

            {items.map((item, index) => (
              <div key={item.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex gap-3 mb-3">
                  <div className="flex-1">
                    <Label className="text-xs text-slate-500 mb-1 block">Nombre del Elemento</Label>
                    <Input 
                      value={item.name} 
                      onChange={(e) => handleItemChange(item.id, "name", e.target.value)} 
                      placeholder="Ej. Paredes de Recámara 1"
                      className="bg-slate-50"
                    />
                  </div>
                  <div className="w-32 shrink-0">
                    <Label className="text-xs text-slate-500 mb-1 block">Estado</Label>
                    <select 
                      value={item.status} 
                      onChange={(e) => handleItemChange(item.id, "status", e.target.value)}
                      className={`w-full h-10 rounded-md border text-sm px-3 font-semibold ${
                        item.status === 'BUENO' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                        item.status === 'REGULAR' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                        'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      <option value="BUENO">Bueno</option>
                      <option value="REGULAR">Regular</option>
                      <option value="MALO">Malo (Daño)</option>
                    </select>
                  </div>
                  <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 text-slate-400 hover:text-red-600 mt-5" onClick={() => handleRemoveItem(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="mb-3">
                  <Input 
                    value={item.notes} 
                    onChange={(e) => handleItemChange(item.id, "notes", e.target.value)} 
                    placeholder="Notas o descripción del daño (Opcional)..."
                    className="text-sm bg-slate-50"
                  />
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                  {item.photos.map((photo, pIdx) => (
                    <div key={photo} className="relative h-16 w-16 rounded-md overflow-hidden bg-slate-100 border border-slate-200">
                      <img src={photo} alt="Evidencia" className="object-cover h-full w-full" />
                      <button onClick={() => removePhoto(item.id, pIdx)} className="absolute -top-1 -right-1 bg-red-500 rounded-full text-white p-0.5">
                        <XCircle className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  
                  <label className="flex flex-col items-center justify-center h-16 w-16 rounded-md border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 transition-colors cursor-pointer text-slate-500 hover:text-indigo-600 relative">
                    {uploadingImageFor === item.id ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <ImagePlus className="h-5 w-5" />
                    )}
                    <input type="file" accept="image/*" multiple capture="environment" className="hidden" disabled={uploadingImageFor === item.id} onChange={(e) => handleUploadPhoto(item.id, e)} />
                  </label>
                </div>
              </div>
            ))}
            {items.length === 0 && (
               <div className="text-center py-6 text-slate-400 border-2 border-dashed rounded-xl border-slate-200">
                 No hay elementos a revisar. Agrega uno.
               </div>
            )}
          </div>

          <div>
            <Label className="text-sm font-bold text-slate-700 mb-2 block">Observaciones Generales</Label>
            <textarea 
              value={globalNotes} 
              onChange={(e) => setGlobalNotes(e.target.value)}
              className="w-full rounded-md border border-slate-200 p-3 text-sm min-h-[80px] bg-white"
              placeholder="Escribe alguna observación final sobre el estado general del inmueble..."
            />
          </div>
        </div>

        <div className="shrink-0 p-4 bg-white border-t flex justify-end gap-3 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={onSubmit} disabled={loading || items.length === 0} className="bg-indigo-600 hover:bg-indigo-700 min-w-[140px]">
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : "Guardar Inventario"}
          </Button>
        </div>
      </DialogContent>
      </Dialog>
    </>
  );
}
