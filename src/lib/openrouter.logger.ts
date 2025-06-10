import type { RequestPayload } from "./openrouter.types";

/**
 * Patterns of sensitive data that should be masked in logs
 */
const SENSITIVE_PATTERNS = [
  /["']?(?:api[-_]?key|token|password|secret|authorization|auth)["']?\s*[=:]\s*["']?[^"'\s]+["']?/gi,
  /bearer\s+[a-zA-Z0-9._-]+/gi,
  /basic\s+[a-zA-Z0-9._-]+/gi,
  /["']?(?:api[-_]?key|token|password|secret|authorization|auth)["']?["']?[^"'\s]+["']?/gi,
];

/**
 * Masks sensitive data in the provided text
 */
const maskSensitiveData = (text: string): string => {
  let maskedText = text;
  SENSITIVE_PATTERNS.forEach((pattern) => {
    maskedText = maskedText.replace(pattern, (match) => {
      // Keep the key name but mask the value
      const parts = match.split(/[=:]/);
      if (parts.length > 1) {
        return `${parts[0]}=[MASKED]`;
      }
      return "[MASKED]";
    });
  });
  return maskedText;
};

/**
 * Safely stringifies an object, masking sensitive data
 */
const safeStringify = (obj: unknown): string => {
  if (typeof obj === "string") {
    return maskSensitiveData(obj);
  }

  try {
    const stringified = JSON.stringify(
      obj,
      (key, value) => {
        if (typeof value === "string") {
          // Check if the key or value contains sensitive information
          if (key.toLowerCase().match(/(api[-_]?key|token|password|secret|authorization|auth)/)) {
            return "[MASKED]";
          }
          return maskSensitiveData(value);
        }
        return value;
      },
      2
    );

    return maskSensitiveData(stringified);
  } catch {
    return "[Unable to stringify object]";
  }
};

/**
 * Safely formats the payload for logging
 */
const formatPayload = (payload?: RequestPayload): string => {
  if (!payload) return "";

  const safePayload = {
    ...payload,
    messages: payload.messages.map((msg) => ({
      role: msg.role,
      // Mask potential sensitive data in content
      content: maskSensitiveData(msg.content),
    })),
  };

  return safeStringify(safePayload);
};

export class OpenRouterLogger {
  private readonly context: string;

  constructor(context = "OpenRouter") {
    this.context = context;
  }

  /**
   * Logs an error with sensitive data masked
   */
  error(message: string, error?: unknown, payload?: RequestPayload): void {
    const timestamp = new Date().toISOString();
    const errorDetails =
      error instanceof Error
        ? {
            message: maskSensitiveData(error.message),
            stack: error.stack ? maskSensitiveData(error.stack) : undefined,
          }
        : safeStringify(error);

    console.error(
      JSON.stringify(
        {
          timestamp,
          level: "ERROR",
          context: this.context,
          message: maskSensitiveData(message),
          error: errorDetails,
          payload: payload ? formatPayload(payload) : undefined,
        },
        null,
        2
      )
    );
  }

  /**
   * Logs a warning with sensitive data masked
   */
  warn(message: string, metadata?: unknown): void {
    const timestamp = new Date().toISOString();
    console.warn(
      JSON.stringify(
        {
          timestamp,
          level: "WARN",
          context: this.context,
          message: maskSensitiveData(message),
          metadata: metadata ? safeStringify(metadata) : undefined,
        },
        null,
        2
      )
    );
  }

  /**
   * Logs an info message with sensitive data masked
   */
  info(message: string, metadata?: unknown): void {
    const timestamp = new Date().toISOString();
    console.info(
      JSON.stringify(
        {
          timestamp,
          level: "INFO",
          context: this.context,
          message: maskSensitiveData(message),
          metadata: metadata ? safeStringify(metadata) : undefined,
        },
        null,
        2
      )
    );
  }

  /**
   * Logs a debug message with sensitive data masked
   */
  debug(message: string, metadata?: unknown): void {
    if (import.meta.env.DEV) {
      const timestamp = new Date().toISOString();
      console.debug(
        JSON.stringify(
          {
            timestamp,
            level: "DEBUG",
            context: this.context,
            message: maskSensitiveData(message),
            metadata: metadata ? safeStringify(metadata) : undefined,
          },
          null,
          2
        )
      );
    }
  }
}
