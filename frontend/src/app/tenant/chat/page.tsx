"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Send, Clock, CheckCircle2 } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/components/AuthProvider";
import api from "@/lib/api";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type Message = {
  id: string;
  senderId: string;
  senderRole: string;
  senderName: string;
  text: string;
  createdAt: string;
};

export default function TenantChatPage() {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [connected, setConnected] = useState(false);
  const [manager, setManager] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    // Fetch the manager contact assigned to this tenant
    api.get("/chat/contacts").then(res => {
      const contacts = res.data;
      if (contacts && contacts.length > 0) {
        setManager(contacts[0]);
        // Prefetch conversation history with this manager
        return api.get(`/chat/conversation/${contacts[0].id}`);
      }
      return null;
    }).then(res => {
      if (res) {
        setMessages(res.data);
      }
    }).catch(console.error);

    const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}`;
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setConnected(true);
      newSocket.emit("joinChat", { role: "tenant", userId: user.id });
    });

    newSocket.on("disconnect", () => {
      setConnected(false);
    });

    newSocket.on("newMessage", (message: any) => {
      const formattedMessage: Message = {
        ...message,
        createdAt: message.createdAt || message.timestamp || new Date().toISOString()
      };
      setMessages((prev) => {
        if (!prev.find(m => m.id === formattedMessage.id)) {
          return [...prev, formattedMessage];
        }
        return prev;
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === '' || !socket || !manager || !user) return;
    
    const payload = {
      senderId: user.id,
      senderRole: "tenant",
      senderName: user.name, 
      text: newMessage,
      receiverId: manager.id,
      receiverRole: "manager"
    };

    socket.emit('sendMessage', payload);
    setNewMessage('');
  };

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-100px)]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Mensajes y Soporte</h2>
          <p className="text-sm text-slate-500">
            {connected ? `🟢 En línea con tu Gestor (${manager?.name || 'Administración'})` : '🔴 Conectando al servidor...'}
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-500" /> Solicitudes
        </Button>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden shadow-sm border-slate-200">
        <CardHeader className="border-b bg-slate-50/50 pb-4">
          <CardTitle>Chat con Administración</CardTitle>
          <CardDescription>
            Tus mensajes se responden de Lunes a Viernes en horario de oficina. Todos los mensajes quedan guardados como respaldo oficial.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50">
          <div className="text-center pb-4">
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-200/50 px-3 py-1 rounded-full uppercase tracking-wider">
              Inicio de la conversación encriptada
            </span>
          </div>
          
          {messages.map((message) => {
            const isMe = message.senderId === user?.id;
            return (
              <div 
                key={message.id || Math.random()} 
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div 
                  className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    isMe 
                      ? 'bg-blue-600 text-white rounded-tr-sm' 
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
                  }`}
                >
                  <span className="block">{message.text}</span>
                  <span className={`text-[10px] items-center gap-1 mt-1 flex justify-end ${isMe ? 'opacity-80' : 'text-slate-400'}`}>
                    <Clock className="h-3 w-3" /> 
                    {message.createdAt ? format(new Date(message.createdAt), "HH:mm", { locale: es }) : 'ahora'}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </CardContent>

        <div className="p-4 border-t bg-white">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} 
            className="flex items-center gap-2 max-w-4xl mx-auto"
          >
            <Input 
              placeholder="Escribe tu mensaje aquí..." 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 rounded-full bg-slate-100 border-transparent focus-visible:bg-white focus-visible:ring-blue-500 transition-colors px-6"
              disabled={!connected || !manager}
            />
            <Button type="submit" size="icon" className="h-10 w-10 shrink-0 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 transition-transform" disabled={!connected || !manager || !newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
