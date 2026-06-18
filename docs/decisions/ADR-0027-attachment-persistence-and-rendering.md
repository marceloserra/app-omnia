# ADR-0027: Multi-Modal Attachment Persistence and Rendering

## Status
Accepted

## Context
Phase 10 (Multi-Modal Attachments) introduces the ability for users to attach images, PDFs, and generic files to their messages. 
React Native (via `expo-image-picker` and `expo-document-picker`) returns temporary URIs pointing to the OS's cache directory. 

We need to decide:
1. How to ensure these files survive indefinitely (as chat history is persistent).
2. How to store the relationship between messages and files in SQLite without destroying read performance.
3. How to render them performantly in `MessageBubble` on both iOS and Android.
4. How to supply them to LLM Providers (which often require massive Base64 strings).

## Decisions

### 1. File Persistence (`expo-file-system`)
We will not rely on the temporary cache URIs. Before saving a message, the application MUST move/copy the selected files from the cache directory into a dedicated, persistent application directory (`FileSystem.documentDirectory + 'omnia_attachments/'`).
This guarantees that OS-level cache clearing (very common on Android) does not break old chat history.

### 2. SQLite Schema (Metadata JSON, NO Base64)
We will add an `attachments` column (Type `TEXT`) to the `messages` table.
This column will store a JSON-stringified array of lightweight metadata objects:
```typescript
interface MessageAttachment {
  id: string; // unique UUID
  uri: string; // The persistent file path (e.g., file:///.../omnia_attachments/123.jpg)
  type: 'image' | 'document';
  mimeType?: string;
  name: string;
  size?: number;
}
```
**CRITICAL RULE:** We will NEVER store Base64 image strings inside SQLite. Doing so bloats the database, drastically degrades `SELECT *` query speeds, and leads to Out Of Memory (OOM) crashes on low-end Android devices.

### 3. High-Performance Rendering (`expo-image`)
To render images inside the `MessageBubble` efficiently, we will install and use `expo-image` instead of the standard React Native `<Image>`. 
`expo-image` uses SDWebImage (iOS) and Glide (Android) natively, offering aggressive memory caching, blurhash placeholders, and superior scroll performance. Attachments will be rendered in a grid/flex layout *above* the message text.

### 4. Just-In-Time (JIT) Base64 Encoding
We will read the file from disk, convert it to Base64 *in-memory* exclusively during the API payload construction, and let the garbage collector clean it up immediately after the HTTP request completes.

### 5. Local Native Text Extraction (PDFs & Documents)
OpenAI's Chat Completion API (and local models) do not natively accept raw `.pdf` or `.docx` bytes in the `messages` payload; they only accept `image_url` for Vision. 
To support document attachments immediately (Phase 10) without waiting for the full RAG/Knowledge Base implementation (Phase 13), we will use `expo-pdf-text-extract` (which utilizes native iOS PDFKit and Android PDFBox) to extract text locally and inject it directly into the prompt (e.g., `[Content of PDF]: ...`). Raw text files (`.txt`, `.md`, `.csv`, `.json`) will be read directly via `expo-file-system`.

## Consequences
- **Positive:** SQLite remains incredibly fast and small (only storing strings).
- **Positive:** App memory footprint stays low because Base64 strings are transient.
- **Positive:** Android scroll performance is preserved via `expo-image`.
- **Negative:** Requires file system management (we must remember to delete files from `omnia_attachments/` when a user deletes a conversation or clears history).
- **Negative:** Requires the app to be built as a custom development client (`expo run:ios/android`) because `expo-pdf-text-extract` adds native Swift/Kotlin dependencies.
