"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { getAuthHeaders } from "@/lib/auth";
import { ArrowLeft, Building2, MapPin, Store, CheckCircle2, ChevronRight, Receipt, Wallet, ArrowDownRight, Trash2, LayoutGrid, List, Search, DollarSign, Maximize, Bed, Bath, Home as HomeIcon, X, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { AddLeaseDialog } from "@/components/AddLeaseDialog";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { AddUnitDialog } from "@/components/AddUnitDialog";
import { EditUnitDialog } from "@/components/EditUnitDialog";
import api from "@/lib/api";

interface Unit {
  id: string;
  name: string;
  basePrice: number;
  isOccupied: boolean;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  isFurnished?: boolean;
  photos?: string;
  amenities?: string;
  leases?: Array<{
    id: string;
    rentAmount: number;
    tenant: { name: string };
  }>;
}

interface PropertyDetail {
  id: string;
  name: string;
  address: string;
  description: string;
  owner?: { name: string };
  units: Unit[];
  photos?: string;
}

interface PropertyDetailViewerProps {
  id: string;
  roleBasePath: string; // e.g. "/admin", "/manager", "/owner"
}

export function PropertyDetailViewer({ id, roleBasePath }: PropertyDetailViewerProps) {
  const { user } = useAuth();
  const router = useRouter();
  
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Views
  const [activeTab, setActiveTab] = useState<'UNITS' | 'EXPENSES'>('UNITS');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minBeds, setMinBeds] = useState("");
  const [onlyFurnished, setOnlyFurnished] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "compact">("grid");

  useEffect(() => {
    if (id) {
      fetchPropertyDetails();
      fetchExpenses();
    }
  }, [id]);

  const fetchExpenses = async () => {
    try {
      const res = await api.get(`/expenses?propertyId=${id}`);
      setExpenses(res.data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  const fetchPropertyDetails = async () => {
    try {
      const res = await fetch(`http://localhost:3001/properties/${id}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setProperty(data);
      } else {
        router.push(`${roleBasePath}/properties`);
      }
    } catch (error) {
      console.error("Error fetching property:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUnit = async (unitId: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este local? Esta acción no se puede deshacer.")) return;
    try {
      await api.delete(`/units/${unitId}`);
      fetchPropertyDetails();
    } catch (error: any) {
      console.error("Error deleting unit:", error);
      alert(error.response?.data?.message || "Error al eliminar local");
    }
  };

  function parseJSON(str: string | undefined | null) {
    if (!str) return [];
    try {
      const parsed = JSON.parse(str);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!property) return null;

  // Render hero photo if available
  let heroPhoto = "";
  try {
    if (property.photos) {
      const photosArray = JSON.parse(property.photos);
      if (Array.isArray(photosArray) && photosArray.length > 0) {
        heroPhoto = photosArray[0];
      }
    }
  } catch (err) {}

  const filteredUnits = property.units.filter(unit => {
    const matchSearch = searchTerm === "" || 
      unit.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchPrice = maxPrice === "" || unit.basePrice <= parseFloat(maxPrice);
    const matchBeds = minBeds === "" || (unit.bedrooms || 0) >= parseInt(minBeds);
    const matchFurnished = !onlyFurnished || unit.isFurnished;

    return matchSearch && matchPrice && matchBeds && matchFurnished;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
        <Link href={`${roleBasePath}/properties`} className="hover:text-blue-600 flex items-center gap-1 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Volver al Catalogo
        </Link>
      </div>

      {/* Hero Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {heroPhoto ? (
          <div className="h-32 sm:h-48 w-full relative">
            <img src={heroPhoto} alt={property.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          </div>
        ) : (
          <div className="h-24 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-transparent"></div>
        )}
        
        <div className={`p-6 sm:p-8 relative flex flex-col sm:flex-row items-start sm:items-end gap-5 ${heroPhoto ? '-mt-16' : '-mt-12'}`}>
          <div className="h-20 w-20 sm:h-24 sm:w-24 bg-white rounded-2xl shadow-md border border-slate-100 flex items-center justify-center text-blue-600 shrink-0 z-10">
            <Building2 className="h-10 w-10 sm:h-12 sm:w-12" />
          </div>
          <div className="flex-1 z-10">
            <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${heroPhoto ? 'text-white drop-shadow-md' : 'text-slate-900'}`}>{property.name}</h1>
            <div className={`mt-2 space-y-2 ${heroPhoto ? 'text-white/90 drop-shadow' : 'text-slate-500'}`}>
              <p className="flex items-center text-sm sm:text-base">
                <MapPin className="h-4 w-4 mr-1 shrink-0" />
                {property.address}
              </p>
              {property.owner && (
                <div className={`inline-block px-3 py-1 rounded-lg border shadow-sm ${heroPhoto ? 'bg-white/20 border-white/30 backdrop-blur-sm' : 'bg-slate-100/80 border-slate-200/60'}`}>
                  <p className={`text-sm font-semibold flex items-center ${heroPhoto ? 'text-white' : 'text-slate-700'}`}>
                    <span className={`mr-2 font-medium ${heroPhoto ? 'text-white/80' : 'text-slate-400'}`}>Propietario:</span> {property.owner.name}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3 w-full sm:w-auto mt-4 sm:mt-0 z-10">
            <AddUnitDialog propertyId={property.id} onUnitAdded={fetchPropertyDetails} />
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Left Col: Tabulated Content */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Custom Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl w-full max-w-sm mb-6 shadow-inner">
            <button
              onClick={() => setActiveTab('UNITS')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${activeTab === 'UNITS' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Store className="h-4 w-4" /> Locales
            </button>
            <button
              onClick={() => setActiveTab('EXPENSES')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${activeTab === 'EXPENSES' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Receipt className="h-4 w-4" /> Gastos
            </button>
          </div>

          {activeTab === 'UNITS' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Store className="h-5 w-5 text-slate-400" />
                    Locales y Departamentos
                  </h2>
                  <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-full border border-slate-200 shadow-sm">
                    {property.units.length} Registrados
                  </span>
                </div>
                
                <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
                  <button 
                    onClick={() => setViewMode("grid")}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <LayoutGrid className="w-4 h-4" /> Grid
                  </button>
                  <button 
                    onClick={() => setViewMode("compact")}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${viewMode === 'compact' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <List className="w-4 h-4" /> Compacto
                  </button>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full space-y-1">
                  <Label className="text-xs text-slate-500 ml-1">Buscar Local</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      placeholder="Ej. Local A..." 
                      value={searchTerm} 
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-9 bg-slate-50 border-slate-200"
                    />
                  </div>
                </div>
                <div className="w-full md:w-32 space-y-1">
                  <Label className="text-xs text-slate-500 ml-1">Precio Máx</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      type="number" 
                      placeholder="Cualquiera" 
                      value={maxPrice} 
                      onChange={e => setMaxPrice(e.target.value)}
                      className="pl-9 bg-slate-50 border-slate-200"
                    />
                  </div>
                </div>
                <div className="w-full md:w-28 space-y-1">
                  <Label className="text-xs text-slate-500 ml-1">Min. Recámaras</Label>
                  <Input 
                    type="number" 
                    placeholder="Cualquiera" 
                    value={minBeds} 
                    onChange={e => setMinBeds(e.target.value)}
                    className="bg-slate-50 border-slate-200"
                  />
                </div>
                <div className="w-full md:w-auto flex items-center gap-2 h-10 px-2">
                  <input 
                    type="checkbox" 
                    id="onlyFurnishedObj2" 
                    className="w-4 h-4 text-blue-600 rounded border-slate-300"
                    checked={onlyFurnished}
                    onChange={e => setOnlyFurnished(e.target.checked)}
                  />
                  <Label htmlFor="onlyFurnishedObj2" className="text-sm font-medium cursor-pointer">Amueblados</Label>
                </div>
                { (searchTerm || maxPrice || minBeds || onlyFurnished) && (
                  <Button variant="ghost" className="text-slate-500 hover:text-slate-700 h-10 px-3" onClick={() => {
                    setSearchTerm(""); setMaxPrice(""); setMinBeds(""); setOnlyFurnished(false);
                  }}>
                    <X className="w-4 h-4 mr-1" /> Limpiar
                  </Button>
                )}
              </div>

              {filteredUnits.length > 0 ? (
                <div className={viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                  : "grid grid-cols-1 md:grid-cols-2 gap-4"
                }>
                  {filteredUnits.map(unit => {
                    const unitPhotos = parseJSON(unit.photos);
                    const propPhotos = parseJSON(property.photos);
                    const defaultPhoto = unitPhotos[0] || propPhotos[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';
                    
                    return (
                      <Card 
                        key={unit.id} 
                        className={`overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 group rounded-2xl bg-white relative ${viewMode === 'compact' ? 'flex flex-row h-32' : ''}`}
                      >
                        <div className={`absolute top-0 right-0 w-2 h-full z-10 ${unit.isOccupied ? 'bg-emerald-500' : 'bg-amber-400'}`}></div>
                        
                        <div className={`relative overflow-hidden ${viewMode === 'compact' ? 'w-1/3 h-full' : 'aspect-[4/3] w-full'}`}>
                          <img 
                            src={defaultPhoto} 
                            alt={unit.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3 flex gap-2">
                            {unit.isOccupied ? (
                              <Badge className="bg-emerald-500 text-white border-0 shadow-sm backdrop-blur-sm shadow-md">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Ocupado
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-400 text-white border-0 shadow-sm backdrop-blur-sm shadow-md">
                                Disponible
                              </Badge>
                            )}
                          </div>
                          {viewMode === 'grid' && (
                            <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm">
                              <span className="text-lg font-bold text-slate-900">${unit.basePrice.toLocaleString()}</span>
                            </div>
                          )}
                        </div>

                        <div className={`flex flex-col ${viewMode === 'compact' ? 'w-2/3 p-4 justify-between' : 'p-4'}`}>
                          <div className="mb-2 flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg font-bold text-slate-800 line-clamp-1 truncate pr-2">{unit.name}</CardTitle>
                              {viewMode === 'compact' && (
                                <p className="text-xl font-bold text-slate-900 mt-1">${unit.basePrice.toLocaleString()} <span className="text-xs text-slate-500 font-normal">/mes</span></p>
                              )}
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex items-center gap-1 shrink-0 z-20">
                              <EditUnitDialog unit={unit as any} onUnitUpdated={fetchPropertyDetails} />
                              {!unit.isOccupied && (
                                <Button variant="outline" size="icon" className="h-8 w-8 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors" onClick={() => handleDeleteUnit(unit.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 text-xs text-slate-600 mt-auto mb-4">
                            {(unit.area ?? 0) > 0 && (
                              <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-md justify-center border border-slate-100">
                                <Maximize className="w-3 h-3 text-slate-400" />
                                <span className="font-medium">{unit.area}m²</span>
                              </div>
                            )}
                            {(unit.bedrooms ?? 0) > 0 && (
                              <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-md justify-center border border-slate-100">
                                <Bed className="w-3 h-3 text-slate-400" />
                                <span className="font-medium">{unit.bedrooms}</span>
                              </div>
                            )}
                            {(unit.bathrooms ?? 0) > 0 && (
                              <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-md justify-center border border-slate-100">
                                <Bath className="w-3 h-3 text-slate-400" />
                                <span className="font-medium">{unit.bathrooms}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Foot Action */}
                          <div className={`border-t border-slate-100 flex items-center ${viewMode === 'grid' ? 'pt-4 justify-between' : 'pt-2 justify-end'}`}>
                            {viewMode === 'grid' && (
                              <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Mensualidad Base</p>
                              </div>
                            )}
                            {unit.isOccupied ? (
                              <Link href={`${roleBasePath}/leases/${unit.leases?.[0]?.id || ''}`} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-full transition-colors flex items-center justify-center border border-blue-100" title="Ver Contrato Activo">
                                Contrato Activo <ChevronRight className="h-4 w-4 ml-1" />
                              </Link>
                            ) : (
                              <div className="z-20 relative">
                                <AddLeaseDialog 
                                  onLeaseAdded={fetchPropertyDetails} 
                                  defaultPropertyId={property.id} 
                                  defaultUnitId={unit.id} 
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-10 text-center shadow-sm">
                  <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Store className="h-8 w-8 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900">
                    {property.units.length === 0 ? "Aún no hay locales registrados" : "No hay resultados para tu búsqueda"}
                  </h3>
                  <p className="text-slate-500 mt-1 max-w-sm mx-auto text-sm">
                    {property.units.length === 0 
                      ? "Divide esta propiedad creando los locales, oficinas o departamentos que vas a rentar."
                      : "Intenta cambiar los filtros para encontrar lo que buscas."}
                  </p>
                  {property.units.length === 0 && (
                    <div className="mt-6 flex justify-center">
                      <AddUnitDialog propertyId={property.id} onUnitAdded={fetchPropertyDetails} />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'EXPENSES' && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-orange-500" />
                    Gastos Operativos
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">Historial de egresos y mantenimientos de este edificio.</p>
                </div>
                <AddExpenseDialog propertyId={id} onExpenseAdded={fetchExpenses} />
              </div>

              {expenses.length > 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="divide-y divide-slate-100">
                    {expenses.map((expense: any) => (
                      <div key={expense.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-orange-50 text-orange-600 rounded-lg shrink-0 mt-1">
                            <ArrowDownRight className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">{expense.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded tracking-wider shadow-sm">
                                {expense.category}
                              </span>
                              <span className="text-xs text-slate-500 font-medium">
                                {new Date(expense.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-red-600 text-lg">-${expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
                  <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Receipt className="h-8 w-8 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900">Sin historial de Gastos</h3>
                  <p className="text-slate-500 mt-1 text-sm">No has registrado ningún gasto operativo para este edificio.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Col: Stats & Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[100px] -z-10"></div>
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">Resumen Operativo</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-500">Nivel de Ocupación</span>
                <span className="text-sm font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md">
                  {property.units.length > 0 
                    ? Math.round((property.units.filter(u => u.isOccupied).length / property.units.length) * 100) 
                    : 0}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 shadow-inner">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${property.units.length > 0 ? (property.units.filter(u => u.isOccupied).length / property.units.length) * 100 : 0}%` }}
                ></div>
              </div>
              
              <div className="pt-5 border-t border-slate-100 mt-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-500">Ingreso Mensual (100%)</span>
                  <span className="font-bold text-xl text-emerald-600">
                    ${property.units.reduce((sum, u) => sum + u.basePrice, 0).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-2 rounded-md">
                  Este es el valor mensual teórico del edificio asumiendo que todos los espacios están rentados a su precio base.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
