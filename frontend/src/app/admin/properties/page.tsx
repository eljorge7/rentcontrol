"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { PropertiesViewer, SharedProperty, SharedOwner } from "@/components/PropertiesViewer";

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<SharedProperty[]>([]);
  const [owners, setOwners] = useState<SharedOwner[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [propsRes, ownersRes] = await Promise.all([
        api.get('/properties'),
        api.get('/users/owners')
      ]);
      setProperties(propsRes.data);
      setOwners(ownersRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <PropertiesViewer 
      title="Edificios y Plazas Comerciales"
      subtitle="Administración global de propiedades en el sistema."
      properties={properties}
      owners={owners}
      loading={loading}
      basePath="/admin/properties"
      onRefresh={fetchData}
      newPropertyOwnersFilter={(o) => o.planType === 'FULL_MANAGEMENT'}
      editPropertyOwnersFilter={(o, p) => o.planType === 'FULL_MANAGEMENT' || o.id === p.ownerId}
    />
  );
}
