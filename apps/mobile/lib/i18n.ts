import { useSettingsStore } from "../store/settings-store";
import { getLocales } from "expo-localization";

const en = {
  // Navigation
  "nav.chats": "Chats",
  "nav.settings": "Settings",
  
  // Settings
  "settings.title": "Settings",
  "settings.provider.title": "AI Provider",
  "settings.provider.description": "Configure where your chat requests are processed. Changes take effect on the next message.",
  "settings.provider.local": "Local Network (Ollama / LMStudio)",
  "settings.provider.openai": "OpenAI (Cloud)",
  "settings.disconnect": "Disconnect",
  "settings.connect": "Connect Provider",
  "settings.connected": "Connected",
  
  // Appearance
  "settings.appearance.title": "Appearance",
  "settings.appearance.theme": "Theme",
  "settings.appearance.theme.system": "System Default",
  "settings.appearance.theme.dark": "Dark",
  "settings.appearance.theme.light": "Light",
  "settings.appearance.language": "Language",
  "settings.appearance.language.system": "System Default",
  
  // Chat
  "chat.empty.title": "What can I help with?",
  "chat.input.placeholder": "Message Omnia...",
  "chat.delete.title": "Delete Chat",
  "chat.delete.message": "will be permanently deleted. This cannot be undone.",
  "chat.delete.confirm": "Delete",
};

const pt: typeof en = {
  "nav.chats": "Conversas",
  "nav.settings": "Configurações",
  
  "settings.title": "Configurações",
  "settings.provider.title": "Provedor de IA",
  "settings.provider.description": "Configure onde suas requisições são processadas. Alterações aplicam-se à próxima mensagem.",
  "settings.provider.local": "Rede Local (Ollama / LMStudio)",
  "settings.provider.openai": "OpenAI (Nuvem)",
  "settings.disconnect": "Desconectar",
  "settings.connect": "Conectar Provedor",
  "settings.connected": "Conectado",
  
  "settings.appearance.title": "Aparência",
  "settings.appearance.theme": "Tema",
  "settings.appearance.theme.system": "Padrão do Sistema",
  "settings.appearance.theme.dark": "Escuro",
  "settings.appearance.theme.light": "Claro",
  "settings.appearance.language": "Idioma",
  "settings.appearance.language.system": "Padrão do Sistema",
  
  "chat.empty.title": "Como posso ajudar?",
  "chat.input.placeholder": "Mensagem para Omnia...",
  "chat.delete.title": "Excluir Conversa",
  "chat.delete.message": "será excluída permanentemente. Isso não pode ser desfeito.",
  "chat.delete.confirm": "Excluir",
};

const es: typeof en = {
  "nav.chats": "Chats",
  "nav.settings": "Ajustes",
  
  "settings.title": "Ajustes",
  "settings.provider.title": "Proveedor de IA",
  "settings.provider.description": "Configura dónde se procesan tus solicitudes. Los cambios se aplican al siguiente mensaje.",
  "settings.provider.local": "Red Local (Ollama / LMStudio)",
  "settings.provider.openai": "OpenAI (Nube)",
  "settings.disconnect": "Desconectar",
  "settings.connect": "Conectar Proveedor",
  "settings.connected": "Conectado",
  
  "settings.appearance.title": "Apariencia",
  "settings.appearance.theme": "Tema",
  "settings.appearance.theme.system": "Predeterminado del Sistema",
  "settings.appearance.theme.dark": "Oscuro",
  "settings.appearance.theme.light": "Claro",
  "settings.appearance.language": "Idioma",
  "settings.appearance.language.system": "Predeterminado del Sistema",
  
  "chat.empty.title": "¿En qué puedo ayudarte?",
  "chat.input.placeholder": "Mensaje para Omnia...",
  "chat.delete.title": "Eliminar Chat",
  "chat.delete.message": "se eliminará permanentemente. Esto no se puede deshacer.",
  "chat.delete.confirm": "Eliminar",
};

const dictionaries = { en, pt, es };
type DictionaryKey = keyof typeof en;

export function useTranslation() {
  const storeLang = useSettingsStore((s) => s.language);
  
  let activeLang = storeLang;
  if (activeLang === "system") {
    const systemLocale = getLocales()[0]?.languageCode || "en";
    if (systemLocale === "pt" || systemLocale === "es") {
      activeLang = systemLocale;
    } else {
      activeLang = "en"; // fallback
    }
  }

  const dict = dictionaries[activeLang as keyof typeof dictionaries] || dictionaries.en;

  const t = (key: DictionaryKey) => dict[key] || en[key] || key;

  return { t, language: activeLang };
}
