"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Send, Clock } from "lucide-react";
import { io, Socket } from "socket.io-client";
import api from "@/lib/api";

type Message = {
  id: string;
  senderId: string;
  senderRole: 'tenant' | 'admin';
  senderName: string;
  text: string;
  timestamp: string;
};

export default function AdminChatPage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await api.get('/chat/messages');
        setMessages(res.data);
      } catch (err) {
        console.error("Error fetching chat history", err);
      }
    };
    fetchMessages();

    // In a real app we'd get the JWT or API Base URL from env config
    const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setConnected(true);
      newSocket.emit("joinChat", { role: "admin", userId: "admin-1" });
    });

    newSocket.on("disconnect", () => {
      setConnected(false);
    });

    newSocket.on("newMessage", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleSendMessage = () => {
    if (newMessage.trim() === '' || !socket) return;
    
    // For now we broadcast back to the latest tenant who sent a message,
    // or broadcast to all if we don't have a specific conversation selected.
    const lastTenantMessage = [...messages].reverse().find(m => m.senderRole === "tenant");
    
    const payload = {
      senderId: "admin-1",
      senderRole: "admin",
      senderName: "Administración",
      text: newMessage,
      receiverId: lastTenantMessage ? lastTenantMessage.senderId : undefined
    };

    socket.emit('sendMessage', payload);
    setNewMessage('');
  };

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-100px)]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Bandeja de Soporte y Chat</h2>
          <p className="text-sm text-slate-500">
            {connected ? '🟢 Conectado al servidor de chat en tiempo real' : '🔴 Desconectado'}
          </p>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="border-b bg-slate-50/50 pb-4">
          <CardTitle>Conversaciones Recientes</CardTitle>
          <CardDescription>
            Mensajes de todos los inquilinos. (Vista general)
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-slate-500 py-10">No hay mensajes recientes.</div>
          ) : (
            messages.map((message) => (
              <div 
                key={message.id || Math.random().toString()} 
                className={`flex flex-col ${message.senderRole === 'admin' ? 'items-end' : 'items-start'}`}
              >
                <div 
                  className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                    message.senderRole === 'admin' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-slate-100 text-slate-900 rounded-tl-none'
                  }`}
                >
                  {message.senderRole === 'tenant' && (
                    <div className="font-bold text-xs text-slate-500 mb-1">{message.senderName}</div>
                  )}
                  {message.text}
                </div>
                <span className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </CardContent>

        <div className="p-4 border-t bg-white">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} 
            className="flex items-center gap-2"
          >
            <Input 
              placeholder="Escribe tu mensaje a los inquilinos..." 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1"
              disabled={!connected}
            />
            <Button type="submit" size="icon" className="h-10 w-10 shrink-0" disabled={!connected}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
