"use client";

import { useState } from "react";
import ChatInterface from "./autochat/_components/chat/ChatInterface";
import WelcomeForm from "./autochat/_components/chat/WelcomeForm"; // Importe o componente novo
import { Sparkles, MessageCircle, CheckCircle2 } from "lucide-react";

export default function Home() {
  const [viewState, setViewState] = useState<"HOME" | "FORM" | "CHAT">("HOME");
  const [userData, setUserData] = useState({ name: "Visitante", phone: "" });

  const handleStartClick = () => setViewState("FORM");
  
  const handleFormSubmit = (data: { name: string; phone: string }) => {
    setUserData(data);
    setViewState("CHAT");
  };

  const handleBack = () => setViewState("HOME");

  // Renderiza o Chat
  if (viewState === "CHAT") {
    return (
      <ChatInterface
        sessionId={`session-${Math.random().toString(36).substring(7)}`}
        name={userData.name}
        phone={userData.phone}
        onGoBack={handleBack}
      />
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 to-white text-gray-800 font-sans relative">
      
      {/* Se o estado for FORM, mostramos o modal por cima de tudo */}
      {viewState === "FORM" && (
        <WelcomeForm onSubmit={handleFormSubmit} onCancel={handleBack} />
      )}

      {/* Navbar simples */}
      <nav className="flex justify-between items-center p-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="bg-rose-500 p-2 rounded-full text-white">
            <Sparkles size={24} />
          </div>
          <span className="text-2xl font-bold text-rose-600 tracking-tight">CodeClinic - Cínica Inteligente</span>
        </div>
        <button 
          onClick={handleStartClick}
          className="text-sm font-semibold text-rose-600 hover:text-rose-700 transition"
        >
          Área do Paciente
        </button>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-20 grid md:grid-cols-2 gap-12 items-center">
        
        <div className="space-y-6">
          <div className="inline-block px-4 py-1.5 bg-rose-100 text-rose-700 rounded-full text-sm font-medium mb-2">
            ✨ Tecnologia avançada para Clínica de Estética
          </div>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight text-gray-900">
            Faça seu teste <span className="text-rose-500">agora.</span>
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
            Agende avaliações, tire dúvidas sobre procedimentos e descubra o poder que a  IA tem para alavancar o seu negócio
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={handleStartClick}
              className="flex items-center justify-center gap-3 bg-rose-600 hover:bg-rose-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg shadow-rose-200 transition-all transform hover:-translate-y-1"
            >
              <MessageCircle size={24} />
              Falar com Nívea (IA)
            </button>
          </div>

          <div className="pt-8 flex gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-500" />
              <span>Atendimento 24h</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-500" />
              <span>Agendamento Rápido</span>
            </div>
          </div>
        </div>

        {/* Mockup Visual (apenas ilustrativo) */}
        <div className="relative hidden md:block">
          <div className="absolute -inset-4 bg-rose-200/50 rounded-full blur-3xl opacity-30 animate-pulse"></div>
          <div className="relative bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 max-w-sm mx-auto rotate-1 hover:rotate-0 transition duration-500">
            <div className="flex items-center gap-3 mb-6 border-b pb-4">
              <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-rose-600">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="font-bold text-gray-800">Nívea</p>
                <p className="text-xs text-green-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online agora
                </p>
              </div>
            </div>
            <div className="space-y-4 opacity-50">
              <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none text-sm text-gray-600 w-3/4">
                Olá! Teste já a IA para sua clínica ✨
              </div>
            </div>
            <div className="mt-6">
                <button onClick={handleStartClick} className="w-full py-3 bg-gray-50 text-rose-600 font-medium rounded-xl border border-rose-100 hover:bg-rose-50 transition text-sm">
                    Iniciar Conversa
                </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}