// src/firebase/index.ts
// Main exports for the Firebase module

/**
 * HOW TO IMPORT FIREBASE FUNCTIONS:
 *
 * -  For Firebase Admin SDK (server-side functions):
 * In server-side files (e.g., actions, API routes), import directly from the admin modules:
 * * ```typescript
 * import { adminAuth, adminDb } from "@/firebase/admin";
 * // Or import the entire namespace if preferred:
 * // import * as admin from "@/firebase/admin";
 * ```
 *
 * Then, use `adminAuth`, `adminDb`, etc., and server functions like
 * `adminAuth.getUserByEmail`, `adminAuth.createUser`, etc.
 *
 * -  For Firebase Client SDK (client-side functions):
 * In client-side files (e.g., components, pages), import from "@/firebase/client" or directly from "@/firebase" (which re-exports client functions):
 *
 * ```typescript
 * import { auth, db, signInWithGoogle } from "@/firebase/client";
 * // Or: import { auth, db, signInWithGoogle } from "@/firebase";
 * ```
 *
 * Then, use `auth`, `db`, and client functions like `signInWithGoogle`, etc.
 *
 * -  For shared utilities:
 * Import from the specific utility file:
 * * ```typescript
 * import { clientDateToTimestamp } from "@/firebase/utils/firestore";
 * ```
 */

import * as admin from "./admin";

export { admin };

// Client exports
export { auth, db, googleProvider, githubProvider } from "./client";

export * from "./client/firestore";

// Firestore utilities
export {
  adminDateToTimestamp,
  adminTimestampToDate,
  clientDateToTimestamp,
  clientTimestampToDate,
  convertTimestamps
} from "./utils/firestore";

// Server actions exports (group in admin)
export {
  // Auth functions
  setCustomClaims,
  verifyAndCreateUser,
  getUserFromToken,
  getCurrentUser,
  sendResetPasswordEmail,
  getUserByEmail,
  getUser,
  updateUser,
  createUser,
  deleteUser,
  verifyIdToken,

  // User functions
  getUsers,
  createUserDocument,
  getUserRole,
  setUserRole,
  updateUserProfile,
  getUserProfile,

  // Activity functions
  logActivity,
  getUserActivityLogs,
  getAllActivityLogs,

  // product functions
  getAllProductsFromFirestore,
  addProductToFirestore,
  getProductByIdFromFirestore,
  updateProductInFirestore,
  deleteProductFromFirestore
} from "./actions";

// Helper functions to avoid naming conflicts
export { getCurrentUser as getServerCurrentUser } from "./actions";
