:3000/\_next/static/c…ks/app/layout.js:29 Uncaught SyntaxError: Invalid or unexpected token
Uncaught SyntaxError: Invalid or unexpected token

FirebaseError: "auth/invalid-action-code" "Firebase: Error (auth/invalid-action-code)."

src/components/auth/VerifyEmailForm.tsx (65:21) @ VerifyEmailForm.useEffect.verifyEmail

63 | } catch (error: unknown) {
64 | if (isFirebaseError(error)) {

> 65 | console.error("FirebaseError:", error.code, error.message);

     |                     ^

66 |
67 | if (error.code === "auth/invalid-action-code") {
68 | const user = auth.currentUser;
Call Stack
4

Show 3 ignore-listed frame(s)
VerifyEmailForm.useEffect.verifyEmail

"use client";

import { initializeApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// Firebase config
const firebaseConfig = {
apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Init
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

// Emulators — only on client, only once
if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true") {
if (!auth.emulatorConfig) {
console.log("✅ Connecting to Firebase Emulators (Auth + Firestore)");
connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
}

if (!db.\_settingsFrozen) {
connectFirestoreEmulator(db, "localhost", 8080);
}
}

// Providers
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

// ✅ EXPORTS (make sure these are exported)
export { app, auth, db, googleProvider, githubProvider };

// ⭐ Connect to emulators ONLY in development
if (process.env.NODE_ENV === "development") {
console.log("Connecting to Firebase emulators...");
connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
connectFirestoreEmulator(db, "localhost", 8080);
}
if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_USE_EMULATORS === "true") {
connectAuthEmulator(auth, "http://localhost:9099");
connectFirestoreEmulator(db, "localhost", 8080);
}
