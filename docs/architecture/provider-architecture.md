# Provider Architecture

Provider abstraction is the heart of Omnia.

interface LLMProvider:
- validateConnection()
- listModels()
- streamChat()

Implementations:
- OpenAIProvider
- AnthropicProvider
- GeminiProvider
- OpenAICompatibleProvider

OpenAICompatibleProvider must support:
- LM Studio
- Ollama
- llama.cpp
- vLLM
- LocalAI

Do not create provider implementations for each local platform.