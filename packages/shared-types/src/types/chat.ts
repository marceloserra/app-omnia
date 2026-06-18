export type Role = "system" | "user" | "assistant";

export interface TokenMetadata {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

export interface MessageAttachment {
  uri: string;
  type: 'image' | 'document';
  mimeType?: string;
  name: string;
  size?: number;
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
  attachments?: MessageAttachment[];
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  systemPrompt?: string;
  isPinned?: boolean;
}
