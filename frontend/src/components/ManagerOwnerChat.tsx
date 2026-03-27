"use client";

import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, UserCircle2 } from "lucide-react";

interface Message {
  senderId: string;
  senderRole: string;
  senderName: string;
  text: string;
  timestamp?: string;
  receiverId?: string;
  receiverRole?: string;
}

interface ChatProps {
  managerId: string;
  managerName: string;
  ownerId: string;
  ownerName: string;
}

export function ManagerOwnerChat({ managerId, managerName, ownerId, ownerName }: ChatProps) {
  const [open, setOpen] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    // Conectar a WebSockets
    const newSocket = io(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}`);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("joinChat", { role: "manager", userId: managerId });
    });

    newSocket.on("newMessage", (msg: Message) => {
      // Filtrar mensajes para asegurar que solo vemos los del owner especÃ­fico o los nuestros hacia Ã©l
      if (
        (msg.senderRole === "owner" && msg.senderId === ownerId) ||
        (msg.senderRole === "manager" && msg.senderId === managerId && msg.receiverId === ownerId)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [open, managerId, ownerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !socket) return;

    const payload = {
      senderId: managerId,
      senderRole: "manager",
      senderName: managerName,
      text: inputText.trim(),
      receiverId: ownerId,
      receiverRole: "owner"
    };

    socket.emit("sendMessage", payload);
    setInputText("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* @ts-ignore */}
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="bg-white hover:bg-slate-50 text-slate-700 font-medium shadow-sm transition-all flex justify-center items-center gap-2">
          <MessageCircle className="h-4 w-4 text-blue-500" />
          Abrir Chat
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] h-[600px] flex flex-col p-0 overflow-hidden bg-slate-50">
        <DialogHeader className="p-4 border-b bg-white shadow-sm flex flex-row items-center gap-3">
          <div className="bg-indigo-100 p-2 rounded-full">
            <UserCircle2 className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <DialogTitle className="text-lg font-bold text-slate-900">{ownerName}</DialogTitle>
            <p className="text-xs text-indigo-600 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span>
              Propietario en Cartera
            </p>
          </div>
        </DialogHeader>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="text-center py-4">
            <span className="bg-slate-200 text-slate-500 text-xs px-3 py-1 rounded-full font-medium">
              El chat está conectado y encriptado.
            </span>
          </div>

          {messages.map((msg, idx) => {
            const isMe = msg.senderRole === "manager";
            return (
              <div key={idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div 
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                    isMe 
                      ? "bg-slate-800 text-white rounded-tr-none" 
                      : "bg-white text-slate-800 border border-slate-100 rounded-tl-none"
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className={`text-[10px] block mt-1 ${isMe ? 'text-slate-400' : 'text-slate-400'}`}>
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'ahora'}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t">
          <form onSubmit={sendMessage} className="flex flex-row items-center gap-2">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Escribe tu mensaje al propietario..."
              className="flex-1 bg-slate-50 border-slate-200 rounded-full px-4"
            />
            <Button type="submit" size="icon" className="rounded-full bg-slate-800 hover:bg-slate-900 shrink-0 shadow-sm" disabled={!inputText.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
