export type Role = "system" | "user" | "assistant";

export interface TokenMetadata {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  role: Role;
  content: string;
  timestamp: number;
  providerId?: string; // ID of the provider that generated this (if role is assistant)
  modelId?: string;    // ID of the model that generated this
  metadata?: TokenMetadata;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  systemPrompt?: string;
  isPinned?: boolean;
}
