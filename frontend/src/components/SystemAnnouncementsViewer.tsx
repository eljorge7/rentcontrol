"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { AlertCircle, Wrench, Zap, Info, X } from "lucide-react";

interface SystemAnnouncement {
  id: string;
  message: string;
  type: string;
}

export function SystemAnnouncementsViewer() {
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>([]);
  const [closedIds, setClosedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Para simplificar, obtenemos los que nos competen, pero podríamos usar un endpoint que filtre por el rol conectado.
    // El backend ya lo filtra en GET /announcements/system basado en req.user.role
    api.get('/announcements/system')
      .then(res => {
        setAnnouncements(res.data);
      })
      .catch(e => console.error("Error fetching announcements", e));
  }, []);

  const dismiss = (id: string) => {
    setClosedIds(prev => new Set(prev).add(id));
  };

  const visible = announcements.filter(a => !closedIds.has(a.id));

  if (visible.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {visible.map(ann => {
        let bgColor = "bg-blue-50/80 border-blue-200 text-blue-800";
        let Icon = Info;
        
        if (ann.type === "MAINTENANCE") {
          bgColor = "bg-orange-50/80 border-orange-200 text-orange-900";
          Icon = Wrench;
        } else if (ann.type === "ALERT") {
          bgColor = "bg-red-50/80 border-red-200 text-red-900";
          Icon = AlertCircle;
        } else if (ann.type === "PROMO") {
          bgColor = "bg-emerald-50/80 border-emerald-200 text-emerald-900";
          Icon = Zap;
        }

        return (
          <div key={ann.id} className={`relative p-4 rounded-2xl border flex items-start gap-3 shadow-sm ${bgColor} animate-in fade-in duration-500`}>
             <Icon className="w-5 h-5 shrink-0 mt-0.5 opacity-80" />
             <div className="flex-1">
               <p className="text-sm font-medium leading-relaxed">{ann.message}</p>
             </div>
             <button onClick={() => dismiss(ann.id)} className="opacity-50 hover:opacity-100 p-1">
               <X className="w-4 h-4" />
             </button>
          </div>
        );
      })}
    </div>
  );
}
