import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Pega a URL do n8n que você configurou na Vercel
    const n8nUrl = process.env.NEXT_PUBLIC_N8N_LEAD_URL;

    if (!n8nUrl) {
      console.error("URL do N8N LEAD não configurada");
      return NextResponse.json({ error: "Configuração ausente" }, { status: 500 });
    }

    // O Servidor do Next.js envia para o n8n (Aqui não tem bloqueio de CORS)
    const response = await fetch(n8nUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
       console.error("Erro n8n lead:", response.statusText);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Erro API Lead:", error);
    // Retorna sucesso mesmo com erro para não travar o usuário
    return NextResponse.json({ success: true }); 
  }
}