"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { 
  MapPin, Maximize, Bed, Bath, CheckCircle2, Building, Map, 
  Search, LayoutGrid, List, X, DollarSign, Home
} from "lucide-react";
import { AddLeaseDialog } from "./AddLeaseDialog";

export function ProspectsViewer() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minBeds, setMinBeds] = useState("");
  const [onlyFurnished, setOnlyFurnished] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "compact">("grid");

  // Selected Unit Modal
  const [selectedUnit, setSelectedUnit] = useState<any | null>(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  async function fetchProperties() {
    try {
      const response = await api.get('/properties');
      setProperties(response.data);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  }

  function parseJSON(str: string | undefined | null) {
    if (!str) return [];
    try {
      const parsed = JSON.parse(str);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Derived state: flattened and filtered units
  const allUnits = properties.flatMap(prop => {
    const availableOpts = prop.units?.filter((u: any) => !u.isOccupied) || [];
    return availableOpts.map((u:any) => ({ ...u, property: prop }));
  });

  const filteredUnits = allUnits.filter(unit => {
    const matchSearch = searchTerm === "" || 
      unit.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      unit.property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.property.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchPrice = maxPrice === "" || unit.basePrice <= parseFloat(maxPrice);
    const matchBeds = minBeds === "" || (unit.bedrooms || 0) >= parseInt(minBeds);
    const matchFurnished = !onlyFurnished || unit.isFurnished;

    return matchSearch && matchPrice && matchBeds && matchFurnished;
  });

  return (
    <div className="p-4 sm:p-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Catálogo de Prospectos</h1>
          <p className="text-slate-500 text-lg">Muestra unidades interactivamente y cierra tratos al instante.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
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
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-8 shadow-sm flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full space-y-1">
          <Label className="text-xs text-slate-500 ml-1">Buscar (Propiedad, Dirección, Local)</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Ej. Plaza Central..." 
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
            id="onlyFurnishedObj" 
            className="w-4 h-4 text-blue-600 rounded border-slate-300"
            checked={onlyFurnished}
            onChange={e => setOnlyFurnished(e.target.checked)}
          />
          <Label htmlFor="onlyFurnishedObj" className="text-sm font-medium cursor-pointer">Solo Amueblados</Label>
        </div>
        { (searchTerm || maxPrice || minBeds || onlyFurnished) && (
          <Button variant="ghost" className="text-slate-500 hover:text-slate-700 h-10 px-3" onClick={() => {
            setSearchTerm(""); setMaxPrice(""); setMinBeds(""); setOnlyFurnished(false);
          }}>
            <X className="w-4 h-4 mr-1" /> Limpiar
          </Button>
        )}
      </div>

      {/* Results */}
      {filteredUnits.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
          <h3 className="text-xl font-medium text-slate-600">No se encontraron unidades</h3>
          <p className="text-slate-400 mt-2">Intenta ajustar los filtros de búsqueda.</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
          : "grid grid-cols-1 md:grid-cols-2 gap-4"
        }>
          {filteredUnits.map(unit => {
            const unitPhotos = parseJSON(unit.photos);
            const propPhotos = parseJSON(unit.property.photos);
            const defaultPhoto = unitPhotos[0] || propPhotos[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';
            
            return (
              <Card 
                key={unit.id} 
                onClick={() => setSelectedUnit(unit)}
                className={`overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 group rounded-2xl bg-white cursor-pointer ${viewMode === 'compact' ? 'flex flex-row h-32' : ''}`}
              >
                <div className={`relative overflow-hidden ${viewMode === 'compact' ? 'w-1/3 h-full' : 'aspect-[4/3] w-full'}`}>
                  <img 
                    src={defaultPhoto} 
                    alt={unit.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-green-500 hover:bg-green-600 text-white border-0 shadow-sm backdrop-blur-sm">
                      Disponible
                    </Badge>
                  </div>
                  {viewMode === 'grid' && (
                    <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm">
                      <span className="text-lg font-bold text-slate-900">${unit.basePrice.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className={`flex flex-col ${viewMode === 'compact' ? 'w-2/3 p-4 justify-center' : 'p-4'}`}>
                  <div className="mb-2">
                    <p className="text-xs font-semibold text-blue-600 flex items-center gap-1 uppercase tracking-wider mb-1">
                      <Building className="w-3 h-3" /> {unit.property.name}
                    </p>
                    <CardTitle className="text-lg font-bold text-slate-800 line-clamp-1">{unit.name}</CardTitle>
                    {viewMode === 'compact' && (
                      <p className="text-xl font-bold text-slate-900 mt-1">${unit.basePrice.toLocaleString()} <span className="text-xs text-slate-500 font-normal">/mes</span></p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs text-slate-600 mt-auto">
                    {unit.area > 0 && (
                      <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-md justify-center">
                        <Maximize className="w-3 h-3 text-slate-400" />
                        <span className="font-medium">{unit.area}m²</span>
                      </div>
                    )}
                    {unit.bedrooms > 0 && (
                      <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-md justify-center">
                        <Bed className="w-3 h-3 text-slate-400" />
                        <span className="font-medium">{unit.bedrooms}</span>
                      </div>
                    )}
                    {unit.bathrooms > 0 && (
                      <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-md justify-center">
                        <Bath className="w-3 h-3 text-slate-400" />
                        <span className="font-medium">{unit.bathrooms}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detailed Modal via Dialog */}
      <Dialog open={!!selectedUnit} onOpenChange={(open) => !open && setSelectedUnit(null)}>
        <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-slate-50 rounded-3xl border-0 shadow-2xl">
           {selectedUnit && (() => {
             const unitPhotos = parseJSON(selectedUnit.photos);
             const propPhotos = parseJSON(selectedUnit.property.photos);
             const allPhotos = [...unitPhotos, ...propPhotos];
             const mainPhoto = allPhotos[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';
             const unitAmenities = parseJSON(selectedUnit.amenities);
             const propAmenities = parseJSON(selectedUnit.property.amenities);

             return (
               <div className="flex flex-col max-h-[90vh]">
                 {/* Header Image Gallery Area */}
                 <div className="relative h-64 md:h-80 w-full shrink-0">
                    <img src={mainPhoto} alt="Cover" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-green-500 text-white text-sm px-3 py-1">Disponible Ahora</Badge>
                    </div>
                    <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                      <div>
                        <h2 className="text-3xl font-bold text-white mb-1 shadow-sm">{selectedUnit.name}</h2>
                        <p className="text-slate-200 flex items-center gap-1.5">
                          <Building className="w-4 h-4" /> {selectedUnit.property.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-extrabold text-white">${selectedUnit.basePrice.toLocaleString()}</p>
                        <p className="text-slate-300 text-sm">Mensualidad Base</p>
                      </div>
                    </div>
                 </div>

                 {/* Content Scroll Area */}
                 <div className="p-6 md:p-8 overflow-y-auto space-y-8 bg-white">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-slate-50 rounded-2xl p-4 flex flex-col items-center justify-center text-center border border-slate-100">
                        <Maximize className="w-6 h-6 text-blue-500 mb-2" />
                        <span className="text-sm text-slate-500">Superficie</span>
                        <span className="font-bold text-slate-900">{selectedUnit.area ? `${selectedUnit.area} m²` : 'N/A'}</span>
                      </div>
                      <div className="bg-slate-50 rounded-2xl p-4 flex flex-col items-center justify-center text-center border border-slate-100">
                        <Bed className="w-6 h-6 text-indigo-500 mb-2" />
                        <span className="text-sm text-slate-500">Recámaras</span>
                        <span className="font-bold text-slate-900">{selectedUnit.bedrooms || 'Estudio / Abierto'}</span>
                      </div>
                      <div className="bg-slate-50 rounded-2xl p-4 flex flex-col items-center justify-center text-center border border-slate-100">
                        <Bath className="w-6 h-6 text-cyan-500 mb-2" />
                        <span className="text-sm text-slate-500">Baños</span>
                        <span className="font-bold text-slate-900">{selectedUnit.bathrooms || '0'}</span>
                      </div>
                      <div className="bg-slate-50 rounded-2xl p-4 flex flex-col items-center justify-center text-center border border-slate-100">
                        <Home className="w-6 h-6 text-amber-500 mb-2" />
                        <span className="text-sm text-slate-500">Amueblado</span>
                        <span className="font-bold text-slate-900">{selectedUnit.isFurnished ? 'Sí' : 'No'}</span>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Description & Location */}
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 mb-3">Descripción</h3>
                          <p className="text-slate-600 leading-relaxed">
                            {selectedUnit.description || "Sin descripción detallada. Comuníquese con su agente para más información sobre los acabados y beneficios de esta unidad."}
                          </p>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-red-500" /> Ubicación
                          </h3>
                          <p className="text-slate-600 mb-3">{selectedUnit.property.address}</p>
                          {selectedUnit.property.mapUrl && (
                            <a 
                              href={selectedUnit.property.mapUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
                            >
                              <Map className="w-4 h-4" /> Ver Ubicación en Google Maps
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Amenities */}
                      <div>
                        {unitAmenities.length > 0 && (
                          <div className="mb-6">
                            <h3 className="text-xl font-bold text-slate-900 mb-4">Amenidades (Unidad)</h3>
                            <ul className="grid grid-cols-1 gap-3">
                              {unitAmenities.map((am:string, i:number) => (
                                <li key={i} className="flex items-center gap-2 text-slate-700">
                                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> {am}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {propAmenities.length > 0 && (
                          <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-4">Servicios (Edificio)</h3>
                            <ul className="grid grid-cols-1 gap-3">
                              {propAmenities.map((am:string, i:number) => (
                                <li key={i} className="flex items-center gap-2 text-slate-700">
                                  <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" /> {am}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Massive Call To Action using the Custom Trigger */}
                    <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                      <AddLeaseDialog 
                        onLeaseAdded={() => {
                          setSelectedUnit(null);
                          fetchProperties();
                        }}
                        defaultPropertyId={selectedUnit.property.id}
                        defaultUnitId={selectedUnit.id}
                        customTrigger={
                          <Button className="w-full md:w-auto text-lg h-14 px-8 bg-black hover:bg-slate-800 text-white rounded-2xl shadow-xl shadow-black/10 transition-all hover:scale-[1.02]">
                            Cerrar Trato / Crear Contrato
                          </Button>
                        }
                      />
                    </div>
                 </div>
               </div>
             )
           })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
