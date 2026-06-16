# Architectural Thinking

Do not think in screens.

Think in capabilities.

Bad:
Screen -> API -> Render

Good:
Capability -> Domain -> Contract -> Implementation

## Layers

### User Experience Layer
Chat
Conversations
Providers
Settings

### Application Layer
Use Cases
Controllers
Orchestration

### Domain Layer
Provider
Conversation
Message
Model
ConnectionProfile

### Infrastructure Layer
SQLite
OpenAI
Anthropic
LM Studio
Ollama

React Native is an implementation detail.
The domain is the product.