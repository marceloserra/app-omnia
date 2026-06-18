import { NativeModules, Platform } from "react-native";

// Resolve host IP from Metro bundle URL (works on physical devices and simulators)
let TELEMETRY_URL = "http://localhost:8082";

if (__DEV__ && Platform.OS !== "web") {
  const scriptURL = NativeModules.SourceCode?.scriptURL;
  if (scriptURL) {
    const match = scriptURL.match(/^https?:\/\/([^:]+)/);
    if (match) {
      TELEMETRY_URL = `http://${match[1]}:8082`;
    }
  }
}

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  tag: string;
  message: string;
  error?: string;
  data?: any;
}

function sendTelemetry(entry: LogEntry) {
  if (__DEV__) {
    // Also log locally to the device terminal (Metro)
    if (entry.level === "error") console.error(`[${entry.tag}]`, entry.message, entry.error || "", entry.data || "");
    else if (entry.level === "warn") console.warn(`[${entry.tag}]`, entry.message, entry.data || "");
    else if (entry.level === "info") console.info(`[${entry.tag}]`, entry.message, entry.data || "");
    else console.debug(`[${entry.tag}]`, entry.message, entry.data || "");

    // Fire and forget to telemetry server
    fetch(TELEMETRY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    }).catch(() => {
      // Ignore network errors if telemetry server is not running
    });
  } else {
    // In production, this would route to Sentry, Crashlytics, etc.
    if (entry.level === "error") console.error(`[${entry.tag}]`, entry.message, entry.error || "");
  }
}

function serializeError(err: any): string {
  if (err instanceof Error) {
    return `${err.name}: ${err.message}\n${err.stack}`;
  }
  return typeof err === "string" ? err : JSON.stringify(err);
}

export const logger = {
  debug: (tag: string, message: string, data?: any) => {
    // Only dispatch debug logs in development mode to save processing overhead in prod
    if (__DEV__) {
      sendTelemetry({ level: "debug", tag, message, data });
    }
  },
  info: (tag: string, message: string, data?: any) => {
    sendTelemetry({ level: "info", tag, message, data });
  },
  warn: (tag: string, message: string, data?: any) => {
    sendTelemetry({ level: "warn", tag, message, data });
  },
  error: (tag: string, message: string, err?: any, data?: any) => {
    sendTelemetry({
      level: "error",
      tag,
      message,
      error: err ? serializeError(err) : undefined,
      data,
    });
  },
};
