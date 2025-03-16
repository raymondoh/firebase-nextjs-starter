// src/firebase/index.ts
// Main exports for the Firebase module

// Import admin objects and server functions
//import { adminAuth, adminDb, getCurrentUser, logActivity } from "@/firebase";

// Import admin objects and server functions
//import { adminAuth, adminDb, getCurrentUser, logActivity } from "@/firebase";

// Admin exports
//export { adminAuth, adminDb, adminStorage } from "./admin";

// Admin exports
export { adminAuth, adminDb, adminStorage } from "./admin";

export {
  dateToTimestamp,
  timestampToDate,
  timestampToISOString,
  createBatch,
  getDocRef,
  getCollectionRef
} from "./admin/firestore";
// Server actions exports
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

// Client exports
export { auth, db, googleProvider, githubProvider } from "./client";
export {
  signInWithGoogle,
  signInWithGithub,
  signOut,
  resetPassword,
  verifyResetCode,
  completePasswordReset,
  getCurrentUserIdToken
} from "./client/auth";

export * from "./client/firestore";

// Firestore utilities
export {
  adminDateToTimestamp,
  adminTimestampToDate,
  clientDateToTimestamp,
  clientTimestampToDate
} from "./utils/firestore";

// Helper functions to avoid naming conflicts
export { getCurrentUser as getServerCurrentUser } from "./actions";
