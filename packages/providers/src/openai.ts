import { LLMProvider, ProviderConnectionConfig, ChatRequest, StreamChunk, Model } from "@omnia/shared-types";

/**
 * Exponential Backoff with Jitter for network resilience.
 */
async function fetchWithBackoff(url: string, options: any, maxRetries = 3): Promise<Response> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const response = await fetch(url, options);
      // Retry on Rate Limit (429) or Server Error (5xx)
      if (response.ok || (response.status !== 429 && response.status < 500)) {
        return response;
      }
    } catch (err) {
      if (attempt === maxRetries - 1) throw err;
    }
    
    attempt++;
    const baseWait = Math.pow(2, attempt) * 500; // 1s, 2s, 4s...
    const jitter = Math.random() * 200; // Up to 200ms jitter
    await new Promise(resolve => setTimeout(resolve, baseWait + jitter));
  }
  throw new Error("Max retries exceeded");
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export class OpenAIProvider implements LLMProvider {
  public readonly id = "openai";
  public readonly name = "OpenAI";

  private getHeaders(config: ProviderConnectionConfig): HeadersInit {
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${config.apiKey}`,
      "Idempotency-Key": generateUUID(), // Prevent duplicate processing on network retries
      "X-Request-ID": generateUUID()
    };
  }

  async validateConnection(config: ProviderConnectionConfig): Promise<boolean> {
    if (!config.apiKey) return false;
    
    try {
      const response = await fetchWithBackoff("https://api.openai.com/v1/models", {
        headers: this.getHeaders(config)
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async listModels(config: ProviderConnectionConfig): Promise<Model[]> {
    if (!config.apiKey) return [];
    
    try {
      const response = await fetchWithBackoff("https://api.openai.com/v1/models", {
        headers: this.getHeaders(config)
      });
      
      if (!response.ok) return [];
      
      const data = await response.json();
      // Filter for standard chat models to keep the list clean
      const chatModels = data.data.filter((m: any) => m.id.startsWith("gpt-") || m.id.startsWith("o1-") || m.id.startsWith("o3-"));
      
      return chatModels.map((m: any) => ({
        id: m.id,
        name: m.id,
        providerId: this.id
      }));
    } catch {
      return [];
    }
  }

  async *streamChat(config: ProviderConnectionConfig, request: ChatRequest): AsyncGenerator<StreamChunk, void, unknown> {
    const response = await fetchWithBackoff("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: this.getHeaders(config),
      body: JSON.stringify({
        model: request.modelId,
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        stream: true
      }),
      reactNative: { textStreaming: true }
    } as any);

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error("No response body");
    }

    // Modern environments (like Expo SDK 56 + Hermes) support web streams
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed === "") continue;
          if (trimmed === "data: [DONE]") {
            yield { content: "", done: true };
            return;
          }
          if (trimmed.startsWith("data: ")) {
            const dataStr = trimmed.slice(6);
            try {
              const data = JSON.parse(dataStr);
              const content = data.choices[0]?.delta?.content || "";
              if (content) {
                yield { content, done: false };
              }
            } catch (e) {
              console.error("Failed to parse stream chunk", e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}
