import Redis from 'ioredis';

// Conecta usando a variável REDIS_URL que você já tem na Vercel
const redis = new Redis(process.env.REDIS_URL as string);

/**
 * Armazena uma resposta do n8n no Redis
 */
export async function storeResponse(sessionId: string, messageId: string, response: string): Promise<void> {
  const key = `chat:${sessionId}:${messageId}`;
  
  const data = JSON.stringify({
    response,
    timestamp: new Date().toISOString(),
  });

  // 'EX', 3600 = Expira em 1 hora (3600 segundos)
  await redis.set(key, data, 'EX', 3600);
}

/**
 * Recupera e remove uma resposta do Redis
 */
export async function getAndRemoveResponse(
  sessionId: string,
  messageId: string
): Promise<string | null> {
  const key = `chat:${sessionId}:${messageId}`;
  
  // Busca o dado
  const storedString = await redis.get(key);
  
  if (storedString) {
    // Se achou, deleta para não ler repetido
    await redis.del(key);
    
    // Converte de texto para objeto
    const stored = JSON.parse(storedString);
    return stored.response;
  }
  
  return null;
}

/**
 * Verifica se existe resposta pendente
 */
export async function hasResponse(sessionId: string, messageId: string): Promise<boolean> {
  const key = `chat:${sessionId}:${messageId}`;
  const exists = await redis.exists(key);
  return exists === 1;
}

export function cleanOldResponses(): void {
  // Não precisa fazer nada, o Redis limpa sozinho
}