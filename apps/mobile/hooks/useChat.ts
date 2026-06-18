import { useState, useRef, useCallback, useEffect } from "react";
import { Message } from "@omnia/shared-types";
import { useProviderStore } from "../store/provider-store";
import { OpenAIProvider, OpenAICompatibleProvider } from "@omnia/providers";
import { openDatabase, createMessageRepo, createConversationRepo } from "@omnia/storage";
import { logger } from "@omnia/logger";
import { useTranslation } from "../lib/i18n";
import { useSettingsStore } from "../store/settings-store";
import * as Haptics from "expo-haptics";
import * as FileSystem from "expo-file-system/legacy";
import { extractText } from "expo-pdf-text-extract";
import { Attachment } from "../components/chat/AttachmentPill";

let _db: any;
let _msgRepo: any;
let _convRepo: any;

function getDb() {
  if (!_db) {
    _db = openDatabase();
    _msgRepo = createMessageRepo(_db);
    _convRepo = createConversationRepo(_db);
  }
  return { db: _db, msgRepo: _msgRepo, convRepo: _convRepo };
}

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function useChat(conversationId: string | undefined, initialPrompt?: string) {
  const store = useProviderStore();
  const { t } = useTranslation();
  const hasTriggeredPrompt = useRef(false);

  const [messages, setMessages] = useState<Message[]>(() => {
    if (!conversationId) return [];
    try {
      return getDb().msgRepo.listByConversation(conversationId);
    } catch {
      return [];
    }
  });
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [convTitle, setConvTitle] = useState(() => {
    if (!conversationId) return "Chat";
    try {
      const conv = getDb().convRepo.getById(conversationId);
      return conv?.title || "Chat";
    } catch {
      return "Chat";
    }
  });

  const isAbortedRef = useRef(false);
  const consecutiveFailuresRef = useRef(0);
  const CIRCUIT_BREAKER_THRESHOLD = 2;

  const getProvider = useCallback(() => {
    if (store.activeProviderId === "openai") {
      return {
        provider: new OpenAIProvider(),
        config: { apiKey: store.openaiApiKey },
        modelId: store.openaiModelId,
      };
    } else if (store.activeProviderId === "openai-compatible") {
      return {
        provider: new OpenAICompatibleProvider(),
        config: { baseUrl: store.compatibleBaseUrl, apiKey: store.compatibleApiKey || undefined },
        modelId: store.compatibleModelId,
      };
    }
    return null;
  }, [store]);

  const handleStop = useCallback(() => {
    isAbortedRef.current = true;
    setIsStreaming(false);
  }, []);

  const handleSend = useCallback(async (text: string, attachments?: Attachment[], isInitialPrompt: boolean = false) => {
    logger.info("Chat.handleSend", `User initiated send. Text length: ${text.length}`);
    const providerCtx = getProvider();
    if (!providerCtx) {
      logger.warn("Chat.handleSend", "No provider context available. Aborting send.");
      return;
    }
    if (!conversationId) return;

    isAbortedRef.current = false;
    const baseTimestamp = Date.now();
    const assistantId = generateId();
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

    const processedAttachments: Attachment[] = [];
    if (attachments && attachments.length > 0) {
      const attachmentDir = (FileSystem.documentDirectory || "file:///tmp/") + 'omnia_attachments/';
      try {
        const dirInfo = await FileSystem.getInfoAsync(attachmentDir);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(attachmentDir, { intermediates: true });
        }
      } catch (e) {}

      for (const att of attachments) {
        try {
          const ext = att.uri.split('.').pop() || 'tmp';
          const newFileName = `${generateId()}.${ext}`;
          const destUri = attachmentDir + newFileName;
          await FileSystem.copyAsync({ from: att.uri, to: destUri });
          processedAttachments.push({ ...att, uri: destUri });
        } catch (err) {
          processedAttachments.push(att);
        }
      }
    }

    const userMessage: Message | null = isInitialPrompt ? null : {
      id: generateId(),
      conversationId: conversationId,
      role: "user",
      content: text,
      timestamp: baseTimestamp,
      attachments: processedAttachments.length > 0 ? processedAttachments : undefined,
    };

    const snapshotForApi = isInitialPrompt ? [...messages] : [...messages, userMessage!];
    const isFirstMessage = messages.length === 0 && userMessage;

    setMessages((currentPrev) => {
      return isInitialPrompt ? [...currentPrev, assistantMessage] : [...currentPrev, userMessage!, assistantMessage];
    });

    setIsStreaming(true);

    // Fire and forget
    (async () => {
      let extractingInterval: NodeJS.Timeout | null = null;
      if (hasDocuments) {
        const extractingPhases = [
          "chat.status.extracting.1",
          "chat.status.extracting.2",
          "chat.status.extracting.3",
          "chat.status.extracting.4",
        ];
        let dots = 1;
        let cycle = 0;
        extractingInterval = setInterval(() => {
          dots = (dots % 3) + 1;
          if (dots === 1) cycle++;
          const phaseKey = extractingPhases[cycle % extractingPhases.length];
          // @ts-ignore
          const pulsingText = `_${t(phaseKey)}${".".repeat(dots)}_`;
          setMessages((cur) => cur.map((m) => m.id === assistantId ? { ...m, content: pulsingText } : m));
        }, 600);
      }

      let chatHistory: any[];
      try {
        chatHistory = await Promise.all(snapshotForApi.map(async (m) => {
          if (m.attachments && m.attachments.length > 0) {
            const contentParts: any[] = [];
            if (m.content) contentParts.push({ type: "text", text: m.content });
            
            for (const att of m.attachments) {
              if (isAbortedRef.current) break;
              if (att.type === 'image') {
                try {
                  const base64 = await FileSystem.readAsStringAsync(att.uri, { encoding: FileSystem.EncodingType.Base64 });
                  const mime = att.mimeType || 'image/jpeg';
                  contentParts.push({ type: "image_url", image_url: { url: `data:${mime};base64,${base64}` } });
                } catch (err) {
                  contentParts.push({ type: "text", text: "\n[System: Could not read image attachment data]" });
                }
              } else if (att.type === 'document') {
                const ext = att.name.toLowerCase().split('.').pop() || '';
                const isPdf = ext === 'pdf' || att.mimeType === 'application/pdf';
                if (isPdf) {
                  try {
                    const extractedText = await extractText(att.uri);
                    if (extractedText && extractedText.trim().length > 0) {
                      const limit = 30000;
                      if (extractedText.length > limit) {
                        contentParts.push({ type: "text", text: `\n\n[Content of PDF: ${att.name}]\n${extractedText.substring(0, limit)}\n\n[System Warning: Truncated]` });
                      } else {
                        contentParts.push({ type: "text", text: `\n\n[Content of PDF: ${att.name}]\n${extractedText}` });
                      }
                    } else throw new Error("PDF_EMPTY");
                  } catch (err) {
                    throw new Error(`PDF_EXTRACTION_FAILED:${att.name}`);
                  }
                } else if (['txt', 'md', 'csv', 'json'].includes(ext)) {
                  try {
                    const fileText = await FileSystem.readAsStringAsync(att.uri, { encoding: FileSystem.EncodingType.UTF8 });
                    contentParts.push({ type: "text", text: `\n\n[Content of Document: ${att.name}]\n${fileText.substring(0, 30000)}` });
                  } catch (err) {}
                }
              }
            }
            const hasImages = contentParts.some(p => p.type === 'image_url');
            if (!hasImages) {
              return { role: m.role as any, content: contentParts.map(p => p.text).join('\n') };
            }
            return { role: m.role as any, content: contentParts };
          }
          return { role: m.role as any, content: m.content };
        }));
      } catch (err: any) {
        if (extractingInterval) clearInterval(extractingInterval);
        // @ts-ignore
        let errorMsg = `_[${t("chat.status.extractionFailed")}]_`;
        if (err.message && err.message.startsWith("PDF_EXTRACTION_FAILED")) {
          // @ts-ignore
          errorMsg = t("chat.error.pdfExtraction").replace("{fileName}", err.message.split(":")[1]);
        }
        setMessages((cur) => cur.map((m) => m.id === assistantId ? { ...m, content: errorMsg } : m));
        try { getDb().msgRepo.updateContent(assistantId, errorMsg); } catch(e){}
        setIsStreaming(false);
        isAbortedRef.current = false;
        return;
      }
      
      if (extractingInterval) clearInterval(extractingInterval);

      try {
        const { convRepo, msgRepo } = getDb();
        if (isInitialPrompt && !convRepo.getById(conversationId)) {
          convRepo.create({
            id: conversationId,
            // @ts-ignore
            title: t("chat.defaultTitle"),
            createdAt: Date.now(),
          });
        }
        if (userMessage) msgRepo.create(userMessage);
        msgRepo.create(assistantMessage);
        if (isFirstMessage) {
          convRepo.update(conversationId, { title: text.slice(0, 40) });
          setConvTitle(text.slice(0, 40));
        }
      } catch (err) {}

      if (isAbortedRef.current) {
        // @ts-ignore
        const stoppedMsg = `_[${t("chat.status.stopped")}]_`;
        setMessages((cur) => cur.map((m) => m.id === assistantId ? { ...m, content: stoppedMsg } : m));
        try { getDb().msgRepo.updateContent(assistantId, stoppedMsg); } catch(e){}
        setIsStreaming(false);
        isAbortedRef.current = false;
        return;
      }

      let fullContent = "";
      if (hasDocuments) {
        setMessages((cur) => cur.map((m) => m.id === assistantId ? { ...m, content: "" } : m));
      }

      try {
        const stream = providerCtx.provider.streamChat(providerCtx.config, {
          messages: chatHistory,
          modelId: providerCtx.modelId,
          stream: true,
        });

        let lastHapticTime = Date.now();
        let lastSqliteTime = Date.now();
        
        for await (const chunk of stream) {
          if (isAbortedRef.current) break;
          if (chunk.done) break;
          fullContent += chunk.content;
          
          const now = Date.now();
          if (useSettingsStore.getState().hapticsEnabled) {
            if (now - lastHapticTime > 80) {
              Haptics.selectionAsync();
              lastHapticTime = now;
            }
          }
          if (now - lastSqliteTime > 500) {
            try { getDb().msgRepo.updateContent(assistantId, fullContent); } catch (err) {}
            lastSqliteTime = now;
          }
          setMessages((cur) => cur.map((m) => m.id === assistantId ? { ...m, content: fullContent } : m));
        }

        try { getDb().msgRepo.updateContent(assistantId, fullContent); } catch (err) {}
      } catch (e: any) {
        if (isAbortedRef.current) {
          try { getDb().msgRepo.updateContent(assistantId, fullContent); } catch (err) {}
          return;
        }

        consecutiveFailuresRef.current += 1;
        if (store.activeProviderId === "openai" && consecutiveFailuresRef.current >= CIRCUIT_BREAKER_THRESHOLD) {
          consecutiveFailuresRef.current = 0;
          // @ts-ignore
          const fallbackMsg = t("chat.error.networkUnstable");
          setMessages((cur) => cur.map((m) => m.id === assistantId ? { ...m, content: fallbackMsg } : m));
          try { getDb().msgRepo.updateContent(assistantId, fallbackMsg); } catch (err) {}
          if (useSettingsStore.getState().hapticsEnabled) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          }
        } else {
          // @ts-ignore
          const errMsg = `_[${t("chat.error.network")}]_\n\n\`\`\`\n${e.message || String(e)}\n\`\`\``;
          setMessages((cur) => cur.map((m) => m.id === assistantId ? { ...m, content: errMsg } : m));
          try { getDb().msgRepo.updateContent(assistantId, errMsg); } catch (err) {}
        }
      } finally {
        setIsStreaming(false);
        isAbortedRef.current = false;
      }
    })();
  }, [conversationId, getProvider, messages, store.activeProviderId, t]);

  useEffect(() => {
    if (!conversationId) return;
    try {
      const conv = getDb().convRepo.getById(conversationId);
      if (conv) setConvTitle(conv.title);
      const history = getDb().msgRepo.listByConversation(conversationId);
      setMessages(history);
      if (initialPrompt && !hasTriggeredPrompt.current) {
        hasTriggeredPrompt.current = true;
        setTimeout(() => { handleSend(initialPrompt, undefined, true); }, 300);
      }
    } catch (err) {}
  }, [conversationId, initialPrompt, handleSend]);

  return {
    messages,
    isStreaming,
    convTitle,
    handleSend,
    handleStop,
  };
}
