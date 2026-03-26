"use client";

import { useState } from "react";

import { Building2, MapPin, ShieldAlert, Edit, Trash2, Search } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { AddPropertyDialog } from "@/components/AddPropertyDialog";
import { EditPropertyDialog } from "@/components/EditPropertyDialog";
import { DeletePropertyDialog } from "@/components/DeletePropertyDialog";

export type SharedProperty = {
  id: string;
  name: string;
  address: string;
  ownerId?: string;
  owner?: { name: string };
  description?: string;
  photos?: string;
  units?: any[];
};

export type SharedOwner = {
  id: string;
  name: string;
  planType: string;
};

interface PropertiesViewerProps {
  title: string;
  subtitle: string;
  properties: SharedProperty[];
  owners: SharedOwner[];
  loading: boolean;
  basePath: string;
  onRefresh: () => void;
  // Admin requires filtering to only FULL_MANAGEMENT for new assignments
  newPropertyOwnersFilter?: (o: SharedOwner) => boolean; 
  editPropertyOwnersFilter?: (o: SharedOwner, p: SharedProperty) => boolean;
  customHeaderAction?: React.ReactNode;
  hideDefaultActions?: boolean;
  renderCardActions?: (property: SharedProperty) => React.ReactNode;
}

export function PropertiesViewer({
  title,
  subtitle,
  properties,
  owners,
  loading,
  basePath,
  onRefresh,
  newPropertyOwnersFilter,
  editPropertyOwnersFilter,
  customHeaderAction,
  hideDefaultActions,
  renderCardActions
}: PropertiesViewerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const addOwnersList = newPropertyOwnersFilter ? owners.filter(newPropertyOwnersFilter) : owners;

  const filteredProperties = properties.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.owner?.name.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 relative max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
          <p className="text-slate-500 mt-1">
            {subtitle} ({properties.length} en total)
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar edificio, dirección o dueño..."
              className="pl-9 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {customHeaderAction !== undefined ? (
            customHeaderAction
          ) : (
            <AddPropertyDialog 
              owners={addOwnersList} 
              onPropertyAdded={onRefresh} 
            />
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : properties.length > 0 ? (
        <>
          {filteredProperties.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProperties.map((property) => {
            let coverPhoto = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"; // Default nice fallback
            try {
              if (property.photos) {
                const photosArr = JSON.parse(property.photos);
                if (Array.isArray(photosArr) && photosArr.length > 0) {
                  coverPhoto = photosArr[0];
                }
              }
            } catch (e) {}

            const editOwnersList = editPropertyOwnersFilter ? owners.filter(o => editPropertyOwnersFilter(o, property)) : owners;

            return (
              <div key={property.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-lg hover:border-slate-300 group">
                <Link href={`${basePath}/${property.id}`} className="block relative h-48 sm:h-56 bg-slate-100 overflow-hidden">
                  <img src={coverPhoto} alt={property.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
                  
                  {/* Floating chips */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <div className="bg-white/90 backdrop-blur-sm text-slate-800 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm flex items-center">
                      <Building2 className="h-3 w-3 mr-1 text-slate-500" />
                      {property.units?.length || 0} Locales
                    </div>
                  </div>
                  
                  {property.owner && (
                    <div className="absolute top-3 right-3 bg-blue-600/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-sm truncate max-w-[120px]">
                      De: {property.owner.name}
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 p-4 text-white w-full">
                    <h3 className="font-extrabold text-xl truncate drop-shadow-md">{property.name}</h3>
                    <p className="text-sm text-white/90 flex items-center mt-0.5 drop-shadow">
                      <MapPin className="h-3.5 w-3.5 mr-1 shrink-0" />
                      <span className="truncate">{property.address}</span>
                    </p>
                  </div>
                </Link>
                
                <div className="p-4 flex-1 flex flex-col justify-between">
                  {property.description ? (
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {property.description}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-400 italic">
                      Sin descripción
                    </p>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                    <Link href={`${basePath}/${property.id}`} className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-wider">
                      Administrar Locales →
                    </Link>
                    <div className="flex gap-2">
                       {renderCardActions ? renderCardActions(property) : !hideDefaultActions && (
                         <>
                          <EditPropertyDialog 
                            property={property as any} 
                            owners={editOwnersList as any}
                            onPropertyUpdated={onRefresh} 
                            customTrigger={
                              <button className="h-8 w-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Editar Propiedad">
                                <Edit className="h-4 w-4" />
                              </button>
                            }
                          />
                          <DeletePropertyDialog 
                            property={property as any} 
                            onPropertyDeleted={onRefresh} 
                            customTrigger={
                              <button className="h-8 w-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors" title="Eliminar Propiedad">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            }
                          />
                         </>
                       )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <Search className="mx-auto h-8 w-8 text-slate-300 mb-3" />
              <h3 className="text-base font-medium text-slate-900">No se encontraron edificios</h3>
              <p className="text-sm text-slate-500 mt-1">No hay propiedades que coincidan con tu búsqueda.</p>
              <button onClick={() => setSearchTerm("")} className="mt-4 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">Limpiar búsqueda</button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-3xl mx-auto">
          <div className="mx-auto w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
             <ShieldAlert className="h-12 w-12 text-slate-300" />
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-slate-900">No hay edificios registrados</h3>
          <p className="text-slate-500 mt-2 max-w-md mx-auto text-lg leading-relaxed">
            Parece que tu catálogo de propiedades está vacío. Comienza registrando tu primer edificio para empezar a administrar locales e inquilinos.
          </p>
        </div>
      )}
    </div>
  );
}
