// src/utils/logger.ts

import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/firebase/admin/firebase-admin-init";

export type LogLevel =
  | "info"
  | "warn"
  | "error"
  | "debug"
  | `auth:${string}`
  | `admin:${string}`
  | `deletion:${string}`
  | `data-privacy:${string}`;

export interface LogEntry<T extends Record<string, unknown> = Record<string, unknown>> {
  type: LogLevel;
  message: string;
  userId?: string;
  metadata?: T;
  context?: string; // e.g., "auth", "products"
}

// Base logger: always logs to console
export function logger({ type, message, metadata, context = "general" }: Omit<LogEntry, "userId">) {
  const timestamp = new Date().toISOString();
  const formatted = `[${timestamp}] [${type.toUpperCase()}] [${context}] ${message}`;

  if (metadata && Object.keys(metadata).length > 0) {
    console[type === "error" ? "error" : type === "warn" ? "warn" : "log"](formatted, metadata);
  } else {
    console[type === "error" ? "error" : type === "warn" ? "warn" : "log"](formatted);
  }
}

// Firestore logger: logs to Firestore + console
export async function logServerEvent({
  type,
  message,
  userId,
  metadata = {},
  context = "general"
}: LogEntry): Promise<void> {
  try {
    const log = {
      type,
      message,
      context,
      userId: userId || null,
      metadata,
      timestamp: Timestamp.now()
    };

    await adminDb.collection("serverLogs").add(log);

    if (process.env.NODE_ENV === "development") {
      logger({ type, message, metadata, context });
    }
  } catch (error) {
    logger({
      type: "error",
      message: "[LOGGER_ERROR] Failed to write log",
      metadata: { error },
      context: "logger"
    });
  }
}
