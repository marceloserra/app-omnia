import { useState, useRef, useCallback, useEffect } from "react";
import { Message } from "@omnia/shared-types";
import { useProviderStore } from "../store/provider-store";
import { logger } from "@omnia/logger";
import { useTranslation } from "../lib/i18n";
import { useSettingsStore } from "../store/settings-store";
import * as Haptics from "expo-haptics";
import { Attachment } from "../components/chat/AttachmentPill";
import { chatService } from "../services/ChatService";

export function useChat(conversationId: string | undefined, initialPrompt?: string) {
  const store = useProviderStore();
  const { t } = useTranslation();
  const hasTriggeredPrompt = useRef(false);

  const [messages, setMessages] = useState<Message[]>(() => {
    if (!conversationId) return [];
    return chatService.listMessages(conversationId);
  });
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [convTitle, setConvTitle] = useState(() => {
    if (!conversationId) return "Chat";
    return chatService.getConversation(conversationId)?.title || "Chat";
  });

  const isAbortedRef = useRef(false);
  const consecutiveFailuresRef = useRef(0);
  const CIRCUIT_BREAKER_THRESHOLD = 2;

  const handleStop = useCallback(() => {
    isAbortedRef.current = true;
    setIsStreaming(false);
  }, []);

  const handleSend = useCallback(async (text: string, attachments?: Attachment[], isInitialPrompt: boolean = false) => {
    const providerCtx = chatService.getProviderContext(store);
    if (!providerCtx || !conversationId) return;

    isAbortedRef.current = false;
    const baseTimestamp = Date.now();
    const assistantId = chatService.generateId();
    const hasDocuments = attachments && attachments.some(a => a.type === 'document');
    
    // @ts-ignore
    const assistantMessage: Message = {
      id: assistantId,
      conversationId: conversationId,
      role: "assistant",
      content: hasDocuments ? `_${t("chat.status.extracting.1")}..._` : "",
      providerId: store.activeProviderId ?? undefined,
      modelId: providerCtx.modelId,
      timestamp: baseTimestamp + 1,
    };

    let processedAttachments: Attachment[] = [];
    if (attachments && attachments.length > 0) {
      processedAttachments = await chatService.processAttachments(attachments);
    }

    const userMessage: Message | null = isInitialPrompt ? null : {
      id: chatService.generateId(),
      conversationId: conversationId,
      role: "user",
      content: text,
      timestamp: baseTimestamp,
      attachments: processedAttachments.length > 0 ? processedAttachments : undefined,
    };

    const currentMessages = chatService.listMessages(conversationId);
    const snapshotForApi = isInitialPrompt ? [...currentMessages] : [...currentMessages, userMessage!];
    const isFirstMessage = currentMessages.length === 0 && userMessage;

    setMessages((currentPrev) => {
      return isInitialPrompt ? [...currentPrev, assistantMessage] : [...currentPrev, userMessage!, assistantMessage];
    });

    setIsStreaming(true);

    // Fire and forget Async Execution
    (async () => {
      let extractingInterval: NodeJS.Timeout | null = null;
      if (hasDocuments) {
        const extractingPhases = ["chat.status.extracting.1", "chat.status.extracting.2", "chat.status.extracting.3", "chat.status.extracting.4"];
        let cycle = 0;
        extractingInterval = setInterval(() => {
          const dots = (cycle % 3) + 1;
          // @ts-ignore
          const phaseKey = extractingPhases[Math.floor(cycle / 3) % extractingPhases.length];
          setMessages(cur => cur.map(m => m.id === assistantId ? { ...m, content: `_${t(phaseKey as any)}${".".repeat(dots)}_` } : m));
          cycle++;
        }, 600);
      }

      let chatHistory: any[];
      try {
        chatHistory = await chatService.buildApiPayload(snapshotForApi, isAbortedRef);
      } catch (err: any) {
        if (extractingInterval) clearInterval(extractingInterval);
        // @ts-ignore
        const errorMsg = `_${t("chat.status.extractionFailed")}_`;
        setMessages((cur) => cur.map((m) => (m.id === assistantId ? { ...m, content: errorMsg } : m)));
        chatService.updateMessageContent(assistantId, errorMsg);
        setIsStreaming(false);
        return;
      }
      
      if (extractingInterval) clearInterval(extractingInterval);

      if (isInitialPrompt) {
        // @ts-ignore
        chatService.createConversation(conversationId, t("chat.defaultTitle"));
      }
      if (userMessage) chatService.saveMessage(userMessage);
      chatService.saveMessage(assistantMessage);
      if (isFirstMessage) {
        chatService.updateConversationTitle(conversationId, text.slice(0, 40));
        setConvTitle(text.slice(0, 40));
      }

      if (isAbortedRef.current) {
        // @ts-ignore
        const stoppedMsg = `_${t("chat.status.stopped")}_`;
        setMessages(cur => cur.map(m => m.id === assistantId ? { ...m, content: stoppedMsg } : m));
        chatService.updateMessageContent(assistantId, stoppedMsg);
        setIsStreaming(false);
        isAbortedRef.current = false;
        return;
      }

      if (hasDocuments) {
        setMessages(cur => cur.map(m => m.id === assistantId ? { ...m, content: "" } : m));
      }

      try {
        let lastHapticTime = Date.now();
        let lastSqliteTime = Date.now();
        
        const finalContent = await chatService.streamResponse(providerCtx, chatHistory, isAbortedRef, (chunkText) => {
          const now = Date.now();
          if (useSettingsStore.getState().hapticsEnabled && now - lastHapticTime > 80) {
            Haptics.selectionAsync();
            lastHapticTime = now;
          }
          if (now - lastSqliteTime > 500) {
            chatService.updateMessageContent(assistantId, chunkText);
            lastSqliteTime = now;
          }
          setMessages(cur => cur.map(m => m.id === assistantId ? { ...m, content: chunkText } : m));
        });

        chatService.updateMessageContent(assistantId, finalContent);
      } catch (e: any) {
        if (isAbortedRef.current) return;
        consecutiveFailuresRef.current += 1;
        if (store.activeProviderId === "openai" && consecutiveFailuresRef.current >= CIRCUIT_BREAKER_THRESHOLD) {
          consecutiveFailuresRef.current = 0;
          // @ts-ignore
          const fallbackMsg = t("chat.error.networkUnstable");
          setMessages(cur => cur.map(m => m.id === assistantId ? { ...m, content: fallbackMsg } : m));
          chatService.updateMessageContent(assistantId, fallbackMsg);
          if (useSettingsStore.getState().hapticsEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          store.setActiveProvider("openai-compatible");
        } else {
          // @ts-ignore
          const errMsg = `_${t("chat.error.network")}_\n\n\`\`\`\n${e.message || String(e)}\n\`\`\``;
          setMessages(cur => cur.map(m => m.id === assistantId ? { ...m, content: errMsg } : m));
          chatService.updateMessageContent(assistantId, errMsg);
        }
      } finally {
        if (isAbortedRef.current) {
          // @ts-ignore
          const stoppedMsg = `_${t("chat.status.stopped")}_`;
          setMessages((cur) => cur.map((m) => m.id === assistantId ? { ...m, content: stoppedMsg } : m));
          chatService.updateMessageContent(assistantId, stoppedMsg);
        } else {
          consecutiveFailuresRef.current = 0;
        }
        setIsStreaming(false);
        isAbortedRef.current = false;
      }
    })();
  }, [conversationId, store, t]);

  useEffect(() => {
    if (!conversationId) return;
    const conv = chatService.getConversation(conversationId);
    if (conv) setConvTitle(conv.title);
    setMessages(chatService.listMessages(conversationId));
    if (initialPrompt && !hasTriggeredPrompt.current) {
      hasTriggeredPrompt.current = true;
      setTimeout(() => { handleSend(initialPrompt, undefined, true); }, 300);
    }
  }, [conversationId, initialPrompt, handleSend]);

  return {
    messages,
    isStreaming,
    convTitle,
    handleSend,
    handleStop,
  };
}
