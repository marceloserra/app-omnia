import { Message, Conversation } from "@omnia/shared-types";
import { openDatabase, createMessageRepo, createConversationRepo } from "@omnia/storage";
import { logger } from "@omnia/logger";
import { OpenAIProvider, OpenAICompatibleProvider } from "@omnia/providers";
import * as FileSystem from "expo-file-system/legacy";
import { extractText } from "expo-pdf-text-extract";
import { Attachment } from "../components/chat/AttachmentPill";

/**
 * ChatService (Facade Pattern)
 * Abstracts the SQLite database interactions, file system parsing, 
 * and Provider API stream orchestration away from the UI/MVVM layer.
 */
class ChatService {
  private _db: any;
  private _msgRepo: any;
  private _convRepo: any;

  constructor() {
    this._db = openDatabase();
    this._msgRepo = createMessageRepo(this._db);
    this._convRepo = createConversationRepo(this._db);
  }

  generateId() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  // Database Abstractions
  listMessages(conversationId: string): Message[] {
    try {
      return this._msgRepo.listByConversation(conversationId);
    } catch {
      return [];
    }
  }

  getConversation(conversationId: string): Conversation | null {
    try {
      return this._convRepo.getById(conversationId);
    } catch {
      return null;
    }
  }

  createConversation(conversationId: string, title: string) {
    try {
      if (!this._convRepo.getById(conversationId)) {
        this._convRepo.create({
          id: conversationId,
          title,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    } catch (e) {
      logger.error("ChatService", "Failed to create conversation", e);
    }
  }

  updateConversationTitle(conversationId: string, title: string) {
    try {
      this._convRepo.update(conversationId, { title });
    } catch (e) {
      logger.error("ChatService", "Failed to update conversation title", e);
    }
  }

  saveMessage(msg: Message) {
    try {
      this._msgRepo.create({
        ...msg,
        timestamp: msg.timestamp || Date.now()
      });
      this._convRepo.update(msg.conversationId, { updatedAt: Date.now() });
    } catch (e) {
      logger.error("ChatService", "Failed to save message", e);
    }
  }

  updateMessageContent(messageId: string, content: string) {
    try {
      this._msgRepo.updateContent(messageId, content);
    } catch (e) {}
  }

  // Network / Processing Abstractions
  getProviderContext(store: any) {
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
  }

  async processAttachments(attachments: Attachment[]): Promise<Attachment[]> {
    const processed: Attachment[] = [];
    const attachmentDir = (FileSystem.documentDirectory || "file:///tmp/") + 'omnia_attachments/';
    try {
      const dirInfo = await FileSystem.getInfoAsync(attachmentDir);
      if (!dirInfo.exists) await FileSystem.makeDirectoryAsync(attachmentDir, { intermediates: true });
    } catch (e) {}

    for (const att of attachments) {
      try {
        const ext = att.uri.split('.').pop() || 'tmp';
        const destUri = attachmentDir + `${this.generateId()}.${ext}`;
        await FileSystem.copyAsync({ from: att.uri, to: destUri });
        processed.push({ ...att, uri: destUri });
      } catch (err) {
        processed.push(att);
      }
    }
    return processed;
  }

  async buildApiPayload(snapshotForApi: Message[], isAbortedRef: { current: boolean }): Promise<any[]> {
    return Promise.all(snapshotForApi.map(async (m) => {
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
  }

  async streamResponse(
    providerCtx: any,
    chatHistory: any[],
    isAbortedRef: { current: boolean },
    onChunk: (chunkText: string) => void
  ): Promise<string> {
    const stream = providerCtx.provider.streamChat(providerCtx.config, {
      messages: chatHistory,
      modelId: providerCtx.modelId,
      stream: true,
    });

    let fullContent = "";
    for await (const chunk of stream) {
      if (isAbortedRef.current || chunk.done) break;
      fullContent += chunk.content;
      onChunk(fullContent);
    }
    return fullContent;
  }
}

export const chatService = new ChatService();
