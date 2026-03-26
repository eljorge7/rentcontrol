"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, Save, CreditCard, ShieldCheck } from "lucide-react";
import api from "@/lib/api";

export function SystemSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    STRIPE_SECRET_KEY: "",
    STRIPE_WEBHOOK_SECRET: "",
    MERCADOPAGO_ACCESS_TOKEN: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings');
      if (res.data) {
        setFormData({
          STRIPE_SECRET_KEY: res.data.STRIPE_SECRET_KEY || "",
          STRIPE_WEBHOOK_SECRET: res.data.STRIPE_WEBHOOK_SECRET || "",
          MERCADOPAGO_ACCESS_TOKEN: res.data.MERCADOPAGO_ACCESS_TOKEN || "",
        });
      }
    } catch (error) {
      console.error("Error cargando configuraciones:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.post('/settings/bulk', formData);
      alert('Configuraciones guardadas correctamente.');
    } catch (error) {
      console.error("Error guardando configuraciones:", error);
      alert('Hubo un error al guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-indigo-500" />
            <CardTitle>Stripe (Pagos Internacionales)</CardTitle>
          </div>
          <CardDescription>
            Configura las llaves secretas para cobrar con tarjetas de crédito/débito y recibir notificaciones automáticas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="STRIPE_SECRET_KEY">Secret Key (sk_live_... / sk_test_...)</Label>
            <Input 
              id="STRIPE_SECRET_KEY" 
              name="STRIPE_SECRET_KEY"
              type="password"
              placeholder="Ej: sk_live_51..." 
              value={formData.STRIPE_SECRET_KEY}
              onChange={handleChange}
            />
            <p className="text-xs text-slate-500">Llave secreta provista en el Dashboard de Stripe.</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="STRIPE_WEBHOOK_SECRET">Webhook Secret (whsec_...)</Label>
            <Input 
              id="STRIPE_WEBHOOK_SECRET" 
              name="STRIPE_WEBHOOK_SECRET"
              type="password"
              placeholder="Ej: whsec_..." 
              value={formData.STRIPE_WEBHOOK_SECRET}
              onChange={handleChange}
            />
            <p className="text-xs text-slate-500">
              Llave secreta para firmar los webhooks en el endpoint <span className="font-mono bg-slate-100 px-1 rounded">/api/stripe/webhook</span>.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#009ee3]" />
            <CardTitle>Mercado Pago (Pagos Locales / Transferencias)</CardTitle>
          </div>
          <CardDescription>
            Configura el token de acceso para cobrar vía Mercado Pago (Tarjetas, Efectivo y Transferencias).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="MERCADOPAGO_ACCESS_TOKEN">Access Token (APP_USR-... / TEST-...)</Label>
            <Input 
              id="MERCADOPAGO_ACCESS_TOKEN" 
              name="MERCADOPAGO_ACCESS_TOKEN"
              type="password"
              placeholder="Ej: APP_USR-..." 
              value={formData.MERCADOPAGO_ACCESS_TOKEN}
              onChange={handleChange}
            />
            <p className="text-xs text-slate-500">Credencial de producción o prueba de Mercado Pago.</p>
          </div>
        </CardContent>
        <CardFooter className="bg-slate-50 border-t px-6 py-4 flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Guardar Cambios
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
