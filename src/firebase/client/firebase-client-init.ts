// src/firebase/client/firebase-client-init.ts

"use client";

import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ================= Firebase Configuration =================

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// ================= Firebase Initialization =================

// Only initialize the app if it hasn't been already
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// ================= Core Firebase Services =================

export const auth = getAuth(app);
export const db = getFirestore(app);

// ================= Auth Providers =================

export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
