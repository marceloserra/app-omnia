import { create } from "zustand";
import { Message } from "@omnia/shared-types";

interface ChatCacheState {
  messagesCache: Record<string, Message[]>; // conversationId -> messages
  
  // Get messages for a specific conversation
  getMessages: (conversationId: string) => Message[] | undefined;
  
  // Set the entire history for a conversation
  setMessages: (conversationId: string, messages: Message[]) => void;
  
  // Add a single message to a conversation's history
  addMessage: (conversationId: string, message: Message) => void;
  
  // Clear cache for a conversation
  clearConversation: (conversationId: string) => void;
  
  // Clear all cache
  clearAll: () => void;
}

export const useChatCacheStore = create<ChatCacheState>((set, get) => ({
  messagesCache: {},

  getMessages: (conversationId) => {
    return get().messagesCache[conversationId];
  },

  setMessages: (conversationId, messages) => {
    set((state) => ({
      messagesCache: {
        ...state.messagesCache,
        [conversationId]: messages,
      },
    }));
  },

  addMessage: (conversationId, message) => {
    set((state) => {
      const existing = state.messagesCache[conversationId] || [];
      // Replace if the message ID already exists (e.g. streaming updates)
      const index = existing.findIndex((m) => m.id === message.id);
      let newMessages;
      if (index >= 0) {
        newMessages = [...existing];
        newMessages[index] = message;
      } else {
        newMessages = [message, ...existing];
      }
      return {
        messagesCache: {
          ...state.messagesCache,
          [conversationId]: newMessages,
        },
      };
    });
  },

  clearConversation: (conversationId) => {
    set((state) => {
      const newCache = { ...state.messagesCache };
      delete newCache[conversationId];
      return { messagesCache: newCache };
    });
  },

  clearAll: () => {
    set({ messagesCache: {} });
  },
}));
