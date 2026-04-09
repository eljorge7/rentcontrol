"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, Save, Mail, MessageCircle, RefreshCw, CheckCircle2 } from "lucide-react";
import api from "@/lib/api";
import { QRCodeSVG } from "qrcode.react";

export function NotificationsSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    SMTP_HOST: "",
    SMTP_PORT: "",
    SMTP_USER: "",
    SMTP_PASS: "",
  });

  const [wpStatus, setWpStatus] = useState<{ isReady: boolean; qrCode: string | null }>({
    isReady: false,
    qrCode: null
  });

  useEffect(() => {
    fetchSettings();
    const interval = setInterval(fetchWhatsAppStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings');
      if (res.data) {
        setFormData({
          SMTP_HOST: res.data.SMTP_HOST || "smtp.gmail.com",
          SMTP_PORT: res.data.SMTP_PORT || "587",
          SMTP_USER: res.data.SMTP_USER || "",
          SMTP_PASS: res.data.SMTP_PASS || "",
        });
      }
    } catch (error) {
      console.error("Error cargando configuraciones:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWhatsAppStatus = async () => {
    // Ya no hacemos ping al antiguo Gateway WebJS
    setWpStatus({ isReady: true, qrCode: null });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.post('/settings/bulk', formData);
      alert('Resend API Key Guardada Exitosamente.');
    } catch (error) {
      alert('Error guardando configuraciones.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-emerald-500" />
            <CardTitle>Conexión WhatsApp Web (Cero Costos)</CardTitle>
          </div>
          <CardDescription>
            Tus notificaciones automáticas gratuitas. Escanea este código para ligar RentControl al celular de tu empresa. No cierres tu sesión en el celular físico o perderás la conexión.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 px-4 bg-slate-50 border border-slate-200 rounded-xl w-full">
            <div className="bg-indigo-100 text-indigo-600 p-4 rounded-full mb-4 shadow-inner">
               <MessageCircle className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Conectado a OmniChat</h3>
            <p className="text-slate-500 text-center max-w-md text-sm leading-relaxed">
              El ruteo local de WhatsApp Web (QR) ha sido deshabilitado. Todas las notificaciones de sistema ahora se enrutan de manera oficial y centralizada a través del ecosistema <strong>OmniChat M2M (Machine to Machine)</strong>.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-indigo-500" />
            <CardTitle>Conexión Resend (API de Correos)</CardTitle>
          </div>
          <CardDescription>
            Configura tu llave de acceso de Resend.com para inyectar correos globalmente mediante HTTP (Esquivando bloqueos portuarios de VPS).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="SMTP_PASS">Resend API Key</Label>
            <Input 
              id="SMTP_PASS" name="SMTP_PASS" type="password" placeholder="re_..." 
              value={formData.SMTP_PASS} onChange={handleChange}
            />
            <p className="text-xs text-slate-500">
              Es la llave secreta generada en tu panel de Resend (comienza usualmente con "re_"). Funciona inmediatamente una vez verificas tu dominio radiotecpro.com.
            </p>
          </div>
        </CardContent>
        <CardFooter className="bg-slate-50 border-t px-6 py-4 flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Guardar API Key
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
