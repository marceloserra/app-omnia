import { LLMProvider, ProviderConnectionConfig, ChatRequest, StreamChunk, Model } from "@omnia/shared-types";

export class OpenAIProvider implements LLMProvider {
  public readonly id = "openai";
  public readonly name = "OpenAI";

  private getHeaders(config: ProviderConnectionConfig): HeadersInit {
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${config.apiKey}`
    };
  }

  async validateConnection(config: ProviderConnectionConfig): Promise<boolean> {
    if (!config.apiKey) return false;
    
    try {
      const response = await fetch("https://api.openai.com/v1/models", {
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
      const response = await fetch("https://api.openai.com/v1/models", {
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
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: this.getHeaders(config),
      body: JSON.stringify({
        model: request.modelId,
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        stream: true
      })
    });

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
