"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Wifi, Zap, Shield, PhoneCall, ChevronRight, Check, Building2, Star, Target, CandlestickChart, Users, Wrench, MessageSquare, Calculator, Store, FileText, PieChart, PlayCircle, Receipt, Bot, User, ChevronDown } from "lucide-react";
import axios from "axios";

// Using native fetch or axios to the public endpoints.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function Home() {
  const [wispPlans, setWispPlans] = useState<any[]>([]);
  const [saasPlans, setSaasPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Lead Catch Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leadInterest, setLeadInterest] = useState("");
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadLoading, setLeadLoading] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'internet' | 'rentcontrol' | 'facturapro' | 'omnichat'>('internet');

  const rentControlImages = ["/images/demos/rentcontrol_1.png", "/images/demos/rentcontrol_2.png", "/images/demos/rentcontrol_3.png"];
  const facturaProImages = ["/images/demos/facturapro_1.png", "/images/demos/facturapro_2.png", "/images/demos/facturapro_3.png"];
  const omniChatImages = ["/images/demos/omnichat_1.png", "/images/demos/omnichat_2.png", "/images/demos/omnichat_3.png"];

  const ScreenshotCarousel = ({ images, title }: { images: string[], title: string }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
      const timer = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 4000); // 4 seconds per slide
      return () => clearInterval(timer);
    }, [images.length]);

    return (
      <div className="relative w-full aspect-video group cursor-pointer" onClick={() => setActiveImage(images[currentIndex])}>
        {/* Overlay Hover */}
        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-30 backdrop-blur-sm">
          <div className="bg-white text-slate-900 px-6 py-3 rounded-full font-bold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all shadow-xl">
            <PlayCircle className="w-5 h-5 text-indigo-600" /> Ampliar Galería
          </div>
        </div>
        
        {/* Images */}
        {images.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt={`${title} Screenshot ${idx + 1}`}
            className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-1000 ${idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          />
        ))}

        {/* Dots */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 z-20">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
              className={`w-2.5 h-2.5 rounded-full transition-all shadow-md ${idx === currentIndex ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'}`}
            />
          ))}
        </div>
      </div>
    );
  };

  const openLeadModal = (interest: string) => {
    setLeadInterest(interest);
    setIsModalOpen(true);
    setLeadSuccess(false);
    setLeadName("");
    setLeadPhone("");
  };

  const submitLeadWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadLoading(true);
    try {
      await axios.post("http://localhost:3002/api/inbox/webhooks/lead", { 
        name: leadName, 
        phone: leadPhone, 
        interest: leadInterest 
      });
      setLeadSuccess(true);
      setTimeout(() => setIsModalOpen(false), 4000);
    } catch (error) {
      console.error("OmniChat Matrix Fallback Triggered", error);
      // Fallback in case OmniChat is down: Open WhatsApp Directly
      window.open(`https://wa.me/526421644126?text=Hola,%20busco%20información%20sobre:%20${leadInterest}`, "_blank");
      setIsModalOpen(false);
    } finally {
      setLeadLoading(false);
    }
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, tabId: 'internet' | 'rentcontrol' | 'facturapro' | 'omnichat') => {
    e.preventDefault();
    setActiveTab(tabId);
    document.getElementById('ecosistema')?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const [wispRes, saasRes] = await Promise.all([
          axios.get(`${API_URL}/network-profiles/public`),
          axios.get(`${API_URL}/management-plans/public`)
        ]);
        
        // Sort WISP plans by price
        const sortedWisp = (wispRes.data || []).sort((a: any, b: any) => a.price - b.price);
        setWispPlans(sortedWisp);
        
        // Sort SaaS plans by fixedFee or commission
        const sortedSaas = (saasRes.data || []).sort((a: any, b: any) => a.fixedFee - b.fixedFee);
        setSaasPlans(sortedSaas);

      } catch (error) {
        console.error("Error fetching public plans:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-600 selection:text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <img src="/logo-transparent.png" alt="RadioTec Pro" className="h-[40px] sm:h-[50px] object-contain drop-shadow-sm" />
          </div>
          <div className="hidden lg:flex gap-8 text-sm font-medium text-slate-600">
            <a href="#ecosistema" onClick={(e) => handleNavClick(e, 'internet')} className="hover:text-blue-600 transition-colors cursor-pointer">Internet WISP</a>
            <a href="#ecosistema" onClick={(e) => handleNavClick(e, 'rentcontrol')} className="hover:text-blue-600 transition-colors cursor-pointer">RentControl API</a>
            <a href="#ecosistema" onClick={(e) => handleNavClick(e, 'facturapro')} className="hover:text-violet-600 font-bold text-violet-600 transition-colors inline-flex items-center gap-1 cursor-pointer"><Calculator className="w-4 h-4"/> FacturaPro ERP</a>
            <a href="#ecosistema" onClick={(e) => handleNavClick(e, 'omnichat')} className="hover:text-emerald-600 font-bold text-emerald-600 transition-colors inline-flex items-center gap-1 cursor-pointer"><MessageSquare className="w-4 h-4"/> OmniChat IA</a>
          </div>
          <div className="flex gap-2 sm:gap-4 items-center">
            <div className="relative group">
              <Button className="rounded-xl font-bold h-9 sm:h-10 px-4 sm:px-5 bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/20 gap-2">
                <User className="w-4 h-4 hidden sm:block" />
                Mi Cuenta
                <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform duration-200" />
              </Button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100 z-50 pt-2">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden py-2">
                  <a href="https://clientes.portalinternet.net/accounts/login/?next=/panel/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition-colors font-medium">
                    <Wifi className="w-4 h-4 text-blue-600" />
                    Portal WISP
                  </a>
                  <Link href="/login" className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 transition-colors font-medium">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    RentControl
                  </Link>
                  <div className="h-px bg-slate-100 my-1 mx-4"></div>
                  <a href="https://facturapro.radiotecpro.com/login" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 hover:bg-violet-50 text-slate-700 hover:text-violet-700 transition-colors font-medium">
                    <Calculator className="w-4 h-4 text-violet-600" />
                    FacturaPro ERP
                  </a>
                  <a href="https://omnichat.radiotecpro.com/login" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 transition-colors font-medium">
                    <Bot className="w-4 h-4 text-emerald-600" />
                    OmniChat IA
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>


      {/* Ecosistema MAJIA OS - Tabbed Interface (Main Hero) */}
      <section id="ecosistema" className="pt-24 pb-32 text-slate-50 relative overflow-hidden transition-colors duration-700" style={{ backgroundColor: activeTab === 'facturapro' ? '#f8fafc' : activeTab === 'omnichat' ? '#ffffff' : '#0f172a', color: activeTab === 'internet' || activeTab === 'rentcontrol' ? '#f8fafc' : '#0f172a' }}>
        
        {/* Dynamic Backgrounds */}
        {activeTab === 'internet' && <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>}
        {activeTab === 'internet' && <div className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 blur-3xl xl:-top-6 transition-opacity duration-1000"><div className="aspect-[1155/678] w-[72rem] bg-gradient-to-tr from-blue-600 to-indigo-600 opacity-30" style={{clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"}}></div></div>}
        
        {activeTab === 'rentcontrol' && <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-blue-900/20 opacity-50 transition-opacity duration-1000"></div>}
        {activeTab === 'facturapro' && (
          <>
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-violet-500/10 blur-3xl transition-opacity duration-1000"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-fuchsia-500/10 blur-3xl transition-opacity duration-1000"></div>
          </>
        )}
        {activeTab === 'omnichat' && <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 blur-3xl opacity-50 rounded-full transition-opacity duration-1000"></div>}

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          
          <div className="text-center mb-12">
            <div className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-bold mb-6 transition-colors ${activeTab === 'internet' ? 'border border-blue-500/30 bg-blue-500/10 text-blue-300' : activeTab === 'rentcontrol' ? 'border border-indigo-500/30 bg-indigo-500/10 text-indigo-300' : activeTab === 'facturapro' ? 'border border-violet-500/30 bg-violet-500/10 text-violet-700' : 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-700'}`}>
               Ecosistema MAJIA OS
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6">
              {activeTab === 'internet' ? 'Conectamos tu mundo.' : 'Un sistema para dominarlos a todos.'}
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${activeTab === 'internet' || activeTab === 'rentcontrol' ? 'text-slate-400' : 'text-slate-600'}`}>
              {activeTab === 'internet' ? 'RadioTec Pro ofrece Internet de Ultra Velocidad para tu hogar y el software más avanzado para tu empresa.' : 'Elige el módulo que necesitas hoy. Todos están interconectados bajo tu misma cuenta maestra.'}
            </p>
          </div>

          {/* Tabs Navigation (Segmented Control) */}
          <div className="max-w-5xl mx-auto mb-16">
            <div className={`p-1.5 sm:p-2 rounded-2xl sm:rounded-full flex flex-col sm:flex-row gap-2 sm:gap-0 transition-colors duration-700 shadow-xl ${activeTab === 'internet' || activeTab === 'rentcontrol' ? 'bg-slate-800/60 backdrop-blur-md border border-slate-700/50' : 'bg-slate-200/60 backdrop-blur-md border border-slate-300/50'}`}>
              
              <button 
                onClick={() => setActiveTab('internet')}
                className={`flex-1 px-4 py-3 sm:py-4 rounded-xl sm:rounded-full font-bold transition-all flex justify-center items-center gap-2 text-sm sm:text-base ${activeTab === 'internet' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-100 sm:scale-105' : activeTab === 'rentcontrol' ? 'text-slate-400 hover:text-white hover:bg-slate-700/50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-300/50'}`}
              >
                <Wifi className="w-5 h-5" /> Internet WISP
              </button>
              
              <button 
                onClick={() => setActiveTab('rentcontrol')}
                className={`flex-1 px-4 py-3 sm:py-4 rounded-xl sm:rounded-full font-bold transition-all flex justify-center items-center gap-2 text-sm sm:text-base ${activeTab === 'rentcontrol' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-100 sm:scale-105' : activeTab === 'internet' ? 'text-slate-400 hover:text-white hover:bg-slate-700/50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-300/50'}`}
              >
                <Building2 className="w-5 h-5" /> RentControl
              </button>

              <button 
                onClick={() => setActiveTab('facturapro')}
                className={`flex-1 px-4 py-3 sm:py-4 rounded-xl sm:rounded-full font-bold transition-all flex justify-center items-center gap-2 text-sm sm:text-base ${activeTab === 'facturapro' ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30 scale-100 sm:scale-105' : activeTab === 'internet' || activeTab === 'rentcontrol' ? 'text-slate-400 hover:text-white hover:bg-slate-700/50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-300/50'}`}
              >
                <Receipt className="w-5 h-5" /> FacturaPro
              </button>

              <button 
                onClick={() => setActiveTab('omnichat')}
                className={`flex-1 px-4 py-3 sm:py-4 rounded-xl sm:rounded-full font-bold transition-all flex justify-center items-center gap-2 text-sm sm:text-base ${activeTab === 'omnichat' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-100 sm:scale-105' : activeTab === 'internet' || activeTab === 'rentcontrol' ? 'text-slate-400 hover:text-white hover:bg-slate-700/50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-300/50'}`}
              >
                <Bot className="w-5 h-5" /> OmniChat
              </button>
            </div>
          </div>

          <div className="min-h-[600px] relative">
            
            {/* Internet WISP Content */}
            {activeTab === 'internet' && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center mb-16">
                  <h3 className="text-3xl md:text-4xl font-black text-white sm:text-4xl">Internet de Otra Galaxia</h3>
                  <p className="mt-4 text-lg text-slate-400">Alta velocidad, estabilidad para el trabajo y soporte local inigualable.</p>
                </div>
                <div className="grid gap-12 md:grid-cols-3 mb-24">
                  <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-slate-800/50 backdrop-blur-md border border-slate-700 transition-transform hover:-translate-y-2">
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-400">
                      <Zap className="h-8 w-8" />
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-white">Velocidad Extrema</h3>
                    <p className="text-slate-400">Diseñado para Gaming, Streaming HD y Trabajo Híbrido sin interrupciones.</p>
                  </div>
                  <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-slate-800/50 backdrop-blur-md border border-slate-700 transition-transform hover:-translate-y-2">
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400">
                      <Shield className="h-8 w-8" />
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-white">Estabilidad Asegurada</h3>
                    <p className="text-slate-400">Red Mikrotik de grado empresarial que garantiza 99.9% de Uptime sin cortes.</p>
                  </div>
                  <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-slate-800/50 backdrop-blur-md border border-slate-700 transition-transform hover:-translate-y-2">
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/20 text-teal-400">
                      <Target className="h-8 w-8" />
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-white">Instalación Rápida</h3>
                    <p className="text-slate-400">Agenda tu instalación el mismo día. Instalamos, probamos y empiezas a navegar.</p>
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-3xl font-black text-white mb-12">Planes Residenciales</h3>
                  {loading ? (
                    <div className="flex justify-center p-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                  ) : wispPlans.length === 0 ? (
                    <div className="text-slate-400 bg-slate-800/50 p-8 rounded-2xl shadow-sm max-w-lg mx-auto border border-slate-700">
                      Por el momento estamos actualizando nuestros paquetes. ¡Contacta por WhatsApp!
                    </div>
                  ) : (
                    <div className="grid gap-8 md:grid-cols-3 lg:gap-12 max-w-6xl mx-auto items-center">
                      {wispPlans.map((plan, index) => {
                        const isPopular = index === 1 || wispPlans.length === 1;
                        
                        return (
                          <div key={plan.id} className={`flex flex-col text-left rounded-3xl ${isPopular ? 'border-2 border-blue-500 bg-slate-800 shadow-2xl relative scale-105 z-10' : 'border border-slate-700 bg-slate-800/50 shadow-lg transition-all hover:shadow-xl'}`}>
                            {isPopular && (
                              <div className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-sm font-bold text-white uppercase tracking-wider">
                                Más Popular
                              </div>
                            )}
                            <h3 className={`text-xl font-bold mb-4 ${isPopular ? 'text-blue-400' : 'text-white'}`}>
                              {index === 0 ? '🏠 ' : index === 1 ? '🚀 ' : '🎮 '} {plan.name}
                            </h3>
                            <div className="flex items-baseline text-5xl font-black text-white">
                              ${plan.price} <span className="ml-1 text-xl font-medium text-slate-400">/mes</span>
                            </div>
                            <ul className="mt-8 space-y-4 text-slate-300 flex-1">
                              <li className="flex items-center gap-3"><Check className="h-5 w-5 text-blue-500" /> <strong className="text-white">{plan.downloadSpeed} Megas</strong> de Bajada</li>
                              <li className="flex items-center gap-3"><Check className="h-5 w-5 text-blue-500" /> <strong className="text-white">{plan.uploadSpeed} Megas</strong> de Subida</li>
                              <li className="flex items-center gap-3"><Check className="h-5 w-5 text-blue-500" /> Dispositivos recomendados: {plan.downloadSpeed > 30 ? 'Ilimitados' : '1 a 3'}</li>
                            </ul>
                            <Button 
                              onClick={() => openLeadModal(`Plan Internet WISP: ${plan.name}`)}
                              className={`mt-8 w-full h-12 rounded-xl font-bold text-lg ${isPopular ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                            >
                              Me Interesa
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* RentControl Content */}
            {activeTab === 'rentcontrol' && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                  <div>
                    <h3 className="text-3xl md:text-4xl font-black tracking-tight mb-6 text-white">El fin de los cobros en Excel.</h3>
                    <p className="text-lg text-slate-400 mb-8 max-w-xl">
                      RentControl es la plataforma en la nube que automatiza la cobranza, facturación y gestión operativa de tus locales, departamentos y plazas comerciales.
                    </p>
                    <div className="space-y-6 mb-12">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 mt-1"><CandlestickChart className="h-6 w-6 text-indigo-400" /></div>
                        <div>
                          <h4 className="text-xl font-bold text-white">Transparencia Financiera</h4>
                          <p className="text-slate-400 mt-1">Dashboards en tiempo real con Utilidad Neta, Cartera Vencida y Retorno de Inversión por cada una de tus propiedades.</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 mt-1"><Building2 className="h-6 w-6 text-orange-400" /></div>
                        <div>
                          <h4 className="text-xl font-bold text-white">Sistema de Gestión Delegada (Agencia)</h4>
                          <p className="text-slate-400 mt-1">¿No tienes tiempo? Asignamos un Gestor Operativo a tu cartera inmobiliaria. Tú solo revisas las métricas mientras nosotros reparamos, cobramos y depositamos a tu cuenta.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="rounded-xl overflow-hidden shadow-2xl border border-slate-700/50 bg-slate-900 ring-4 ring-indigo-500/10 mb-8">
                      <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center gap-2 relative z-10">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-xs text-slate-400 ml-2 font-medium">RentControl Dashboard</span>
                      </div>
                      <ScreenshotCarousel images={rentControlImages} title="RentControl" />
                    </div>
                    <Button onClick={() => openLeadModal("Afiliación Software RentControl SaaS")} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-indigo-600/30">
                      Solicitar Afiliación / Cotización
                    </Button>
                  </div>
                </div>

                {/* CTA Técnicos (Only visible in RentControl) */}
                <div className="mt-24 relative overflow-hidden rounded-3xl bg-indigo-600/20 border border-indigo-500/30 backdrop-blur-md shadow-2xl">
                  <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat"></div>
                  <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex-1 text-center md:text-left">
                      <div className="inline-flex items-center rounded-full bg-indigo-500/40 px-3 py-1 text-sm text-indigo-100 mb-6 font-semibold">
                        Bolsa de Trabajo & Red de Aliados
                      </div>
                      <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                        ¿Eres Técnico, Plomero o Electricista?
                      </h2>
                      <p className="text-indigo-100 text-lg max-w-xl mx-auto md:mx-0">
                        Únete a la red oficial de proveedores de RentControl. Nuestros Gestores generan <strong>decenas de tickets de servicio mensuales</strong> en múltiples propiedades, y estamos buscando equipos de primer nivel para cubrirlos.
                      </p>
                      <ul className="mt-6 flex flex-col md:flex-row gap-4 md:gap-8 justify-center md:justify-start text-indigo-50 font-medium">
                        <li className="flex items-center justify-center md:justify-start gap-2">
                          <Wrench className="h-5 w-5 text-indigo-300" />
                          Trabajo constante garantizado
                        </li>
                        <li className="flex items-center justify-center md:justify-start gap-2">
                          <Shield className="h-5 w-5 text-indigo-300" />
                          Pagos directos por RentControl
                        </li>
                      </ul>
                    </div>
                    <div className="shrink-0 w-full md:w-auto mt-6 md:mt-0">
                      <Button 
                        onClick={() => openLeadModal("Vacante Red de Técnicos RentControl")}
                        className="w-full md:w-auto h-12 px-8 rounded-xl bg-white text-indigo-900 hover:bg-slate-100 font-bold text-sm shadow-lg shadow-indigo-900/20 active:scale-95 transition-transform"
                      >
                        Postularme como Proveedor
                      </Button>
                    </div>
                  </div>
                </div>

              </div>
            )}


            {/* FacturaPro Content */}
            {activeTab === 'facturapro' && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 text-slate-900">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                  <div className="order-2 lg:order-1">
                    <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-white ring-4 ring-violet-500/10 mb-8">
                      <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center gap-2 relative z-10">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        <span className="text-xs text-slate-500 ml-2 font-medium">FacturaPro ERP</span>
                      </div>
                      <ScreenshotCarousel images={facturaProImages} title="FacturaPro" />
                    </div>
                  </div>
                  
                  <div className="order-1 lg:order-2">
                    <h3 className="text-3xl md:text-4xl font-black mb-6">El monstruo financiero para tu empresa.</h3>
                    <p className="text-lg text-slate-600 mb-8">
                      FacturaPro es un ERP de clase mundial diseñado para automatizar tu nómina, timbrado SAT CFDI 4.0, inventarios y finanzas en una sola plataforma en la nube.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-6 mb-10">
                      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                        <div className="w-10 h-10 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center mb-3">
                          <FileText className="h-5 w-5" />
                        </div>
                        <h4 className="font-bold mb-1">Timbrado CFDI 4.0</h4>
                        <p className="text-slate-500 text-xs">Emite facturas y complementos en regla con el SAT.</p>
                      </div>
                      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                        <div className="w-10 h-10 bg-fuchsia-100 text-fuchsia-600 rounded-xl flex items-center justify-center mb-3">
                          <Users className="h-5 w-5" />
                        </div>
                        <h4 className="font-bold mb-1">Motor de Nómina</h4>
                        <p className="text-slate-500 text-xs">Calcula sueldos y dispersa pagos a empleados.</p>
                      </div>
                    </div>
                    
                    <Button onClick={() => openLeadModal("Demostración FacturaPro ERP")} className="w-full bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-600/30 font-bold h-12 rounded-xl text-md">
                      Agendar Demostración ERP
                    </Button>
                  </div>
                </div>
              </div>
            )}



            {/* OmniChat Content */}
            {activeTab === 'omnichat' && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 text-slate-900">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                  <div>
                    <h3 className="text-3xl md:text-4xl font-black tracking-tight mb-6 text-slate-900">Vende, cobra y soporta mientras duermes.</h3>
                    <p className="text-lg text-slate-600 mb-8 max-w-xl">
                      Olvídate de responder el mismo mensaje "Info" 100 veces al día. OmniChat integra la cobranza de RentControl en un cerebro automatizado por IA que trabaja 24/7.
                    </p>
                    
                    <div className="space-y-6 mb-12">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 mt-1"><Target className="h-6 w-6 text-emerald-500" /></div>
                        <div>
                          <h4 className="text-xl font-bold text-slate-900">Lectura de Intención Exacta</h4>
                          <p className="text-slate-600 mt-1">El motor detecta si el usuario quiere rentar o reportar un lavabo roto, aplicando flujos de IA nativos.</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 mt-1"><Building2 className="h-6 w-6 text-indigo-500" /></div>
                        <div>
                          <h4 className="text-xl font-bold text-slate-900">Catálogo M2M Extendido</h4>
                          <p className="text-slate-600 mt-1">Sincronización directa con RentControl. Informa precios y unidades disponibles sin que abras tu laptop.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative">
                     <div className="w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-white ring-4 ring-emerald-500/10 mb-8">
                        <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center gap-2 relative z-10">
                          <div className="w-3 h-3 rounded-full bg-red-400"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                          <div className="w-3 h-3 rounded-full bg-green-400"></div>
                          <span className="text-xs text-slate-500 ml-2 font-medium">Consola OmniChat</span>
                        </div>
                        <ScreenshotCarousel images={omniChatImages} title="OmniChat" />
                     </div>
                     <Button onClick={() => openLeadModal("Demostración OmniChat AI")} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 font-bold h-12 rounded-xl text-md">
                        Solicitar Acceso a OmniChat
                     </Button>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </section>



      {/* Testimonials */}
      <section id="testimonios" className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900">Lo que dicen nuestros clientes</h2>
            <p className="mt-4 text-lg text-slate-600">Familias y empresas que confían en RadioTec Pro todos los días.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="flex text-amber-400 mb-4">
                <Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" />
              </div>
              <p className="text-slate-700 italic mb-6">"El internet es súper estable, desde que me cambié a RadioTec ya no sufro en mis videollamadas de trabajo. La instalación fue muy rápida."</p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">ML</div>
                <div>
                  <h5 className="font-bold text-slate-900 text-sm">María López</h5>
                  <p className="text-xs text-slate-500">Plan Familiar</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="flex text-amber-400 mb-4">
                <Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" />
              </div>
              <p className="text-slate-700 italic mb-6">"Dejé de pelearme con mis inquilinos por los pagos. La plataforma de RentControl me avisa quién pagó y la agencia se encarga de ir a cobrar."</p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold">RO</div>
                <div>
                  <h5 className="font-bold text-slate-900 text-sm">Roberto Ortiz</h5>
                  <p className="text-xs text-slate-500">Propietario (Plaza Centro)</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="flex text-amber-400 mb-4">
                <Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" />
              </div>
              <p className="text-slate-700 italic mb-6">"Pude integrar el cobro del internet directo en la renta de mis cuartos para estudiantes. Es una maravilla tener todo centralizado."</p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">SF</div>
                <div>
                  <h5 className="font-bold text-slate-900 text-sm">Sofía Félix</h5>
                  <p className="text-xs text-slate-500">Inversionista</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CCTA & Footer */}
      <footer id="contacto" className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-4 lg:grid-cols-5">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6 bg-white p-3 rounded-xl w-fit shadow-lg">
                <img src="/logo-transparent.png" alt="RadioTec Pro" className="h-[36px] sm:h-[48px] object-contain" />
              </div>
              <p className="max-w-md mb-6">Integrando conectividad de ultra alta velocidad con inteligencia de negocios inmobiliarios.</p>
              <div className="flex items-center gap-4">
                <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                  <PhoneCall className="h-4 w-4 mr-2" />
                  642 104 2123
                </Button>
              </div>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Servicios</h4>
              <ul className="space-y-3">
                <li><Link href="#internet" className="hover:text-blue-400 transition-colors">Internet WISP</Link></li>
                <li><Link href="#internet" className="hover:text-blue-400 transition-colors">Enlaces Dedicados</Link></li>
                <li><Link href="#gestion" className="hover:text-blue-400 transition-colors">Agencia de Gestión</Link></li>
                <li><Link href="#gestion" className="hover:text-blue-400 transition-colors">SaaS RentControl</Link></li>
                <li><Link href="#facturapro" className="hover:text-violet-400 transition-colors font-bold">FacturaPro ERP</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Portales</h4>
              <ul className="space-y-3">
                <li><a href="https://clientes.portalinternet.net/accounts/login/?next=/panel/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">Portal de Clientes WISP</a></li>
                <li><Link href="/login" className="hover:text-blue-400 transition-colors">Acceso RentControl Nube</Link></li>
                <li><a href="https://facturapro.radiotecpro.com/login" target="_blank" rel="noopener noreferrer" className="hover:text-violet-400 transition-colors">Consola FacturaPro ERP</a></li>
                <li><a href="https://omnichat.radiotecpro.com/login" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors font-bold">Consola OmniChat IA</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Aviso de Privacidad</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Términos y Condiciones</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>&copy; {new Date().getFullYear()} MAJIA OS Corp. Todos los derechos reservados.</p>
            <p className="text-slate-500">Hecho con ❤️ por Grupo Hurtado.</p>
          </div>
        </div>
      </footer>

      {/* Headless WA Lead Capture Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 transition-all backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 my-auto">
            {leadSuccess ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 font-bold" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">¡Solicitud Recibida!</h3>
                <p className="text-sm text-slate-600 font-medium">
                  Revisa tu WhatsApp. Nuestro asesor virtual <strong>OmniChat</strong> te ha enviado los detalles.
                </p>
              </div>
            ) : (
              <form onSubmit={submitLeadWebhook}>
                <div className="bg-slate-900 px-6 py-4 flex justify-between items-center relative overflow-hidden">
                  <div>
                    <h3 className="text-lg font-bold text-white relative z-10">Quiero Información</h3>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Interés Muestra</label>
                    <div className="bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2 rounded-lg font-medium text-xs">
                      {leadInterest}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Nombre Completo</label>
                    <input 
                      required
                      type="text" 
                      value={leadName}
                      onChange={e => setLeadName(e.target.value)}
                      placeholder="Ej. Juan Pérez" 
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Celular (WhatsApp)</label>
                    <input 
                      required
                      type="tel" 
                      value={leadPhone}
                      onChange={e => setLeadPhone(e.target.value)}
                      placeholder="Ej. 642 123 4567" 
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsModalOpen(false)}
                      className="w-full sm:w-1/3 h-10 rounded-lg font-semibold"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={leadLoading || !leadName || !leadPhone}
                      className="w-full sm:w-2/3 h-10 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-bold"
                    >
                      {leadLoading ? 'Conectando...' : 'Iniciar Conversación'}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Video Lightbox Modal (Now used for Images) */}
      {activeImage && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 p-4 transition-all backdrop-blur-md" onClick={() => setActiveImage(null)}>
          <div className="relative w-full max-w-6xl animate-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setActiveImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-slate-300 font-bold flex items-center gap-2"
            >
              Cerrar <span className="text-2xl">&times;</span>
            </button>
            <div className="rounded-xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-900">
              <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <img src={activeImage} alt="Fullscreen View" className="w-full object-contain max-h-[85vh] mx-auto" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
