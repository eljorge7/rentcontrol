"use client";

import { useEffect, useState } from "react";
import { X, Download } from "lucide-react";

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detect if already installed / standalone
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    setIsStandalone(isPWA);

    if (isPWA) return;

    // Detect iOS
    const ua = window.navigator.userAgent;
    const isIosDevice = /iphone|ipad|ipod/.test(ua.toLowerCase());
    setIsIOS(isIosDevice);

    // Prompt for Android / Chrome
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Show manual prompt for iOS after a few seconds
    if (isIosDevice) {
      const iosTimeout = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(iosTimeout);
    }

    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 z-50 animate-in slide-in-from-bottom-5 duration-500">
      <div className="bg-indigo-600 text-white rounded-2xl shadow-2xl p-4 flex items-center justify-between gap-4 max-w-md mx-auto relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
          <Download className="w-32 h-32 -mt-10 -mr-10" />
        </div>
        
        <div className="flex-1 relative z-10">
          <h3 className="font-bold text-lg leading-tight mb-1">Instala la App Oficial</h3>
          {isIOS ? (
            <p className="text-sm text-indigo-100 font-medium">Toca <span className="inline-block p-1 bg-white/20 rounded mx-1"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L8 6h3v7h2V6h3L12 2zm-7 9v11h14V11h-2v9H7v-9H5z" /></svg></span> y luego <strong>"Añadir a inicio"</strong> para pagar más rápido.</p>
          ) : (
            <p className="text-sm text-indigo-100 font-medium">Instala en tu pantalla y entra sin usar el navegador web.</p>
          )}
        </div>

        <div className="flex items-center gap-3 relative z-10">
          {!isIOS && (
            <button 
              onClick={handleInstallClick}
              className="bg-white text-indigo-600 font-bold px-4 py-2 rounded-xl text-sm shadow-sm hover:bg-slate-50 transition-colors"
            >
              Instalar
            </button>
          )}
          <button 
            onClick={() => setShowPrompt(false)}
            className="text-indigo-200 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors shrink-0"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
