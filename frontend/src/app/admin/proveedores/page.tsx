"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, UserCog, Edit, Trash2, Phone, Mail, Wrench, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { AddSupplierDialog } from "@/components/AddSupplierDialog";

interface Supplier {
  id: string;
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  category: string;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const { data } = await api.get('/suppliers');
      setSuppliers(data);
    } catch (error) {
      console.error("Error al cargar técnicos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (editingSupplier) {
        await api.patch(`/suppliers/${editingSupplier.id}`, data);
      } else {
        await api.post('/suppliers', data);
      }
      fetchSuppliers();
      setIsAddModalOpen(false);
      setEditingSupplier(null);
    } catch (e: any) {
      console.error(e);
      alert(`Error de Servidor: ${e.response?.data?.message || e.message}`);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar a ${name}?`)) return;
    try {
      await api.delete(`/suppliers/${id}`);
      fetchSuppliers();
    } catch (e) {
      alert("Error al eliminar proveedor. Revisa si tiene tickets asignados.");
    }
  };

  if (loading) return <div className="p-8">Cargando proveedores...</div>;

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.contactName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Wrench className="h-6 w-6 text-indigo-500" />
            Técnicos y Proveedores
          </h1>
          <p className="text-slate-500 text-sm mt-1">Directorio de aliados para asignar órdenes de trabajo.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar técnico o especialidad..."
              className="pl-9 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => { setEditingSupplier(null); setIsAddModalOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white whitespace-nowrap">
            <Plus className="mr-2 h-4 w-4" /> Registrar Técnico
          </Button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {suppliers.length === 0 ? (
          <div className="col-span-full bg-slate-50 border border-slate-200 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-slate-500">
            <UserCog className="h-10 w-10 text-slate-300 mb-2" />
            <p className="font-medium">No cuentas con técnicos registrados</p>
            <p className="text-sm">Inicia añadiendo tu fontanero o electricista de confianza.</p>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 text-center">
            <Search className="h-10 w-10 text-slate-300 mb-2" />
            <h3 className="text-base font-medium text-slate-900">No se encontraron resultados</h3>
            <p className="text-sm mt-1">No hay técnicos que coincidan con tu búsqueda.</p>
            <Button variant="ghost" onClick={() => setSearchTerm("")} className="mt-4 text-indigo-600 hover:text-indigo-800">Limpiar búsqueda</Button>
          </div>
        ) : (
          filteredSuppliers.map((supplier) => (
            <div key={supplier.id} className="bg-white p-5 rounded-xl border shadow-sm flex flex-col hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{supplier.name}</h3>
                  {supplier.contactName && <p className="text-sm font-medium text-slate-500">Atte: {supplier.contactName}</p>}
                  <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full uppercase tracking-wider mt-1 inline-block">
                    {supplier.category}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditingSupplier(supplier); setIsAddModalOpen(true); }} className="text-slate-400 hover:text-indigo-500 transition-colors p-1">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(supplier.id, supplier.name)} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 mt-auto text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400" />
                  {supplier.phone || <span className="text-slate-400 italic">Sin teléfono</span>}
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" />
                  {supplier.email || <span className="text-slate-400 italic">Sin correo</span>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <AddSupplierDialog 
        isOpen={isAddModalOpen} 
        initialData={editingSupplier}
        onClose={() => { setIsAddModalOpen(false); setEditingSupplier(null); }} 
        onSave={handleSave} 
      />
    </div>
  );
}
