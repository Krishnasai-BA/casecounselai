export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageData?: string; // base64 image
};

export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
};

const STORAGE_KEY = "legal-assistant-conversations";

export function generateId(): string {
  return crypto.randomUUID();
}

export function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveConversations(conversations: Conversation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
}

export function createConversation(): Conversation {
  return {
    id: generateId(),
    title: "New Conversation",
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function generateTitle(firstMessage: string): string {
  const trimmed = firstMessage.slice(0, 50).trim();
  return trimmed.length < firstMessage.length ? trimmed + "…" : trimmed;
}
