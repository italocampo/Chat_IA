"use client";

import { useState } from "react";
import { User, Phone, ArrowRight } from "lucide-react";

interface WelcomeFormProps {
  onSubmit: (data: { name: string; phone: string }) => void;
  onCancel: () => void;
}

export default function WelcomeForm({ onSubmit, onCancel }: WelcomeFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    setIsLoading(true);

    try {
      // ALTERAÇÃO AQUI: Agora chamamos nossa rota interna "/api/lead"
      // Isso evita o erro de CORS porque o navegador fala com o seu site,
      // e o seu site (servidor) fala com o n8n.
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          phone,
          interest: "Novo Lead (Site)" 
        }),
      });

    } catch (error) {
      console.error("Erro ao salvar lead:", error);
      // Mesmo com erro, não travamos o usuário
    }
    
    // Libera o acesso ao chat
    onSubmit({ name, phone });
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100">
        
        {/* Cabeçalho */}
        <div className="bg-rose-500 p-6 text-white text-center">
          <h2 className="text-2xl font-bold mb-1">Quase lá! ✨</h2>
          <p className="text-rose-100 text-sm">
            Preencha para iniciarmos seu atendimento personalizado.
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <User size={16} className="text-rose-500" />
              Seu Nome
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Italo Campos"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all text-gray-800"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Phone size={16} className="text-rose-500" />
              Seu WhatsApp
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(00) 90000-0000"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all text-gray-800"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-4 rounded-xl shadow-lg shadow-rose-200 flex items-center justify-center gap-2 transition-all transform active:scale-95 mt-4"
          >
            {isLoading ? (
              "Iniciando..."
            ) : (
              <>
                Iniciar Atendimento <ArrowRight size={20} />
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            className="w-full text-center text-sm text-gray-400 hover:text-gray-600 py-2"
          >
            Voltar
          </button>
        </form>
      </div>
    </div>
  );
}