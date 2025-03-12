// firebase/client/auth.ts
"use client";

import { auth } from "./index";
import {
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser
} from "firebase/auth";

// Auth providers
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

/**
 * Sign in with Google
 */
export async function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

/**
 * Sign in with GitHub
 */
export async function signInWithGithub() {
  return signInWithPopup(auth, githubProvider);
}

/**
 * Sign in with email and password
 * @param email - The user's email
 * @param password - The user's password
 */
export async function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Create a new user with email and password
 * @param email - The user's email
 * @param password - The user's password
 */
export async function createUserWithEmail(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}

/**
 * Send a password reset email
 * @param email - The user's email
 */
export async function sendResetEmail(email: string) {
  return sendPasswordResetEmail(auth, email);
}

/**
 * Sign out the current user
 */
export async function signOut() {
  return firebaseSignOut(auth);
}

/**
 * Subscribe to auth state changes
 * @param callback - The callback to call when auth state changes
 */
export function subscribeToAuthChanges(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Get the current user
 */
export function getCurrentUser() {
  return auth.currentUser;
}

/**
 * Get the current user's ID token
 */
export async function getIdToken() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No user is signed in");
  }
  return user.getIdToken();
}
