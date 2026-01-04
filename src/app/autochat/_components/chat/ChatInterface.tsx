"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import type { Message } from "@/lib/types/chat";
import {
  getMessages,
  saveMessage,
  updateMessageStatus,
} from "@/lib/storage/chat-storage";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";

interface ChatInterfaceProps {
  sessionId: string;
  name: string;
  phone: string;
}

export default function ChatInterface({
  sessionId,
  name,
  phone,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);

  // Carregar mensagens salvas ao iniciar
  useEffect(() => {
    const storedMessages = getMessages(sessionId);
    setMessages(storedMessages);
  }, [sessionId]);

  // Scroll automático para o fim
  useLayoutEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: isInitialLoad.current ? "instant" : "smooth" 
      });
      isInitialLoad.current = false;
    }
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      // 1. Cria ID temporário e mostra mensagem do usuário na hora
      const localMessageId = `msg-${Date.now()}`;
      
      const userMessage: Message = {
        id: localMessageId,
        text: messageText,
        sender: "user",
        timestamp: new Date(),
        status: "sending",
      };

      setMessages((prev) => [...prev, userMessage]);
      saveMessage(sessionId, userMessage);

      // 2. Envia para nossa API Route e espera a resposta
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: messageText,
          phone,
        }),
      });

      if (!response.ok) throw new Error("Erro na comunicação");

      const data = await response.json();

      // 3. Atualiza status da mensagem do usuário para enviada
      updateMessageStatus(sessionId, localMessageId, "sent");
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === localMessageId ? { ...msg, status: "sent" } : msg
        )
      );

      return data.reply; // Retorna o texto da IA
    },
    onSuccess: (aiReply) => {
      // 4. Cria e exibe a mensagem da IA
      if (aiReply) {
        const assistantMessage: Message = {
          id: `ai-${Date.now()}`,
          text: aiReply,
          sender: "assistant",
          timestamp: new Date(),
          status: "delivered",
        };
        setMessages((prev) => [...prev, assistantMessage]);
        saveMessage(sessionId, assistantMessage);
      }
    },
    onError: (error) => {
      console.error("Erro:", error);
      // Marca última mensagem como erro visualmente
      setMessages((prev) => {
        const newMsgs = [...prev];
        const lastUserMsg = newMsgs.reverse().find(m => m.sender === 'user');
        if (lastUserMsg) lastUserMsg.status = 'error';
        return [...newMsgs.reverse()]; // restaura ordem
      });
    },
  });

  const handleSendMessage = (messageText: string) => {
    sendMessageMutation.mutate(messageText);
  };

  return (
    <div className="flex h-dvh flex-col bg-[#e5ddd5]">
      {/* Header */}
      <div className="bg-[#075e54] px-4 py-3 text-white shadow-md z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white/20 bg-white/10 flex items-center justify-center">
              <Image
                src="https://ui-avatars.com/api/?name=ShowCar&background=25D366&color=fff&size=128&bold=true"
                alt="Atendente"
                width={40}
                height={40}
                unoptimized
              />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-semibold">
              {process.env.NEXT_PUBLIC_NAME || "CodeCar"} – Atendimento
            </h1>
            <div className="flex items-center gap-2 text-xs text-green-200">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
              <span>Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 scroll-smooth" ref={messagesContainerRef}>
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="mb-2 text-lg font-medium">Olá, {name}! 👋</p>
              <p className="text-sm">Como posso ajudá-lo hoje?</p>
            </div>
          </div>
        )}
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {/* Mostra indicador de digitando se estiver carregando */}
        {sendMessageMutation.isPending && (
           <div className="flex justify-start mb-4">
             <div className="bg-white rounded-lg p-3 rounded-tl-none shadow-sm">
               <span className="text-gray-500 text-sm animate-pulse">Digitando...</span>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        isSending={sendMessageMutation.isPending}
      />
    </div>
  );
}