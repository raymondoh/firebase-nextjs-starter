// src/firebase/connectEmulator.ts
import { connectAuthEmulator } from "firebase/auth";
import { connectFirestoreEmulator } from "firebase/firestore";
import { auth } from "./client/firebase-client-init";
import { db } from "./client/firebase-client-init";

export function connectFirebaseEmulator() {
  if (typeof window !== "undefined" && location.hostname === "localhost") {
    try {
      connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
      connectFirestoreEmulator(db, "localhost", 8080);
      console.log("🔥 Connected to Firebase emulators.");
    } catch (error) {
      console.error("❌ Error connecting to Firebase emulators:", error);
    }
  }
  console.log("✅ Connected to Firebase Emulators (Auth + Firestore)");
}
