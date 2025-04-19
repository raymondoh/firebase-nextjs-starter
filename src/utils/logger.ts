// src/utils/logger.ts
//import { adminDb } from "@/firebase/admin/firebase-admin-init";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/firebase/admin/firebase-admin-init";

interface LogEntry {
  type: "info" | "error" | "warn" | "debug" | `auth:${string}`;
  message: string;
  userId?: string;
  metadata?: Record<string, any>;
  context?: string; // Optional label like "auth", "products", etc.
}

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
      console.log(`[${type.toUpperCase()}] ${context}:`, message, metadata);
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[LOGGER_ERROR] Failed to write log:", error);
    }
  }
}
