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
  "settings.appearance.haptics": "Chat Haptic Feedback",
  "settings.appearance.haptics.desc": "Light vibration while generating response",
  
  // Chat
  "chat.empty.title": "What can I help with?",
  "chat.input.placeholder": "Message for Omnia...",
  "chat.input.listening": "Listening...",
  "chat.input.mic_permission_denied": "Microphone permission is required.",
  "chat.input.attachments.max": "Maximum of 4 attachments allowed",
  "chat.drawer.title": "Conversations",
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
  "chat.error.pdfExtraction": "🚨 **Read Error**\n\nCould not extract text from file **{fileName}**. It may be corrupted, password protected, or a rasterized image PDF without OCR.",
  "chat.error.networkUnstable": "Network unstable. Switched to Local AI. Please resend your message.",
  "chat.error.prefix": "Error",
  "chat.error.generic": "Something went wrong.",
  "chat.status.extracting.1": "Reading file",
  "chat.status.extracting.2": "Processing pages",
  "chat.status.extracting.3": "Extracting text",
  "chat.status.extracting.4": "Preparing context",
  "chat.status.extractionFailed": "Extraction Failed",
  "chat.status.stopped": "Stopped",
  "chat.defaultTitle": "New Chat",

  "chat.input.disabled": "No provider connected",
  "chat.input.hint": "Omnia can make mistakes. Check important info.",
  "chat.input.attach.title": "Coming Soon",
  "chat.input.attach.msg": "File attachments will be available in Phase 11.",
  "chat.input.attach.camera": "Camera",
  "chat.input.attach.library": "Photo Library",
  "chat.input.attach.files": "Files",
  "common.cancel": "Cancel",

  "settings.model.select": "Select Model",
  "settings.model.none": "None",
  "settings.model.nomatch": "No models match",
  "settings.provider.update": "Update Active Provider",
  "settings.provider.set": "Set as Active Provider",
  "settings.provider.disconnect": "Disconnect Provider",
  
  "settings.capabilities.title": "Capabilities",
  "settings.capabilities.voice.title": "Voice Dictation",
  "settings.capabilities.voice.subtitle": "Offline Whisper AI Engine",
  "settings.capabilities.voice.downloading": "Downloading Engine: {progress}%",
  "settings.capabilities.voice.enabled": "Enabled",
  "settings.capabilities.voice.get": "Get (57MB)",
  "settings.capabilities.voice.delete.title": "Remove Voice Engine",
  "settings.capabilities.voice.delete.msg": "Are you sure you want to delete the offline dictation engine? You will need to download the ~57MB file again to use dictation.",
  "settings.capabilities.voice.delete.confirm": "Remove",
  "settings.capabilities.voice.req.title": "Voice Engine Required",
  "settings.capabilities.voice.req.msg": "To use incredibly fast, 100% offline dictation, Omnia needs to download the 57MB Whisper AI Engine.",
  
  "settings.data.title": "Data Management",
  "settings.data.deleteall": "Delete All History",
  "settings.data.confirm.title": "Clear All History",
  "settings.data.confirm.msg": "Are you sure you want to permanently delete all conversations and messages? This cannot be undone.",

  "history.buckets.today": "Today",
  "history.buckets.yesterday": "Yesterday",
  "history.buckets.previous7": "Previous 7 Days",
  "history.buckets.previous30": "Previous 30 Days",
  "history.buckets.pinned": "Pinned",
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
  "settings.appearance.haptics": "Vibração no Chat",
  "settings.appearance.haptics.desc": "Vibração leve ao gerar respostas",
  
  "chat.empty.title": "Como posso ajudar?",
  "chat.input.placeholder": "Mensagem para Omnia...",
  "chat.input.listening": "Gravando...",
  "chat.input.mic_permission_denied": "Permissão de microfone é necessária.",
  "chat.input.attachments.max": "Máximo de 4 anexos permitidos",
  "chat.drawer.title": "Conversas",
  "chat.delete.title": "Apagar Conversa",
  "chat.delete.message": "será permanentemente apagada. Esta ação não pode ser desfeita.",
  "chat.delete.confirm": "Apagar",

  // Home Suggestions
  "home.suggestion.quantum.title": "Explique computação quântica",
  "home.suggestion.quantum.prompt": "Pode explicar a computação quântica em termos simples, como se eu tivesse 5 anos?",
  "home.suggestion.email.title": "Escrever um email",
  "home.suggestion.email.prompt": "Escreva um email profissional solicitando uma reunião com minha equipe na próxima terça-feira para discutir o roteiro do 3º trimestre.",
  "home.suggestion.trip.title": "Planejar uma viagem",
  "home.suggestion.trip.prompt": "Crie um roteiro de 2 dias para um final de semana relaxante nas montanhas. Inclua atividades e ideias de refeições.",
  "home.suggestion.app.title": "Ideias para aplicativos",
  "home.suggestion.app.prompt": "Dê-me 5 ideias inovadoras de aplicativos móveis que combinam inteligência artificial com produtividade pessoal.",

  "home.greeting.morning": "Bom dia",
  "home.greeting.afternoon": "Boa tarde",
  "home.greeting.evening": "Boa noite",
  "home.greeting.subtitle": "Como posso ajudar você hoje?",
  "home.empty.subtitle": "Conecte um provedor de IA para conversar",
  "home.empty.cta": "Configurar Provedor",

  "chat.empty.connected": "Conectado a {model}. Digite abaixo.",
  "chat.empty.noprovider": "Você precisa de um provedor de IA para conversar.",
  "chat.empty.cta": "Configurar Provedor",
  "chat.error.disconnected": "Provedor Desconectado",
  "chat.error.reconnect": "Reconectar",
  "chat.error.pdfExtraction": "🚨 **Falha na Leitura**\n\nNão foi possível extrair texto do arquivo **{fileName}**. Ele pode estar corrompido, protegido por senha, ou ser um PDF apenas com imagens rasterizadas sem OCR.",
  "chat.error.networkUnstable": "Rede instável. Trocando para IA Local. Por favor, reenvie a mensagem.",
  "chat.error.prefix": "Erro",
  "chat.error.generic": "Algo deu errado.",
  "chat.status.extracting.1": "Lendo arquivo",
  "chat.status.extracting.2": "Processando páginas",
  "chat.status.extracting.3": "Extraindo texto",
  "chat.status.extracting.4": "Preparando contexto",
  "chat.status.extractionFailed": "Falha na Extração",
  "chat.status.stopped": "Parado",
  "chat.defaultTitle": "Nova Conversa",

  "chat.input.disabled": "Nenhum provedor conectado",
  "chat.input.hint": "O Omnia pode cometer erros. Verifique informações importantes.",
  "chat.input.attach.title": "Em Breve",
  "chat.input.attach.msg": "O envio de arquivos estará disponível na Fase 11.",
  "chat.input.attach.camera": "Câmera",
  "chat.input.attach.library": "Galeria de Fotos",
  "chat.input.attach.files": "Arquivos",
  "common.cancel": "Cancelar",

  "settings.model.select": "Selecionar Modelo",
  "settings.model.none": "Nenhum",
  "settings.model.nomatch": "Nenhum modelo encontrado",
  "settings.provider.update": "Atualizar Provedor",
  "settings.provider.set": "Definir como Ativo",
  "settings.provider.disconnect": "Desconectar Provedor",

  "settings.capabilities.title": "Recursos",
  "settings.capabilities.voice.title": "Ditado por Voz",
  "settings.capabilities.voice.subtitle": "Motor Offline Whisper AI",
  "settings.capabilities.voice.downloading": "Baixando Motor: {progress}%",
  "settings.capabilities.voice.enabled": "Ativado",
  "settings.capabilities.voice.get": "Baixar (57MB)",
  "settings.capabilities.voice.delete.title": "Remover Motor de Voz",
  "settings.capabilities.voice.delete.msg": "Tem certeza de que deseja apagar o motor de ditado offline? Você precisará baixar o arquivo de ~57MB novamente para usar o ditado.",
  "settings.capabilities.voice.delete.confirm": "Remover",
  "settings.capabilities.voice.req.title": "Motor de Voz Necessário",
  "settings.capabilities.voice.req.msg": "Para usar o ditado 100% offline e incrivelmente rápido, o Omnia precisa baixar o Motor de IA Whisper de 57MB.",

  "settings.data.title": "Gerenciamento de Dados",
  "settings.data.deleteall": "Apagar Todo o Histórico",
  "settings.data.confirm.title": "Limpar Todo o Histórico",
  "settings.data.confirm.msg": "Tem certeza que deseja apagar permanentemente todas as conversas e mensagens? Isso não pode ser desfeito.",

  "history.buckets.today": "Hoje",
  "history.buckets.yesterday": "Ontem",
  "history.buckets.previous7": "Últimos 7 dias",
  "history.buckets.previous30": "Últimos 30 dias",
  "history.buckets.pinned": "Fixados",
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
  "settings.appearance.haptics": "Vibración en Chat",
  "settings.appearance.haptics.desc": "Vibración ligera al generar respuestas",
  
  "chat.empty.title": "¿En qué puedo ayudarte?",
  "chat.input.placeholder": "Mensaje para Omnia...",
  "chat.input.listening": "Escuchando...",
  "chat.input.mic_permission_denied": "Se requiere permiso de micrófono.",
  "chat.input.attachments.max": "Máximo de 4 adjuntos permitidos",
  "chat.drawer.title": "Conversaciones",
  "chat.delete.title": "Eliminar Chat",
  "chat.delete.message": "se eliminará permanentemente. Esta acción no se puede deshacer.",
  "chat.delete.confirm": "Eliminar",

  // Home Suggestions
  "home.suggestion.quantum.title": "Explica computación cuántica",
  "home.suggestion.quantum.prompt": "¿Puedes explicar la computación cuántica en términos simples, como si tuviera 5 años?",
  "home.suggestion.email.title": "Escribir un correo",
  "home.suggestion.email.prompt": "Redacta un correo profesional solicitando una reunión con mi equipo el próximo martes para discutir la hoja de ruta del Q3.",
  "home.suggestion.trip.title": "Planear un viaje",
  "home.suggestion.trip.prompt": "Crea un itinerario de 2 días para un fin de semana relajante en las montañas. Incluye actividades e ideas de comidas.",
  "home.suggestion.app.title": "Ideas de aplicaciones",
  "home.suggestion.app.prompt": "Dame 5 ideas innovadoras de aplicaciones móviles que combinen inteligencia artificial con productividad personal.",

  "home.greeting.morning": "Buenos días",
  "home.greeting.afternoon": "Buenas tardes",
  "home.greeting.evening": "Buenas noches",
  "home.greeting.subtitle": "¿Cómo puedo ayudarte hoy?",
  "home.empty.subtitle": "Conecta un proveedor de IA para empezar",
  "home.empty.cta": "Configurar Proveedor",

  "chat.empty.connected": "Conectado a {model}. Escribe abajo.",
  "chat.empty.noprovider": "Necesitas un proveedor de IA para conversar.",
  "chat.empty.cta": "Configurar Proveedor",
  "chat.error.disconnected": "Proveedor Desconectado",
  "chat.error.reconnect": "Reconectar",
  "chat.error.pdfExtraction": "🚨 **Error de Lectura**\n\nNo se pudo extraer texto del archivo **{fileName}**. Puede estar corrupto, protegido con contraseña o ser un PDF de imágenes sin OCR.",
  "chat.error.networkUnstable": "Red inestable. Cambiando a IA Local. Por favor, reenvía tu mensaje.",
  "chat.error.prefix": "Error",
  "chat.error.generic": "Algo salió mal.",
  "chat.status.extracting.1": "Leyendo archivo",
  "chat.status.extracting.2": "Procesando páginas",
  "chat.status.extracting.3": "Extrayendo texto",
  "chat.status.extracting.4": "Preparando contexto",
  "chat.status.extractionFailed": "Extracción Fallida",
  "chat.status.stopped": "Detenido",
  "chat.defaultTitle": "Nuevo Chat",

  "chat.input.disabled": "Ningún proveedor conectado",
  "chat.input.hint": "Omnia puede cometer errores. Verifica información importante.",
  "chat.input.attach.title": "Próximamente",
  "chat.input.attach.msg": "El envío de archivos estará disponible en la Fase 11.",
  "chat.input.attach.camera": "Cámara",
  "chat.input.attach.library": "Fototeca",
  "chat.input.attach.files": "Archivos",
  "common.cancel": "Cancelar",

  "settings.model.select": "Seleccionar Modelo",
  "settings.model.none": "Ninguno",
  "settings.model.nomatch": "No se encontraron modelos",
  "settings.provider.update": "Actualizar Proveedor",
  "settings.provider.set": "Establecer como Activo",
  "settings.provider.disconnect": "Desconectar Proveedor",

  "settings.capabilities.title": "Capacidades",
  "settings.capabilities.voice.title": "Dictado por Voz",
  "settings.capabilities.voice.subtitle": "Motor Offline Whisper AI",
  "settings.capabilities.voice.downloading": "Descargando Motor: {progress}%",
  "settings.capabilities.voice.enabled": "Activado",
  "settings.capabilities.voice.get": "Bajar (57MB)",
  "settings.capabilities.voice.delete.title": "Quitar Motor de Voz",
  "settings.capabilities.voice.delete.msg": "¿Estás seguro de que quieres eliminar el motor de dictado offline? Necesitarás descargar el archivo de ~57MB nuevamente para usar el dictado.",
  "settings.capabilities.voice.delete.confirm": "Quitar",
  "settings.capabilities.voice.req.title": "Motor de Voz Requerido",
  "settings.capabilities.voice.req.msg": "Para usar el dictado increíblemente rápido y 100% offline, Omnia necesita descargar el Motor de IA Whisper de 57MB.",

  "settings.data.title": "Gestión de Datos",
  "settings.data.deleteall": "Eliminar Todo el Historial",
  "settings.data.confirm.title": "Borrar Historial",
  "settings.data.confirm.msg": "¿Estás seguro de que quieres eliminar permanentemente todas las conversaciones? Esto no se puede deshacer.",

  "history.buckets.today": "Hoy",
  "history.buckets.yesterday": "Ayer",
  "history.buckets.previous7": "Últimos 7 días",
  "history.buckets.previous30": "Últimos 30 días",
  "history.buckets.pinned": "Fijados",
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
