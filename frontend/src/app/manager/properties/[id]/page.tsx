"use client";

import { use } from "react";
import { PropertyDetailViewer } from "@/components/PropertyDetailViewer";

export default function ManagerPropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  
  return (
    <PropertyDetailViewer 
      id={resolvedParams.id} 
      roleBasePath="/manager" 
    />
  );
}
