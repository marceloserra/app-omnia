# ADR 0016: Premium Mobile UI Patterns (Bottom Sheets and Confirm Dialogs)

## Status

Accepted

## Context

Phase 8 introduced conversation management actions (Pin, Rename, Delete, Clear All). Early implementations used native OS popups (`Alert.alert`) and fixed-position context menus. However, these patterns break immersion and violate the "FAANG-grade premium UI" standard set for Omnia. Native alerts look jarring against the custom dark mode theme, and fixed floating menus often misalign on different screen sizes.

## Decision

We established custom, pure React Native UI patterns for critical interactions:

1. **Context Menus → Bottom Sheets:**
   Instead of using absolute positioned floating menus for list item actions (e.g., long-pressing a chat), we use an animated Bottom Sheet (`Animated.spring` moving from the bottom edge). This provides a larger touch target, feels native to modern mobile paradigms, and avoids edge-cutoff issues.

2. **Native Alerts → Custom `ConfirmDialog`:**
   Destructive actions (Delete Chat, Clear All History) now use a custom `<ConfirmDialog>` component instead of `Alert.alert`.
   - Uses the app's established design tokens (glassmorphism, `SURFACE_2` backgrounds, custom typography).
   - Includes haptic feedback mapped directly to custom buttons.
   - Preserves dark mode immersion.

## Consequences

- **Positive:** The app feels significantly more premium and cohesive. Users are not snapped out of the experience by system dialogs.
- **Negative:** We must maintain these custom overlay components. Managing multiple custom Modals on Android can sometimes cause Z-index or focus issues, requiring careful `transparent`, `statusBarTranslucent`, and `onRequestClose` handling.

# UX & Architecture Review: Provider Management

Atualmente, o usuário tem dois fluxos de configuração (OpenAI e Local AI), mas faltam mecânicas claras de ativação, visualização de estado e "desconexão" que os usuários esperam em um app _FAANG-grade_.

Aqui estão os problemas que você levantou e minhas propostas de solução.

---

## 1. Como desconectamos o Local Server?

**O problema:** Atualmente, o usuário insere a Base URL do `LM Studio / Ollama` e a salva. Não há um botão "Desconectar" ou "Esquecer".
**A UX Ideal:**
No iOS/Android moderno, conexões a servidores locais são tratadas como "Redes".
Precisamos alterar a seção Local AI no Settings para:

1. Exibir a URL atual com um badge verde "Connected" (se pingar sucesso) ou vermelho "Offline".
2. Um botão destrutivo claro **"Disconnect Server"** que limpa a `baseUrl` do Zustand e desativa o provider local.

---

## 2. Como sabemos se o usuário quer Local ou OpenAI se ele tem os dois?

**O problema:** O Zustand store tem `activeProviderId`. Quando o usuário insere a chave da OpenAI, nós mudamos o `activeProviderId` silenciosamente. Se ele configura o Local, nós também mudamos silenciosamente. O usuário não sabe qual está usando até começar a conversar.
**A UX Ideal:**
Precisamos de um **Provider Toggle / Dropdown** explícito.
Há dois lugares onde apps FAANG colocam isso:

### Opção A: Chat Header Dropdown (Estilo ChatGPT / Claude)

No topo da tela de Chat, onde dizemos "Conversa Atual", nós teríamos um Dropdown:

- `✨ OpenAI (GPT-4o)`
- `💻 Local (LM Studio)`
  _Vantagem:_ Mudança rápida por conversa.
  _Desvantagem:_ Se o Local Server estiver desligado, o chat pode falhar.

### Opção B: Global Provider Switch no Settings (Estilo Notion AI / Obsidian)

No menu principal de Settings, ter um seletor Global: **"Active AI Provider"**

- [ ] OpenAI (Cloud)
- [x] Local Network (Privacy Mode)
      _Vantagem:_ Claridade total do que o app inteiro está usando.

> [!RECOMMENDATION]
> Para a **Phase 8**, recomendo fortemente a **Opção B (Global Switch)** com a adição do modelo no **Sidebar Header**. Já colocamos a "bolinha verde" e o chip no Sidebar (ex: `OpenAI`). Podemos fazer com que clicar naquele chip no Sidebar abra o Bottom Sheet de Settings diretamente na aba de trocar Provider!

---

## 3. Perguntas de Arquitetura para Implementação

Para implementar isso nas próximas tasks da Phase 8, responda:

1. **Desconectar Local:** Devemos apagar a URL do input para sempre quando o usuário clica "Desconectar", ou apenas desativar a conexão (mas lembrar do IP para a próxima vez)? Desativar (estado cinza? nao sei o melhor UI/UX)
2. **Global vs Chat-Level:** Você concorda com a Opção B (Global Switch) gerenciado através da tela de Settings / Sidebar Chip, ao invés de tentar misturar múltiplos provedores dentro da mesma tela de chat? Concordo
3. **Empty States:** Se o usuário desconectar tudo, a tela Home vai exigir "Connect a Provider". O botão "Configure Provider" na Home deve abrir um Bottom Sheet customizado (rápido) ou empurrar para a tela cheia de Settings? Pode ir pra settings, a nao ser que seja bem padrao esse rapido e bem bacana

> [!TIP]
> O FAB do scroll down já foi corrigido. Ele agora fica ancorado na área do `FlatList`, sempre posicionado **16px acima do topo do ChatInput**, não importa o quanto o input expanda!
