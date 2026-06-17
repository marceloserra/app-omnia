import * as SQLite from "expo-sqlite";
import { Message } from "@omnia/shared-types";

export function createMessageRepo(db: SQLite.SQLiteDatabase) {
  return {
    /**
     * Insert a message into the database.
     */
    create(message: Message): void {
      db.runSync(
        `INSERT INTO messages (id, conversation_id, role, content, provider_id, model_id, prompt_tokens, completion_tokens, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          message.id,
          message.conversationId,
          message.role,
          message.content,
          message.providerId ?? null,
          message.modelId ?? null,
          message.metadata?.promptTokens ?? null,
          message.metadata?.completionTokens ?? null,
          message.timestamp
        ]
      );
    },

    /**
     * Get all messages for a conversation, ordered by timestamp ascending.
     */
    listByConversation(conversationId: string): Message[] {
      const rows = db.getAllSync<{
        id: string;
        conversation_id: string;
        role: string;
        content: string;
        provider_id: string | null;
        model_id: string | null;
        prompt_tokens: number | null;
        completion_tokens: number | null;
        timestamp: number;
      }>(
        "SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC;",
        [conversationId]
      );

      return rows.map((r) => ({
        id: r.id,
        conversationId: r.conversation_id,
        role: r.role as Message["role"],
        content: r.content,
        providerId: r.provider_id ?? undefined,
        modelId: r.model_id ?? undefined,
        timestamp: r.timestamp,
        metadata:
          r.prompt_tokens != null || r.completion_tokens != null
            ? {
                promptTokens: r.prompt_tokens ?? undefined,
                completionTokens: r.completion_tokens ?? undefined,
                totalTokens:
                  (r.prompt_tokens ?? 0) + (r.completion_tokens ?? 0),
              }
            : undefined,
      }));
    },

    /**
     * Update message content (e.g. after streaming completes).
     */
    updateContent(id: string, content: string): void {
      db.runSync("UPDATE messages SET content = ? WHERE id = ?;", [content, id]);
    },

    /**
     * Delete a single message.
     */
    delete(id: string): void {
      db.runSync("DELETE FROM messages WHERE id = ?;", [id]);
    },

    /**
     * Delete all messages for a specific conversation.
     */
    deleteByConversation(conversationId: string): void {
      db.runSync("DELETE FROM messages WHERE conversation_id = ?;", [conversationId]);
    },

    /**
     * Delete all messages.
     */
    deleteAll(): void {
      db.runSync("DELETE FROM messages;");
    },
  };
}
