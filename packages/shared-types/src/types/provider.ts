export interface Model {
  id: string;
  name: string;
  providerId: string;
  contextWindow?: number;
}

export interface ProviderConnectionConfig {
  apiKey?: string;
  baseUrl?: string; // Important for OpenAI-compatible providers like LM Studio
}

export interface ChatRequest {
  messages: { role: string; content: string }[];
  modelId: string;
  temperature?: number;
  stream?: boolean;
}

export interface StreamChunk {
  content: string;
  done: boolean;
}

export interface LLMProvider {
  id: string;
  name: string;
  
  validateConnection(config: ProviderConnectionConfig): Promise<boolean>;
  listModels(config: ProviderConnectionConfig): Promise<Model[]>;
  streamChat(config: ProviderConnectionConfig, request: ChatRequest): AsyncGenerator<StreamChunk, void, unknown>;
}
