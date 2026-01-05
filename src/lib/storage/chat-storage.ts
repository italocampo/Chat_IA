import type { Message } from "@/lib/types/chat";

const STORAGE_PREFIX = "chat_messages_";

export function getMessages(sessionId: string): Message[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(`${STORAGE_PREFIX}${sessionId}`);
  if (!stored) return [];
  try {
    const messages = JSON.parse(stored);
    // Converte strings de data de volta para objetos Date
    return messages.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }));
  } catch (e) {
    console.error("Erro ao carregar mensagens", e);
    return [];
  }
}

export function saveMessage(sessionId: string, message: Message) {
  if (typeof window === "undefined") return;
  const messages = getMessages(sessionId);
  // Evita duplicatas
  if (!messages.find((m) => m.id === message.id)) {
    messages.push(message);
    localStorage.setItem(
      `${STORAGE_PREFIX}${sessionId}`,
      JSON.stringify(messages)
    );
  }
}

export function updateMessageStatus(
  sessionId: string,
  messageId: string,
  status: Message["status"]
) {
  if (typeof window === "undefined") return;
  const messages = getMessages(sessionId);
  const updatedMessages = messages.map((msg) =>
    msg.id === messageId ? { ...msg, status } : msg
  );
  localStorage.setItem(
    `${STORAGE_PREFIX}${sessionId}`,
    JSON.stringify(updatedMessages)
  );
}

// ESSA É A FUNÇÃO QUE FALTAVA
export function clearMessages(sessionId: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(`${STORAGE_PREFIX}${sessionId}`);
}