import { LLMProvider, ProviderConnectionConfig, ChatRequest, StreamChunk, Model } from "@omnia/shared-types";

export class OpenAICompatibleProvider implements LLMProvider {
  public readonly id = "openai-compatible";
  public readonly name = "Local AI (OpenAI Compatible)";

  private getBaseUrl(config: ProviderConnectionConfig): string {
    // Default to LM Studio default port if not provided
    let url = config.baseUrl || "http://localhost:1234/v1";
    if (url.endsWith("/")) {
      url = url.slice(0, -1);
    }
    return url;
  }

  private getHeaders(config: ProviderConnectionConfig): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json"
    };
    if (config.apiKey) {
      headers["Authorization"] = `Bearer ${config.apiKey}`;
    }
    return headers;
  }

  async validateConnection(config: ProviderConnectionConfig): Promise<boolean> {
    const baseUrl = this.getBaseUrl(config);
    try {
      const response = await fetch(`${baseUrl}/models`, {
        headers: this.getHeaders(config)
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async listModels(config: ProviderConnectionConfig): Promise<Model[]> {
    const baseUrl = this.getBaseUrl(config);
    try {
      const response = await fetch(`${baseUrl}/models`, {
        headers: this.getHeaders(config)
      });
      
      if (!response.ok) return [];
      
      const data = await response.json();
      
      return data.data.map((m: any) => ({
        id: m.id,
        name: m.id,
        providerId: this.id
      }));
    } catch {
      return [];
    }
  }

  async *streamChat(config: ProviderConnectionConfig, request: ChatRequest): AsyncGenerator<StreamChunk, void, unknown> {
    const baseUrl = this.getBaseUrl(config);
    const response = await fetch(`${baseUrl}/chat/completions`, {
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
      throw new Error(`Provider API error: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error("No response body");
    }

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
