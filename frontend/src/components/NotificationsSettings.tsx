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
    try {
      const res = await api.get('/notifications/whatsapp/status');
      setWpStatus(res.data);
    } catch (e) {
      console.error("No se pudo obtener el status de whatsapp");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.post('/settings/bulk', formData);
      alert('Configuraciones SMTP Guardadas Exitosamente.');
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
        <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
          
          {wpStatus.isReady ? (
            <div className="flex flex-col items-center justify-center space-y-3 p-8 bg-emerald-50 border border-emerald-100 rounded-xl w-full">
              <CheckCircle2 className="h-16 w-16 text-emerald-500" />
              <h3 className="text-xl font-bold text-emerald-800">WhatsApp Conectado</h3>
              <p className="text-emerald-600 text-center max-w-sm">
                El motor de notificaciones está enviando mensajes activamente con tu cuenta afiliada.
              </p>
            </div>
          ) : wpStatus.qrCode ? (
            <div className="flex flex-col items-center space-y-4 p-8 bg-white border border-slate-200 rounded-xl shadow-sm">
              <div className="bg-white p-4 rounded-lg shadow-inner border border-slate-100">
                <QRCodeSVG value={wpStatus.qrCode} size={250} />
              </div>
              <p className="text-slate-600 font-medium animate-pulse flex items-center">
                <RefreshCw className="h-4 w-4 mr-2 animate-spin text-slate-400" />
                Esperando escaneo desde tu celular...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-3 p-12 bg-slate-50 border border-slate-200 rounded-xl w-full border-dashed">
              <Loader2 className="h-10 w-10 text-slate-400 animate-spin" />
              <p className="text-slate-500 text-sm">Generando sesión criptográfica QR...</p>
            </div>
          )}

        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-indigo-500" />
            <CardTitle>Credenciales de Envío Email (SMTP)</CardTitle>
          </div>
          <CardDescription>
            Configura las llaves de tu proveedor de correos (Gmail, Outlook, Hostinger) para enviar recibos en PDF.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="SMTP_HOST">Servidor SMTP</Label>
              <Input 
                id="SMTP_HOST" name="SMTP_HOST" placeholder="Ej: smtp.gmail.com" 
                value={formData.SMTP_HOST} onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="SMTP_PORT">Puerto</Label>
              <Input 
                id="SMTP_PORT" name="SMTP_PORT" placeholder="Ej: 587 o 465" 
                value={formData.SMTP_PORT} onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="SMTP_USER">Correo Electrónico Emisor</Label>
            <Input 
              id="SMTP_USER" name="SMTP_USER" placeholder="Ej: admin@radiotecpro.com" 
              value={formData.SMTP_USER} onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="SMTP_PASS">Contraseña o App Password</Label>
            <Input 
              id="SMTP_PASS" name="SMTP_PASS" type="password" placeholder="Tu contraseña secreta" 
              value={formData.SMTP_PASS} onChange={handleChange}
            />
            <p className="text-xs text-slate-500">
              Si usas Gmail, asegúrate de generar una 'App Password' en la configuración de seguridad de Google.
            </p>
          </div>
        </CardContent>
        <CardFooter className="bg-slate-50 border-t px-6 py-4 flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Guardar SMTP
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
