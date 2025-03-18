// src/firebase/index.ts
// Main exports for the Firebase module

/**
 * HOW TO IMPORT FIREBASE FUNCTIONS:
 *
 * -  For Firebase Admin SDK (server-side functions):
 * import * as admin from "@/firebase/admin";
 * Then use admin.adminAuth, admin.adminDb, etc., and server functions like
 * admin.getUserByEmail, admin.createUser, etc.
 *
 * -  For Firebase Client SDK (client-side functions):
 * import { auth, db, ... } from "@/firebase/client";
 * Or import directly from "@/firebase";  (index.ts re-exports client)
 * Then use auth, db, and client functions like signInWithGoogle, etc.
 *
 * -  For shared utilities:
 * import { utilityFunction } from "@/firebase/utils/some-util";
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
  clientTimestampToDate
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
  getUserActivityLogs
} from "./actions";

// Helper functions to avoid naming conflicts
export { getCurrentUser as getServerCurrentUser } from "./actions";
