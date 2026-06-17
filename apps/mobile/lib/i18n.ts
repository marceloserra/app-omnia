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

  // Home Suggestions
  "home.suggestion.quantum.title": "Explain quantum computing",
  "home.suggestion.quantum.prompt": "Can you explain quantum computing in simple terms, as if I were a 5-year-old?",
  "home.suggestion.email.title": "Draft an email",
  "home.suggestion.email.prompt": "Draft a professional email requesting a meeting with my team next Tuesday to discuss the Q3 roadmap.",
  "home.suggestion.trip.title": "Plan a weekend trip",
  "home.suggestion.trip.prompt": "Create a 2-day weekend itinerary for a relaxing trip to the mountains. Include activities and meal ideas.",
  "home.suggestion.app.title": "Brainstorm app ideas",
  "home.suggestion.app.prompt": "Give me 5 innovative mobile app ideas that combine artificial intelligence with personal productivity.",

  // New UI Strings
  "home.greeting.morning": "Good morning",
  "home.greeting.afternoon": "Good afternoon",
  "home.greeting.evening": "Good evening",
  "home.greeting.subtitle": "How can I help you today?",
  "home.empty.subtitle": "Connect an AI provider to start chatting",
  "home.empty.cta": "Configure AI Provider",

  "chat.empty.connected": "Connected to {model}. Start typing below.",
  "chat.empty.noprovider": "You need an AI provider to start chatting.",
  "chat.empty.cta": "Configure Provider",
  "chat.error.disconnected": "Provider Disconnected",
  "chat.error.reconnect": "Reconnect",

  "chat.input.disabled": "No provider connected",
  "chat.input.hint": "Omnia can make mistakes. Check important info.",
  "chat.input.attach.title": "Coming Soon",
  "chat.input.attach.msg": "File attachments will be available in Phase 11.",

  "settings.model.select": "Select Model",
  "settings.model.none": "None",
  "settings.model.nomatch": "No models match",
  "settings.provider.update": "Update Active Provider",
  "settings.provider.set": "Set as Active Provider",
  "settings.provider.disconnect": "Disconnect Provider",
  
  "settings.data.title": "Data Management",
  "settings.data.deleteall": "Delete All History",
  "settings.data.confirm.title": "Clear All History",
  "settings.data.confirm.msg": "Are you sure you want to permanently delete all conversations and messages? This cannot be undone.",
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

  // Home Suggestions
  "home.suggestion.quantum.title": "Explicar computação quântica",
  "home.suggestion.quantum.prompt": "Você pode explicar a computação quântica em termos simples, como se eu tivesse 5 anos?",
  "home.suggestion.email.title": "Rascunhar um email",
  "home.suggestion.email.prompt": "Rascunhe um email profissional solicitando uma reunião com a minha equipe na próxima terça-feira para discutir o Q3.",
  "home.suggestion.trip.title": "Planejar uma viagem",
  "home.suggestion.trip.prompt": "Crie um roteiro de fim de semana de 2 dias para uma viagem relaxante nas montanhas. Inclua atividades e refeições.",
  "home.suggestion.app.title": "Ideias de aplicativos",
  "home.suggestion.app.prompt": "Me dê 5 ideias inovadoras de aplicativos mobile que combinam inteligência artificial com produtividade pessoal.",

  "home.greeting.morning": "Bom dia",
  "home.greeting.afternoon": "Boa tarde",
  "home.greeting.evening": "Boa noite",
  "home.greeting.subtitle": "Como posso te ajudar hoje?",
  "home.empty.subtitle": "Conecte um provedor de IA para começar a conversar",
  "home.empty.cta": "Configurar Provedor de IA",

  "chat.empty.connected": "Conectado a {model}. Comece a digitar abaixo.",
  "chat.empty.noprovider": "Você precisa de um provedor de IA para conversar.",
  "chat.empty.cta": "Configurar Provedor",
  "chat.error.disconnected": "Provedor Desconectado",
  "chat.error.reconnect": "Reconectar",

  "chat.input.disabled": "Nenhum provedor conectado",
  "chat.input.hint": "Omnia pode cometer erros. Verifique informações importantes.",
  "chat.input.attach.title": "Em Breve",
  "chat.input.attach.msg": "Anexos de arquivos estarão disponíveis na Fase 11.",

  "settings.model.select": "Selecionar Modelo",
  "settings.model.none": "Nenhum",
  "settings.model.nomatch": "Nenhum modelo encontrado",
  "settings.provider.update": "Atualizar Provedor Ativo",
  "settings.provider.set": "Definir como Provedor Ativo",
  "settings.provider.disconnect": "Desconectar Provedor",

  "settings.data.title": "Gerenciamento de Dados",
  "settings.data.deleteall": "Apagar Todo o Histórico",
  "settings.data.confirm.title": "Limpar Todo o Histórico",
  "settings.data.confirm.msg": "Tem certeza que deseja apagar permanentemente todas as conversas e mensagens? Isso não pode ser desfeito.",
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

  // Home Suggestions
  "home.suggestion.quantum.title": "Explicar computación cuántica",
  "home.suggestion.quantum.prompt": "¿Puedes explicar la computación cuántica en términos simples, como si tuviera 5 años?",
  "home.suggestion.email.title": "Redactar un correo",
  "home.suggestion.email.prompt": "Redacta un correo electrónico profesional solicitando una reunión con mi equipo el próximo martes para discutir el Q3.",
  "home.suggestion.trip.title": "Planear un viaje",
  "home.suggestion.trip.prompt": "Crea un itinerario de fin de semana de 2 días para un viaje relajante a las montañas. Incluye actividades y comidas.",
  "home.suggestion.app.title": "Ideas de aplicaciones",
  "home.suggestion.app.prompt": "Dame 5 ideas innovadoras de aplicaciones móviles que combinen inteligencia artificial con productividad personal.",

  "home.greeting.subtitle": "¿Cómo puedo ayudarte hoy?",
  "home.empty.subtitle": "Conecta un proveedor de IA para empezar a chatear",
  "home.empty.cta": "Configurar Proveedor de IA",

  "chat.empty.connected": "Conectado a {model}. Empieza a escribir abajo.",
  "chat.empty.noprovider": "Necesitas un proveedor de IA para chatear.",
  "chat.empty.cta": "Configurar Proveedor",
  "chat.error.disconnected": "Proveedor Desconectado",
  "chat.error.reconnect": "Reconectar",

  "chat.input.disabled": "Ningún proveedor conectado",
  "chat.input.hint": "Omnia puede cometer errores. Verifica la información importante.",
  "chat.input.attach.title": "Próximamente",
  "chat.input.attach.msg": "Los archivos adjuntos estarán disponibles en la Fase 11.",

  "settings.model.select": "Seleccionar Modelo",
  "settings.model.none": "Ninguno",
  "settings.model.nomatch": "No hay modelos coincidentes",
  "settings.provider.update": "Actualizar Proveedor Activo",
  "settings.provider.set": "Establecer como Proveedor Activo",
  "settings.provider.disconnect": "Desconectar Proveedor",

  "settings.data.title": "Gestión de Datos",
  "settings.data.deleteall": "Borrar Todo el Historial",
  "settings.data.confirm.title": "Limpiar Todo el Historial",
  "settings.data.confirm.msg": "¿Estás seguro de que deseas eliminar permanentemente todas las conversaciones y mensajes? Esto no se puede deshacer.",
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
