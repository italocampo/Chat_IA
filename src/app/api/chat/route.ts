import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

// Defina sua URL de PRODUÇÃO do n8n aqui ou no .env
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, message, phone } = body;

    if (!sessionId || !message) {
      return NextResponse.json(
        { success: false, error: "Dados incompletos" },
        { status: 400 }
      );
    }

    // Envia para o n8n e AGUARDA a resposta (await)
    const n8nResponse = await fetch(N8N_WEBHOOK_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        message,
        phone,
        messageId: uuidv4()
      }),
    });

    if (!n8nResponse.ok) {
      throw new Error(`Erro n8n: ${n8nResponse.statusText}`);
    }

    // Pega o JSON que o nó "Respond to Webhook" devolveu
    const data = await n8nResponse.json();

    // Retorna a resposta da IA direto para o front-end
    return NextResponse.json({
      success: true,
      reply: data.reply || data.output || "Sem resposta da IA" 
    });

  } catch (error) {
    console.error("Erro API Route:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}