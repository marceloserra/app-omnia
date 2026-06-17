import * as SQLite from "expo-sqlite";
import { Conversation } from "@omnia/shared-types";

export function createConversationRepo(db: SQLite.SQLiteDatabase) {
  return {
    /**
     * Create a new conversation record.
     */
    create(conversation: Conversation): void {
      db.runSync(
        `INSERT INTO conversations (id, title, system_prompt, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?);`,
        [
          conversation.id,
          conversation.title,
          conversation.systemPrompt ?? null,
          conversation.createdAt,
          conversation.updatedAt
        ]
      );
    },

    /**
     * List all conversations, most recently updated first.
     */
    listAll(): Conversation[] {
      const rows = db.getAllSync<{
        id: string;
        title: string;
        system_prompt: string | null;
        created_at: number;
        updated_at: number;
      }>("SELECT * FROM conversations ORDER BY updated_at DESC;");

      return rows.map((r) => ({
        id: r.id,
        title: r.title,
        systemPrompt: r.system_prompt ?? undefined,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
    },

    /**
     * Get a single conversation by ID.
     */
    getById(id: string): Conversation | null {
      const row = db.getFirstSync<{
        id: string;
        title: string;
        system_prompt: string | null;
        created_at: number;
        updated_at: number;
      }>("SELECT * FROM conversations WHERE id = ?;", [id]);

      if (!row) return null;

      return {
        id: row.id,
        title: row.title,
        systemPrompt: row.system_prompt ?? undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    },

    /**
     * Update conversation title or system prompt.
     */
    update(id: string, patch: { title?: string; systemPrompt?: string }): void {
      const now = Date.now();
      if (patch.title !== undefined) {
        db.runSync(
          "UPDATE conversations SET title = ?, updated_at = ? WHERE id = ?;",
          [patch.title, now, id]
        );
      }
      if (patch.systemPrompt !== undefined) {
        db.runSync(
          "UPDATE conversations SET system_prompt = ?, updated_at = ? WHERE id = ?;",
          [patch.systemPrompt, now, id]
        );
      }
    },

    /**
     * Delete a conversation and all its messages (CASCADE).
     */
    delete(id: string): void {
      db.runSync("DELETE FROM conversations WHERE id = ?;", [id]);
    },

    /**
     * Delete all conversations.
     */
    deleteAll(): void {
      db.runSync("DELETE FROM conversations;");
    },
  };
}
