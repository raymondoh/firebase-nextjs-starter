import "server-only";

import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

/**
 * Initialize the Firebase Admin SDK
 */
function initializeAdminApp(): App {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("FIREBASE_PRIVATE_KEY is not set in the environment variables");
  }

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey.replace(/\\n/g, "\n") // Handle escaped line breaks
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
}

// Initialize only once
const firebaseAdmin = initializeAdminApp();

// Expose preconfigured instances
export const adminAuth = getAuth(firebaseAdmin);
export const adminDb = getFirestore(firebaseAdmin);
export const adminStorage = getStorage(firebaseAdmin);

// 🔒 Type safety for environment variables
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      FIREBASE_PROJECT_ID: string;
      FIREBASE_CLIENT_EMAIL: string;
      FIREBASE_PRIVATE_KEY: string;
      FIREBASE_STORAGE_BUCKET: string;
    }
  }
}
