"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import type { Message } from "@/lib/types/chat";
import {
  getMessages,
  saveMessage,
  updateMessageStatus,
  clearMessages, // Certifique-se que essa função existe ou use localStorage direto
} from "@/lib/storage/chat-storage";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import { Trash2, ArrowLeft, RefreshCw } from "lucide-react"; // Instale lucide-react se não tiver

interface ChatInterfaceProps {
  sessionId: string;
  name: string;
  phone: string;
  onGoBack?: () => void; // Nova prop para voltar
}

export default function ChatInterface({
  sessionId,
  name,
  phone,
  onGoBack,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    // Tenta carregar do localStorage ao iniciar
    const storedMessages = getMessages(sessionId);
    setMessages(storedMessages);
  }, [sessionId]);

  useLayoutEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: isInitialLoad.current ? "instant" : "smooth",
      });
      isInitialLoad.current = false;
    }
  }, [messages]);

  // Função para limpar conversa
  const handleClearChat = () => {
    if (confirm("Deseja apagar todo o histórico da conversa?")) {
      localStorage.removeItem(`chat_messages_${sessionId}`); // Remove do storage
      setMessages([]); // Limpa o estado visual
      // Opcional: Recarregar a página para gerar nova sessão
      // window.location.reload(); 
    }
  };

  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
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

      updateMessageStatus(sessionId, localMessageId, "sent");
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === localMessageId ? { ...msg, status: "sent" } : msg
        )
      );

      return data.reply;
    },
    onSuccess: (aiReply) => {
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
      setMessages((prev) => {
        const newMsgs = [...prev];
        const lastUserMsg = newMsgs.reverse().find((m) => m.sender === "user");
        if (lastUserMsg) lastUserMsg.status = "error";
        return [...newMsgs.reverse()];
      });
    },
  });

  const handleSendMessage = (messageText: string) => {
    sendMessageMutation.mutate(messageText);
  };

  return (
    <div className="flex h-dvh flex-col bg-[#e5ddd5]">
      {/* Header Atualizado */}
      <div className="bg-[#075e54] px-4 py-3 text-white shadow-md z-10 flex items-center justify-between">
        
        <div className="flex items-center gap-3">
          {/* Botão de Voltar (se existir a função) */}
          {onGoBack && (
            <button onClick={onGoBack} className="mr-1 p-1 hover:bg-white/10 rounded-full transition">
               <ArrowLeft size={20} />
            </button>
          )}

          <div className="relative">
            <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white/20 bg-white/10 flex items-center justify-center">
              <Image
                src="https://ui-avatars.com/api/?name=CodeClinic&background=D63384&color=fff&size=128&bold=true"
                alt="Atendente"
                width={40}
                height={40}
                unoptimized
              />
            </div>
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 border-2 border-[#075e54]"></span>
          </div>
          <div>
            <h1 className="text-base font-semibold leading-tight">CodeClinic</h1>
            <p className="text-xs text-green-100 opacity-90">Online agora</p>
          </div>
        </div>

        {/* Botão de Limpar (Lixeira) */}
        <button 
            onClick={handleClearChat} 
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition duration-200"
            title="Limpar conversa"
        >
            <Trash2 size={20} />
        </button>

      </div>

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 scroll-smooth"
        ref={messagesContainerRef}
        style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", backgroundBlendMode: "soft-light" }}
      >
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center p-8">
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg text-center max-w-xs mx-auto">
              <p className="mb-2 text-xl font-semibold text-gray-800">Olá! 👋</p>
              <p className="text-sm text-gray-600 mb-4">
                Sou a Ana, assistente virtual da CodeClinic.
              </p>
              <p className="text-xs text-gray-500">
                Posso te ajudar com preços, agendamentos e dúvidas sobre procedimentos.
              </p>
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {sendMessageMutation.isPending && (
          <div className="flex justify-start mb-4">
            <div className="bg-white rounded-xl p-3 rounded-tl-none shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
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