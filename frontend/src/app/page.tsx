"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Wifi, Zap, Shield, PhoneCall, ChevronRight, Check, Building2, Star, Target, CandlestickChart, Users, Wrench } from "lucide-react";
import axios from "axios";

// Using native fetch or axios to the public endpoints.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function Home() {
  const [wispPlans, setWispPlans] = useState<any[]>([]);
  const [saasPlans, setSaasPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
            <Link href="#internet" className="hover:text-blue-600 transition-colors">Internet WISP</Link>
            <Link href="#gestion" className="hover:text-blue-600 transition-colors">Gestión RentControl</Link>
            <Link href="#proveedores" className="hover:text-blue-600 transition-colors">Para Técnicos</Link>
          </div>
          <div className="flex gap-4 items-center">
            <a href="https://clientes.portalinternet.net/accounts/login/?next=/panel/" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="hidden sm:flex border-blue-200 text-blue-700 hover:bg-blue-50">
                Portal WISP
              </Button>
            </a>
            <Link href="/login" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-10 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/20">
              <Building2 className="mr-2 h-4 w-4" />
              Acceso a la Nube
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 pt-20 pb-28 lg:pt-32 lg:pb-40">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 blur-3xl xl:-top-6">
          <div className="aspect-[1155/678] w-[72rem] bg-gradient-to-tr from-blue-600 to-indigo-600 opacity-30" style={{clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"}}></div>
        </div>
        
        <div className="container relative mx-auto px-4 text-center md:px-6">
          <div className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm text-blue-300 mb-8 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
            Líderes tecnológicos en Navojoa
          </div>
          <h1 className="mx-auto max-w-4xl text-5xl font-black tracking-tight text-white sm:text-7xl mb-6">
            Conectamos tu mundo. <br className="hidden md:block"/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Administramos tus rentas.</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-300 mb-10">
            RadioTec Pro ofrece Internet de Ultra Velocidad para tu hogar y la plataforma de gestión inmobiliaria más avanzada del mercado para tus locales y departamentos.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="#internet" className="w-full sm:w-auto">
              <Button size="lg" className="w-full h-14 px-8 text-lg bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-900/50">
                <Wifi className="mr-2 h-5 w-5" /> Planes de Internet
              </Button>
            </Link>
            <Link href="#gestion" className="w-full sm:w-auto">
              <Button size="lg" className="w-full h-14 px-8 text-lg bg-white text-slate-900 hover:bg-slate-100">
                <Building2 className="mr-2 h-5 w-5" /> Gestión Inmobiliaria
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Propuesta de Valor Internet */}
      <section id="internet" className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 sm:text-4xl">Internet de Otra Galaxia</h2>
            <p className="mt-4 text-lg text-slate-600">Alta velocidad, estabilidad para el trabajo y soporte local inigualable.</p>
          </div>
          <div className="grid gap-12 md:grid-cols-3">
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 border border-slate-100 transition-transform hover:-translate-y-2">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">Velocidad Extrema</h3>
              <p className="text-slate-600">Diseñado para Gaming, Streaming HD y Trabajo Híbrido sin interrupciones.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 border border-slate-100 transition-transform hover:-translate-y-2">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">Estabilidad Asegurada</h3>
              <p className="text-slate-600">Red Mikrotik de grado empresarial que garantiza 99.9% de Uptime sin cortes.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 border border-slate-100 transition-transform hover:-translate-y-2">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-100 text-teal-600">
                <Target className="h-8 w-8" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">Instalación Rápida</h3>
              <p className="text-slate-600">Agenda tu instalación el mismo día. Instalamos, probamos y empiezas a navegar.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing WISP Dinamyc */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-black text-slate-900 mb-12">Nuestros Planes Residenciales</h2>
          
          {loading ? (
             <div className="flex justify-center p-12">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
             </div>
          ) : wispPlans.length === 0 ? (
             <div className="text-slate-500 bg-white p-8 rounded-2xl shadow-sm max-w-lg mx-auto border border-slate-200">
               Por el momento estamos actualizando nuestros paquetes. ¡Contacta por WhatsApp!
             </div>
          ) : (
             <div className="grid gap-8 md:grid-cols-3 lg:gap-12 max-w-6xl mx-auto items-center">
               {wispPlans.map((plan, index) => {
                 const isPopular = index === 1 || wispPlans.length === 1; // Highlight the middle one if 3 exist
                 
                 return (
                   <div key={plan.id} className={`flex flex-col text-left rounded-3xl ${isPopular ? 'border-2 border-blue-600 bg-white p-8 shadow-xl relative scale-105 z-10' : 'border border-slate-200 bg-white p-8 shadow-sm transition-all hover:shadow-lg'}`}>
                     {isPopular && (
                       <div className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-sm font-bold text-white uppercase tracking-wider">
                         Más Popular
                       </div>
                     )}
                     <h3 className={`text-xl font-bold mb-4 ${isPopular ? 'text-blue-600' : 'text-slate-900'}`}>
                       {index === 0 ? '🏠 ' : index === 1 ? '🚀 ' : '🎮 '} {plan.name}
                     </h3>
                     <div className="flex items-baseline text-5xl font-black text-slate-900">
                       ${plan.price} <span className="ml-1 text-xl font-medium text-slate-500">/mes</span>
                     </div>
                     <ul className="mt-8 space-y-4 text-slate-600 flex-1">
                       <li className="flex items-center gap-3"><Check className="h-5 w-5 text-blue-600" /> <strong className="text-slate-900">{plan.downloadSpeed} Megas</strong> de Bajada</li>
                       <li className="flex items-center gap-3"><Check className="h-5 w-5 text-blue-600" /> <strong className="text-slate-900">{plan.uploadSpeed} Megas</strong> de Subida</li>
                       <li className="flex items-center gap-3"><Check className="h-5 w-5 text-blue-600" /> Dispositivos recomendados: {plan.downloadSpeed > 30 ? 'Ilimitados' : '1 a 3'}</li>
                     </ul>
                     <a href={`https://wa.me/526421042123?text=Quiero%20contratar%20el%20plan%20${plan.name}`} target="_blank" rel="noopener noreferrer">
                       <Button className={`mt-8 w-full h-12 rounded-xl text-lg ${isPopular ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/25' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                         Contratar
                       </Button>
                     </a>
                   </div>
                 );
               })}
             </div>
          )}
        </div>
      </section>

      {/* Propuesta de Valor RentControl */}
      <section id="gestion" className="py-24 bg-slate-900 text-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-sm text-indigo-300 mb-6">
                Para Administradores e Inversionistas
              </div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">El fin de los cobros en Excel.</h2>
              <p className="text-lg text-slate-400 mb-8 max-w-xl">
                RentControl es la plataforma en la nube que automatiza la cobranza, facturación y gestión operativa de tus locales, departamentos y plazas comerciales.
              </p>
              
              <div className="space-y-6">
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
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 blur-3xl opacity-20 rounded-full"></div>
              <div className="relative rounded-2xl bg-slate-800 border border-slate-700 p-8 shadow-2xl">
                <h3 className="text-2xl font-bold mb-6 text-center">Planes RentControl SaaS</h3>
                
                <div className="space-y-4 mb-8">
                  {loading ? (
                    <div className="p-8 text-center text-slate-500">Cargando planes...</div>
                  ) : saasPlans.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 border border-slate-700 rounded-xl">Próximamente...</div>
                  ) : (
                    saasPlans.slice(0, 3).map((plan, i) => (
                      <div key={plan.id} className={i % 2 === 0 ? "bg-slate-900 border border-slate-700 p-5 rounded-xl" : "bg-gradient-to-br from-indigo-900/50 to-blue-900/50 border border-indigo-500/50 p-5 rounded-xl"}>
                        <div className="flex justify-between items-center mb-2">
                          <span className={`font-bold text-lg ${i % 2 !== 0 ? 'text-white' : ''}`}>{plan.name}</span>
                          <span className={`font-black text-xl ${i % 2 !== 0 ? 'text-indigo-400' : 'text-blue-400'}`}>
                            {plan.fixedFee > 0 ? `$${plan.fixedFee}` : `${plan.commission}%`}
                            <span className={`text-sm font-normal ${i % 2 !== 0 ? 'text-slate-400' : 'text-slate-500'}`}>
                              {plan.fixedFee > 0 ? '/mo' : ' comisión'}
                            </span>
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 mb-3">{plan.description}</p>
                        <ul className="text-sm text-slate-300 space-y-1">
                          <li className="flex items-center gap-2">
                            <Check className={`h-4 w-4 ${i % 2 !== 0 ? 'text-indigo-400' : 'text-emerald-400'}`}/> 
                            Hasta {plan.maxProperties} Propiedad{plan.maxProperties > 1 ? 'es' : ''}
                          </li>
                        </ul>
                      </div>
                    ))
                  )}
                </div>
                
                <a href="https://wa.me/526421042123?text=Quiero%20información%20sobre%20Planes%20RentControl" target="_blank" rel="noopener noreferrer">
                  <Button className="w-full bg-white text-slate-900 hover:bg-slate-200 h-12 text-md font-bold">Solicitar Afiliación / Cotización</Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Técnicos */}
      <section id="proveedores" className="py-20 bg-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat"></div>
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-indigo-900/30 p-8 md:p-12 rounded-3xl border border-indigo-500/30 backdrop-blur-md shadow-2xl">
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
              <a href="https://wa.me/526421042123?text=Hola,%20soy%20Técnico/Proveedor%20y%20me%20interesa%20unirme%20a%20la%20red%20de%20RentControl" target="_blank" rel="noopener noreferrer">
                <Button className="w-full md:w-auto h-16 px-10 rounded-2xl bg-white text-indigo-900 hover:bg-slate-100 font-bold text-lg shadow-xl shadow-indigo-900/20 active:scale-95 transition-transform">
                  Postularme como Proveedor
                </Button>
              </a>
            </div>
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
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Portales</h4>
              <ul className="space-y-3">
                <li><a href="https://clientes.portalinternet.net/accounts/login/?next=/panel/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">Portal de Clientes WISP</a></li>
                <li><Link href="/login" className="hover:text-blue-400 transition-colors">Acceso RentControl Nube</Link></li>
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
            <p>&copy; {new Date().getFullYear()} RadioTecPro y RentControl. Todos los derechos reservados.</p>
            <p className="text-slate-500">Navojoa, Sonora, México.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
