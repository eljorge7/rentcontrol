"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StoreProvider, useStore } from "./StoreContext";
import { Search, ShoppingCart, ArrowLeft, Package, Trash2, Check, X, Send, Menu, Tag, ChevronDown, DollarSign, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function StoreLayoutContent({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { 
     cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, clearCart,
     isAddedPanelOpen, setIsAddedPanelOpen, addedProduct, complementaryProducts, addToCart,
     globalSearchTerm, setGlobalSearchTerm, currency, setCurrency, includeIva, setIncludeIva
  } = useStore();

  const [checkoutName, setCheckoutName] = useState("");
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [checkoutAddress, setCheckoutAddress] = useState("");

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [showConfigDropdown, setShowConfigDropdown] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const getDisplayPrice = (product: any) => {
    return product.price; // Already has IVA applied in backend
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    try {
      const orderData = {
        customerName: checkoutName,
        customerPhone: checkoutPhone,
        customerAddress: checkoutAddress,
        totalAmount: cart.reduce((sum, item) => sum + (getDisplayPrice(item.product) * item.quantity), 0),
        items: cart.map(item => ({
          productId: item.product.source === 'local' ? item.product.id : null,
          syscomId: item.product.source === 'syscom' ? item.product.id.replace('syscom_', '') : null,
          title: item.product.title,
          price: getDisplayPrice(item.product),
          quantity: item.quantity
        }))
      };

      await axios.post(`${API_URL}/store/orders`, orderData);
      clearCart();
      setIsCartOpen(false);
      setCheckoutName("");
      setCheckoutPhone("");
      setCheckoutAddress("");
      alert("¡Pedido realizado con éxito! Nos pondremos en contacto contigo pronto.");
      router.push('/store');
    } catch (error) {
      console.error(error);
      alert("Error al procesar el pedido");
    }
  };

  const handleSendOmniChat = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!chatMessage.trim()) return;
     try {
       await axios.post(`${API_URL}/omnichat/whatsapp/send`, {
          phone: "5215555555555", // Replace with actual business WhatsApp or dynamically handle
          message: `*Nueva Consulta Tienda Web*\nMensaje: ${chatMessage}`
       });
       setChatMessage("");
       alert("Mensaje enviado a asesores.");
       setIsChatOpen(false);
     } catch (err) {
       console.error("Error sending chat:", err);
     }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200">
      {/* Navbar (Header) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="h-20 flex items-center justify-between gap-4 md:gap-8">
            <Link href="/store" className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
              <img src="/logo-transparent.png" alt="RadioTec Pro" className="h-[32px] md:h-[40px] object-contain" />
            </Link>

            <form onSubmit={(e) => { e.preventDefault(); router.push('/store'); }} className="flex-1 max-w-2xl relative hidden md:block">
              <div className="relative group">
                 <input 
                   type="text" 
                   value={globalSearchTerm}
                   onChange={e => setGlobalSearchTerm(e.target.value)}
                   placeholder="Buscar modelo, marca o categoría..." 
                   className="w-full h-12 bg-slate-100 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl pl-12 pr-4 text-sm font-medium transition-all outline-none group-hover:bg-slate-200/50 focus:group-hover:bg-white shadow-inner"
                 />
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              </div>
            </form>

            <div className="flex items-center gap-3 md:gap-6 shrink-0 relative">
               {/* Currency & Tax Configurator */}
               <div className="relative">
                 <button 
                   onClick={() => setShowConfigDropdown(!showConfigDropdown)} 
                   className="hidden md:flex items-center gap-3 hover:bg-slate-50 p-2 rounded-xl transition-colors border border-transparent hover:border-slate-200"
                 >
                   <div className="text-right">
                     <div className="text-xs font-bold text-slate-900 flex items-center justify-end gap-1">
                       {currency === 'MXN' ? <img src="https://flagcdn.com/w20/mx.png" alt="MXN" className="w-4 h-3 object-cover rounded-sm" /> : <img src="https://flagcdn.com/w20/us.png" alt="USD" className="w-4 h-3 object-cover rounded-sm" />} 
                       {currency}
                     </div>
                     <div className="text-[10px] text-slate-500 font-medium">{includeIva ? 'Con IVA' : 'Sin IVA'}</div>
                   </div>
                   <ChevronDown className="w-4 h-4 text-slate-400" />
                 </button>

                 {/* Dropdown Menu */}
                 {showConfigDropdown && (
                   <>
                     <div className="fixed inset-0 z-40" onClick={() => setShowConfigDropdown(false)}></div>
                     <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                       <div className="p-4 border-b border-slate-100 bg-slate-50">
                         <div className="text-xs font-semibold text-slate-500">Tipo de cambio aproximado:</div>
                         <div className="text-sm font-bold text-slate-900 flex items-center gap-2 mt-1">
                           <DollarSign className="w-4 h-4 text-emerald-600" /> $17.50 MXN / USD
                         </div>
                       </div>
                       
                       <div className="p-2">
                         <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 pt-2 pb-1">Seleccionar Moneda</div>
                         <label className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                           <input type="radio" name="currency" checked={currency === 'MXN'} onChange={() => {setCurrency('MXN'); setShowConfigDropdown(false)}} className="w-4 h-4 text-blue-600" />
                           <img src="https://flagcdn.com/w20/mx.png" alt="MXN" className="w-5 h-3.5 object-cover rounded-sm shadow-sm" />
                           <span className="text-sm font-medium text-slate-700">MXN (Pesos)</span>
                         </label>
                         <label className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors mb-2">
                           <input type="radio" name="currency" checked={currency === 'USD'} onChange={() => {setCurrency('USD'); setShowConfigDropdown(false)}} className="w-4 h-4 text-blue-600" />
                           <img src="https://flagcdn.com/w20/us.png" alt="USD" className="w-5 h-3.5 object-cover rounded-sm shadow-sm" />
                           <span className="text-sm font-medium text-slate-700">USD (Dólares)</span>
                         </label>

                         <div className="h-px bg-slate-100 my-1 mx-2"></div>

                         <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 pt-2 pb-1">Impuestos</div>
                         <label className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                           <input type="radio" name="iva" checked={includeIva === true} onChange={() => {setIncludeIva(true); setShowConfigDropdown(false)}} className="w-4 h-4 text-blue-600" />
                           <span className="text-sm font-medium text-slate-700">Con IVA (16%)</span>
                         </label>
                         <label className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                           <input type="radio" name="iva" checked={includeIva === false} onChange={() => {setIncludeIva(false); setShowConfigDropdown(false)}} className="w-4 h-4 text-blue-600" />
                           <span className="text-sm font-medium text-slate-700">Sin IVA</span>
                         </label>
                       </div>
                     </div>
                   </>
                 )}
               </div>

               <Button variant="ghost" onClick={() => { setIsCartOpen(!isCartOpen); window.scrollTo(0,0); }} className="relative p-2 md:p-3 hover:bg-slate-100 rounded-xl h-auto">
                 <ShoppingCart className="w-6 h-6 md:w-7 md:h-7 text-slate-700" />
                 {cart.length > 0 && (
                   <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] md:text-xs font-bold w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                     {cart.reduce((sum, item) => sum + item.quantity, 0)}
                   </span>
                 )}
               </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      {isCartOpen ? (
        <main className="container mx-auto px-4 py-6 md:py-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
           <Button variant="ghost" onClick={() => setIsCartOpen(false)} className="mb-6 text-slate-500 hover:text-blue-600 -ml-4 font-bold text-sm bg-white rounded-full px-6 py-2 shadow-sm border border-slate-200">
              <ArrowLeft className="w-4 h-4 mr-2" /> Seguir Comprando
           </Button>

           <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1">
                 <h2 className="text-3xl font-black text-slate-900 mb-6 flex items-center gap-3">
                    <ShoppingCart className="w-8 h-8 text-blue-600" /> Mi Carrito
                 </h2>

                 {cart.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
                       <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                       <h3 className="text-xl font-bold text-slate-800">Tu carrito est vaco</h3>
                       <p className="text-slate-500 mt-2 mb-6">Parece que an no has agregado productos.</p>
                       <Button onClick={() => setIsCartOpen(false)} className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl h-12 px-8 font-bold">Explorar Catlogo</Button>
                    </div>
                 ) : (
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                       <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                             <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                   <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-20">Imagen</th>
                                   <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Producto</th>
                                   <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Precio Lista</th>
                                   <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Precio U.</th>
                                   <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Cantidad</th>
                                   <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Subtotal</th>
                                </tr>
                             </thead>
                             <tbody>
                                {cart.map((item, idx) => (
                                   <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                      <td className="p-4 align-top">
                                         <div className="w-16 h-16 bg-white border border-slate-100 rounded-xl flex items-center justify-center p-1 shrink-0">
                                            {item.product.imageUrl ? (
                                               <img src={item.product.imageUrl} alt="" className="max-w-full max-h-full object-contain mix-blend-multiply" />
                                            ) : <Package className="w-8 h-8 text-slate-200" />}
                                         </div>
                                      </td>
                                      <td className="p-4 align-top">
                                         <div className="text-[10px] font-bold text-blue-600 mb-1">{item.product.brand || 'GENÉRICO'}</div>
                                         <div 
                                            onClick={() => { setIsCartOpen(false); router.push(`/store/p/${item.product.id}`); }}
                                            className="text-sm font-semibold text-slate-800 line-clamp-3 mb-2 hover:text-blue-600 cursor-pointer transition-colors"
                                         >
                                            {item.product.title}
                                         </div>
                                         <div className="inline-block bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">Inventario {item.product.stock}</div>
                                      </td>
                                      <td className="p-4 align-top text-center">
                                         <div className="text-xs text-slate-400 line-through mt-2 font-medium">
                                            ${(getDisplayPrice(item.product) * 1.15).toLocaleString('es-MX', {minimumFractionDigits: 2})} <span className="text-[9px]">MXN</span>
                                         </div>
                                      </td>
                                      <td className="p-4 align-top text-center">
                                         <div className="text-sm font-bold text-slate-900 mt-1">
                                            ${getDisplayPrice(item.product).toLocaleString('es-MX', {minimumFractionDigits: 2})} <span className="text-[9px]">MXN</span>
                                         </div>
                                      </td>
                                      <td className="p-4 align-top">
                                         <div className="flex justify-center mt-1">
                                            <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden h-9 shadow-sm">
                                               <button onClick={() => updateQuantity(item.product.id, -1)} className="px-3 h-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 font-bold">-</button>
                                               <span className="w-10 text-center font-bold text-sm">{item.quantity}</span>
                                               <button onClick={() => updateQuantity(item.product.id, 1)} className="px-3 h-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 font-bold">+</button>
                                            </div>
                                         </div>
                                      </td>
                                      <td className="p-4 align-top text-right">
                                         <div className="text-base font-black text-slate-900 mt-1">
                                            ${(getDisplayPrice(item.product) * item.quantity).toLocaleString('es-MX', {minimumFractionDigits: 2})}
                                            <span className="text-[10px] text-slate-500 block">MXN</span>
                                         </div>
                                      </td>
                                      <td className="p-4 align-top text-right">
                                         <button onClick={() => removeFromCart(item.product.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors mt-1">
                                            <Trash2 className="w-5 h-5" />
                                         </button>
                                      </td>
                                   </tr>
                                ))}
                             </tbody>
                          </table>
                       </div>
                    </div>
                 )}
              </div>

              {cart.length > 0 && (
                 <div className="w-full lg:w-[380px] shrink-0">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sticky top-28">
                       <h3 className="text-xl font-black text-slate-900 mb-6">Resumen de Orden</h3>
                       
                       <div className="space-y-4 mb-6">
                          <div className="flex justify-between text-sm">
                             <span className="text-slate-500 font-medium">Subtotal</span>
                             <span className="font-bold text-slate-700">${cart.reduce((sum, item) => sum + (getDisplayPrice(item.product) * item.quantity), 0).toLocaleString('es-MX', {minimumFractionDigits: 2})} MXN</span>
                          </div>
                          <div className="flex justify-between text-sm">
                             <span className="text-slate-500 font-medium">Envo Nacional</span>
                             <span className="font-bold text-emerald-500">GRATIS! 🚚</span>
                          </div>
                          <div className="border-t border-slate-100 pt-4 flex justify-between items-end">
                             <span className="text-lg font-black text-slate-900">TOTAL</span>
                             <div className="text-right">
                                <span className="text-2xl font-black text-blue-600">${cart.reduce((sum, item) => sum + (getDisplayPrice(item.product) * item.quantity), 0).toLocaleString('es-MX', {minimumFractionDigits: 2})}</span>
                                <span className="text-xs font-bold text-blue-600/60 ml-1">MXN</span>
                             </div>
                          </div>
                       </div>

                       <form onSubmit={handleCheckout} className="space-y-3">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Tag className="w-3 h-3"/> Completar Datos</div>
                          <input required type="text" placeholder="Tu Nombre Completo" value={checkoutName} onChange={e => setCheckoutName(e.target.value)} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 hover:bg-white transition-colors" />
                          <input required type="tel" placeholder="Celular (WhatsApp)" value={checkoutPhone} onChange={e => setCheckoutPhone(e.target.value)} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 hover:bg-white transition-colors" />
                          <textarea required placeholder="Direccin de Envo" value={checkoutAddress} onChange={e => setCheckoutAddress(e.target.value)} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 hover:bg-white transition-colors h-20 resize-none" />
                          
                          <Button type="submit" className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl mt-4 flex items-center justify-center gap-2 shadow-lg hover:shadow-amber-500/30 transition-all text-base">
                             Finalizar Pedido
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setIsCartOpen(false)} className="w-full h-12 mt-2 font-bold text-slate-600">
                             Guardar Carrito (Seguir)
                          </Button>
                       </form>
                    </div>
                 </div>
              )}
           </div>
        </main>
      ) : (
        <>
          {children}
          {/* Global Footer based on MAGIA OS standard */}
          <footer className="bg-slate-900 border-t border-slate-800 text-slate-300 mt-20">
             <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                   <div>
                      <img src="/logo-transparent.png" alt="RadioTec Pro" className="h-[40px] object-contain mb-6 brightness-0 invert" />
                      <p className="text-sm text-slate-400 leading-relaxed mb-6">
                         Distribuidores mayoristas de equipo de telecomunicaciones, redes y seguridad electrónica en México. Expertos en soluciones empresariales.
                      </p>
                      <div className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-3">Respaldado por</div>
                      <div className="text-lg font-black text-white bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">Grupo Hurtado</div>
                   </div>
                   
                   <div>
                      <h4 className="text-white font-bold mb-6 flex items-center gap-2">Contacto</h4>
                      <ul className="space-y-4 text-sm text-slate-400">
                         <li className="flex items-center gap-3"><img src="https://flagcdn.com/w20/mx.png" alt="MX" className="w-4 h-3 rounded-sm" /> +52 (55) 5555-5555</li>
                         <li className="flex items-center gap-3">✉ ventas@radiotecpro.com</li>
                         <li className="flex items-center gap-3">📍 Ciudad de México, CDMX</li>
                      </ul>
                   </div>

                   <div>
                      <h4 className="text-white font-bold mb-6">Herramientas</h4>
                      <ul className="space-y-3 text-sm text-slate-400">
                         <li><a href="#" className="hover:text-blue-400 transition-colors">Cotizador Rápido</a></li>
                         <li><a href="#" className="hover:text-blue-400 transition-colors">Facturación Electrónica</a></li>
                         <li><a href="#" className="hover:text-blue-400 transition-colors">Garantías y Soporte</a></li>
                         <li><a href="#" className="hover:text-blue-400 transition-colors">Guías Técnicas</a></li>
                      </ul>
                   </div>

                   <div>
                      <h4 className="text-white font-bold mb-6">MAGIA OS</h4>
                      <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                         <p className="text-xs text-slate-400 leading-relaxed mb-4">
                            Esta tienda está potenciada por <strong>MAGIA OS</strong>, el ecosistema inteligente de Grupo Hurtado para la gestión de negocios de alto rendimiento.
                         </p>
                         <button className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors w-full">
                            Conocer más sobre MAGIA OS
                         </button>
                      </div>
                   </div>
                </div>

                <div className="border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                   <div>&copy; {new Date().getFullYear()} RadioTec Internet y Comunicaciones. Todos los derechos reservados.</div>
                   <div className="flex gap-4">
                      <a href="#" className="hover:text-white transition-colors">Aviso de Privacidad</a>
                      <a href="#" className="hover:text-white transition-colors">Términos y Condiciones</a>
                   </div>
                </div>
             </div>
          </footer>
        </>
      )}

      {/* Added to Cart Panel (Slide Over Cross-Selling) */}
      {isAddedPanelOpen && addedProduct && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity" onClick={() => setIsAddedPanelOpen(false)} />
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-[420px] bg-slate-50 z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="bg-emerald-600 text-white p-4 flex items-center justify-between shadow-md relative z-10">
              <div className="flex items-center gap-2">
                 <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                 </div>
                 <h2 className="font-bold text-lg">Equipo Agregado</h2>
              </div>
              <button onClick={() => setIsAddedPanelOpen(false)} className="text-emerald-100 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {/* Product Added Confirmation */}
              <div className="bg-white p-4 mb-2 shadow-sm flex gap-4 items-center">
                 <div className="w-16 h-16 bg-white border border-slate-100 rounded-xl flex items-center justify-center shrink-0 p-1">
                   {addedProduct.imageUrl ? (
                     <img src={addedProduct.imageUrl} alt="" className="max-w-full max-h-full object-contain" />
                   ) : (
                     <Package className="h-8 w-8 text-slate-300" />
                   )}
                 </div>
                 <div className="flex-1">
                    <div className="text-[10px] font-bold text-slate-400">{addedProduct.brand}</div>
                    <h4 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-tight">{addedProduct.title}</h4>
                 </div>
              </div>

              {/* Cross Selling Area */}
              <div className="p-4">
                 <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Package className="w-4 h-4" /> Equipos Complementarios
                 </h3>
                 <div className="grid grid-cols-2 gap-3">
                   {complementaryProducts.map(cp => (
                      <div key={cp.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col group cursor-pointer hover:border-blue-300 transition-colors" onClick={() => { setIsAddedPanelOpen(false); router.push(`/store/p/${cp.id}`); }}>
                         <div className="aspect-square p-2 border-b border-slate-100 flex items-center justify-center relative bg-white">
                           {cp.imageUrl ? (
                             <img src={cp.imageUrl} alt="" className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform" />
                           ) : (
                             <Package className="h-8 w-8 text-slate-200" />
                           )}
                           {cp.stock > 0 && (
                             <button 
                               onClick={(e) => { e.stopPropagation(); addToCart(cp); }}
                               className="absolute bottom-2 right-2 bg-blue-100 hover:bg-blue-600 text-blue-700 hover:text-white p-2 rounded-full shadow-sm transition-colors z-10"
                             >
                               <ShoppingCart className="w-4 h-4" />
                             </button>
                           )}
                         </div>
                         <div className="p-3 flex flex-col flex-1">
                            <div className="text-[10px] font-bold text-emerald-600 mb-1">{cp.brand || 'GENÉRICO'}</div>
                            <h4 className="text-[11px] font-semibold text-slate-700 leading-tight mb-2 flex-1 line-clamp-3">{cp.title}</h4>
                            <div className="font-black text-slate-900 text-sm">
                               ${getDisplayPrice(cp).toLocaleString('es-MX', {minimumFractionDigits:2})}
                               <span className="text-[9px] text-slate-400 block">{currency} inc. IVA</span>
                            </div>
                            <div className="mt-2 text-[10px] font-bold">
                               {cp.stock > 0 ? (
                                  <span className="text-emerald-600 flex items-center gap-1"><Package className="w-3 h-3"/> {cp.stock} disponibles</span>
                               ) : (
                                  <span className="text-red-500 flex items-center gap-1"><X className="w-3 h-3"/> Agotado</span>
                               )}
                            </div>
                         </div>
                      </div>
                   ))}
                 </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 bg-white border-t border-slate-100 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
               <Button variant="outline" onClick={() => setIsAddedPanelOpen(false)} className="w-full mb-3 h-12 font-bold text-slate-600 rounded-xl">
                  Seguir Comprando
               </Button>
               <Button onClick={() => { setIsAddedPanelOpen(false); setIsCartOpen(true); }} className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-amber-500/30">
                  <ShoppingCart className="w-5 h-5" /> Ir al Carrito
               </Button>
            </div>
          </div>
        </>
      )}

      {/* OmniChat Floating Widget */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
         {isChatOpen && (
            <div className="bg-white w-80 rounded-2xl shadow-2xl mb-2 overflow-hidden border border-slate-200 animate-in slide-in-from-bottom-5">
               <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex justify-between items-center">
                  <div>
                     <h4 className="font-bold text-sm">Asesor de Ventas</h4>
                     <p className="text-[10px] text-blue-100">En lnea, respuestas rpidas.</p>
                  </div>
                  <button onClick={() => setIsChatOpen(false)} className="text-white hover:bg-white/20 p-1.5 rounded-full"><X className="w-4 h-4"/></button>
               </div>
               <div className="p-4 bg-slate-50 h-64 overflow-y-auto flex flex-col gap-3">
                  <div className="bg-white p-3 rounded-xl rounded-tl-none border border-slate-100 shadow-sm self-start max-w-[85%]">
                     <p className="text-xs text-slate-700">Hola! Soy tu asesor tcnico y de ventas. Qu proyecto tienes en mente? Podemos armar la mejor solucin para ti.</p>
                  </div>
               </div>
               <div className="p-3 bg-white border-t border-slate-100">
                  <form onSubmit={handleSendOmniChat} className="flex items-center gap-2">
                     <input type="text" value={chatMessage} onChange={e=>setChatMessage(e.target.value)} placeholder="Escribe un mensaje..." className="flex-1 bg-slate-100 border-none rounded-full h-10 px-4 text-xs focus:ring-2 focus:ring-blue-500 outline-none" />
                     <button type="submit" className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-md transition-colors">
                        <Send className="w-4 h-4" />
                     </button>
                  </form>
               </div>
            </div>
         )}
         <div className="flex gap-3 items-end">
            {showScrollTop && (
               <button 
                  onClick={scrollToTop} 
                  className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center shadow-lg hover:shadow-blue-500/30 transition-all animate-in fade-in"
                  title="Volver arriba"
               >
                  <ArrowUp className="w-6 h-6" />
               </button>
            )}
            <button onClick={() => setIsChatOpen(!isChatOpen)} className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-transform">
               {isChatOpen ? <X className="w-6 h-6" /> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-7 h-7"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>}
            </button>
         </div>
      </div>
    </div>
  );
}

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <StoreLayoutContent>{children}</StoreLayoutContent>
    </StoreProvider>
  );
}
