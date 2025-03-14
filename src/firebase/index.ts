// Main exports for the Firebase module

// Admin exports
import { adminAuth, adminDb, adminStorage } from "./admin";
import {
  setCustomClaims as adminSetCustomClaims
  // Import other specific functions from admin/auth
} from "./admin/auth";
import {
  dateToTimestamp as adminDateToTimestamp,
  timestampToDate as adminTimestampToDate
  // Import other specific functions from admin/firestore
} from "./admin/firestore";
import // Import specific functions from admin/storage
"./admin/storage";

// Client exports (for browser usage)
import { auth, db } from "./client"; // Removed storage from import
import {
  googleProvider,
  githubProvider,
  getCurrentUser as clientGetCurrentUser
  // Import other specific functions from client/auth
} from "./client/auth";
import {
  dateToTimestamp as clientDateToTimestamp,
  timestampToDate as clientTimestampToDate
  // Import other specific functions from client/firestore
} from "./client/firestore";

// Utility exports
import {
  logActivity,
  getUserActivityLogs
  // Import other specific functions from utils/activity
} from "./utils/activity";
import // Import specific functions from utils/user
"./utils/user";
import {
  getCurrentUser as utilsGetCurrentUser
  // Import other specific functions from utils/auth
} from "./utils/auth";

// Export admin objects
export { adminAuth, adminDb, adminStorage };

// Export admin functions with explicit names
export { adminSetCustomClaims as setCustomClaims, adminDateToTimestamp, adminTimestampToDate };

// Export client objects
export { auth, db }; // Removed storage from export

// Export client functions with explicit names
export { googleProvider, githubProvider, clientGetCurrentUser, clientDateToTimestamp, clientTimestampToDate };

// Export utility functions
export { logActivity, getUserActivityLogs, utilsGetCurrentUser };

// You can also re-export with different names to avoid conflicts
export { utilsGetCurrentUser as getAuthUser };
