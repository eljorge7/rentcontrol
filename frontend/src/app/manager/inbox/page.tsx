"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, Search, UserCircle2, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/AuthProvider";
import { io, Socket } from "socket.io-client";
import api from "@/lib/api";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  lastMessage?: any;
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderRole: string;
  senderName: string;
  receiverId?: string;
  receiverRole?: string;
  createdAt: string;
}

export default function ManagerInboxPage() {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Socket and fetch contacts
  useEffect(() => {
    if (!user) return;

    // Fetch contacts
    api.get("/chat/contacts").then(res => {
      setContacts(res.data);
      setLoadingContacts(false);
    }).catch(console.error);

    // Setup Socket
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}`);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("joinChat", { role: "manager", userId: user.id });
    });

    newSocket.on("newMessage", (msg: any) => {
      // Normalizamos el mensaje porque el socket envía msg.timestamp pero la BD devuelve msg.createdAt
      const normalizedMsg = {
        ...msg,
        createdAt: msg.createdAt || msg.timestamp || new Date().toISOString()
      };

      // Incoming message could be from anyone, update contacts list lastMessage
      setContacts(prev => {
        const copy = [...prev];
        const contactIndex = copy.findIndex(c => c.id === normalizedMsg.senderId || c.id === normalizedMsg.receiverId);
        if (contactIndex > -1) {
          copy[contactIndex].lastMessage = normalizedMsg;
          // Move to top
          const [moved] = copy.splice(contactIndex, 1);
          copy.unshift(moved);
        }
        return copy;
      });

      // If the message belongs to the currently selected conversation, append it
      setMessages(prev => {
        // Only add if we don't already have it displayed 
        if (!prev.find(m => m.id === normalizedMsg.id)) {
           return [...prev, normalizedMsg];
        }
        return prev;
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  // When a contact is selected, fetch their message history
  useEffect(() => {
    if (selectedContact) {
      api.get(`/chat/conversation/${selectedContact.id}`).then(res => {
        setMessages(res.data);
      }).catch(console.error);
    }
  }, [selectedContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !socket || !selectedContact || !user) return;

    const payload = {
      senderId: user.id,
      senderRole: "manager",
      senderName: user.name,
      text: inputText.trim(),
      receiverId: selectedContact.id,
      receiverRole: selectedContact.role.toLowerCase()
    };

    socket.emit("sendMessage", payload);
    
    // Optimistic append usually handled by gateway echoing it back, 
    // but gateway emits 'newMessage' back to sender too so it'll append via the listener.
    setInputText("");
  };

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col md:flex-row bg-white rounded-2xl border shadow-sm overflow-hidden text-slate-900 animate-in fade-in duration-300">
      
      {/* Sidebar: Contacts */}
      <div className={`w-full md:w-80 border-r flex flex-col bg-slate-50 ${selectedContact ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b bg-white">
          <h2 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            Central de Mensajes
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Buscar Inquilino o Dueño..." 
              className="pl-9 bg-slate-100 border-none h-9 text-sm rounded-xl focus-visible:ring-1 focus-visible:ring-blue-500 transition-all"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loadingContacts ? (
            <div className="p-4 text-center text-slate-400 text-sm">Cargando contactos...</div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm flex flex-col items-center">
              <UserCircle2 className="h-10 w-10 mb-2 opacity-50" />
              No tienes conversaciones activas ni contactos asignados.
            </div>
          ) : (
            filteredContacts.map(contact => (
              <div 
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`p-4 border-b border-white hover:bg-slate-100 cursor-pointer transition-colors flex items-start gap-3 ${selectedContact?.id === contact.id ? 'bg-blue-50/60 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'}`}
              >
                <div className={`p-2 rounded-full flex-shrink-0 text-white ${contact.role === 'OWNER' ? 'bg-indigo-500' : 'bg-emerald-500'}`}>
                  <UserCircle2 className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="text-sm font-semibold truncate text-slate-800">{contact.name}</h3>
                    {contact.lastMessage && contact.lastMessage.createdAt && (
                      <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                        {format(new Date(contact.lastMessage.createdAt), 'HH:mm')}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-500 truncate mr-2">
                      {contact.lastMessage ? contact.lastMessage.text : <span className="italic text-slate-400">Sin mensajes aún</span>}
                    </p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider ${contact.role === 'OWNER' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {contact.role === 'OWNER' ? 'Propietario' : 'Inquilino'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-slate-50/50 relative ${!selectedContact ? 'hidden md:flex' : 'flex'}`}>
        {selectedContact ? (
          <>
            {/* Chat Window Header */}
            <div className="h-16 px-6 border-b bg-white flex items-center justify-between shadow-sm z-10 shrink-0">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="md:hidden -ml-2 text-slate-500" onClick={() => setSelectedContact(null)}>
                  <span className="sr-only">Volver</span>
                  ←
                </Button>
                <div className={`p-2 rounded-full ${selectedContact.role === 'OWNER' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  <UserCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 leading-tight">{selectedContact.name}</h2>
                  <p className="text-xs text-slate-500">{selectedContact.email}</p>
                </div>
              </div>
              <div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${selectedContact.role === 'OWNER' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {selectedContact.role === 'OWNER' ? 'PROPIETARIO' : 'INQUILINO'}
                </span>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              <div className="text-center pb-4">
                 <span className="text-[10px] font-semibold text-slate-400 bg-slate-200/50 px-3 py-1 rounded-full uppercase tracking-wider">
                   Inicio de la conversación encriptada
                 </span>
              </div>

              {messages.filter(m => m.senderId === selectedContact.id || m.receiverId === selectedContact.id).map((msg) => {
                const isMe = msg.senderId === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] md:max-w-[60%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div 
                        className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                          isMe 
                            ? 'bg-blue-600 text-white rounded-tr-sm' 
                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <div className="flex items-center gap-1 mt-1 px-1">
                        <span className="text-[10px] text-slate-400 font-medium">
                          {msg.createdAt ? format(new Date(msg.createdAt), "dd MMM, HH:mm", { locale: es }) : 'ahora'}
                        </span>
                        {isMe && <CheckCircle2 className="h-3 w-3 text-blue-500" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t shrink-0">
              <form onSubmit={handleSendMessage} className="flex gap-2 max-w-4xl mx-auto">
                <Input 
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 rounded-full bg-slate-100 border-transparent focus-visible:bg-white focus-visible:ring-blue-500 transition-colors px-6"
                />
                <Button type="submit" size="icon" className="rounded-full bg-blue-600 hover:bg-blue-700 shrink-0 h-10 w-10 shadow-sm transition-transform active:scale-95" disabled={!inputText.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50/50">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
              <MessageCircle className="h-8 w-8 text-blue-300" />
            </div>
            <h3 className="text-xl font-medium text-slate-700 mb-2">Central de Mensajes</h3>
            <p className="max-w-md text-sm">
              Selecciona un Inquilino o Propietario de la lista lateral para ver su historial y comenzar a platicar.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
