import { create } from "zustand";

export type ProviderId = "openai" | "openai-compatible";

interface ProviderState {
  // Which provider is active
  activeProviderId: ProviderId | null;

  // OpenAI config
  openaiApiKey: string;
  openaiModelId: string;

  // OpenAI-compatible config (LM Studio, Ollama, etc.)
  compatibleBaseUrl: string;
  compatibleApiKey: string;
  compatibleModelId: string;

  // Connection status
  isValidating: boolean;
  isConnected: boolean;
  connectionError: string | null;
  availableModels: string[];

  // Actions
  setActiveProvider: (id: ProviderId) => void;
  setOpenaiApiKey: (key: string) => void;
  setOpenaiModelId: (modelId: string) => void;
  setCompatibleBaseUrl: (url: string) => void;
  setCompatibleApiKey: (key: string) => void;
  setCompatibleModelId: (modelId: string) => void;
  setValidating: (v: boolean) => void;
  setConnected: (connected: boolean, models?: string[], error?: string) => void;
  reset: () => void;
}

const DEFAULT_STATE = {
  activeProviderId: null as ProviderId | null,
  openaiApiKey: "",
  openaiModelId: "gpt-4o-mini",
  compatibleBaseUrl: "http://localhost:1234/v1",
  compatibleApiKey: "",
  compatibleModelId: "",
  isValidating: false,
  isConnected: false,
  connectionError: null as string | null,
  availableModels: [] as string[],
};

export const useProviderStore = create<ProviderState>((set) => ({
  ...DEFAULT_STATE,

  setActiveProvider: (id) =>
    set({ activeProviderId: id, isConnected: false, connectionError: null, availableModels: [] }),

  setOpenaiApiKey: (key) => set({ openaiApiKey: key }),
  setOpenaiModelId: (modelId) => set({ openaiModelId: modelId }),
  setCompatibleBaseUrl: (url) => set({ compatibleBaseUrl: url }),
  setCompatibleApiKey: (key) => set({ compatibleApiKey: key }),
  setCompatibleModelId: (modelId) => set({ compatibleModelId: modelId }),

  setValidating: (v) => set({ isValidating: v }),

  setConnected: (connected, models = [], error) =>
    set({
      isConnected: connected,
      availableModels: models,
      connectionError: error ?? null,
      isValidating: false,
    }),

  reset: () => set(DEFAULT_STATE),
}));
