import { kv } from '@vercel/kv';

/**
 * Armazena uma resposta do n8n no Redis
 * Expira automaticamente em 1 hora (3600 segundos)
 */
export async function storeResponse(sessionId: string, messageId: string, response: string): Promise<void> {
  const key = `chat:${sessionId}:${messageId}`;
  
  // Salva o valor e define tempo de vida (TTL) de 1 hora
  await kv.set(key, {
    response,
    timestamp: new Date().toISOString(),
  }, { ex: 3600 });
}

/**
 * Recupera e remove uma resposta do Redis
 */
export async function getAndRemoveResponse(
  sessionId: string,
  messageId: string
): Promise<string | null> {
  const key = `chat:${sessionId}:${messageId}`;
  
  // Tenta buscar o objeto
  const stored = await kv.get<{ response: string }>(key);
  
  if (stored) {
    // Se achou, deleta do banco para não ler duas vezes
    await kv.del(key);
    return stored.response;
  }
  
  return null;
}

/**
 * Verifica se existe resposta pendente (Opcional, mas útil)
 */
export async function hasResponse(sessionId: string, messageId: string): Promise<boolean> {
  const key = `chat:${sessionId}:${messageId}`;
  const exists = await kv.exists(key);
  return exists === 1;
}

// A função cleanOldResponses não é mais necessária, 
// pois o Redis apaga sozinho com o parâmetro { ex: 3600 }
export function cleanOldResponses(): void {
  // No-op (mantido apenas para não quebrar importações antigas se houver)
}