/**
 * Firebase Types Index
 *
 * This file explicitly exports all Firebase-related types.
 * Using this index file makes imports clearer and helps with IDE auto-imports.
 */

// Activity logging types
export type {
  // Core activity types
  ActivityType,
  ActivityStatus,
  ActivityLogData,
  ActivityLogWithId,
  SerializedActivity,
  // Result types
  LogActivityResult,
  GetUserActivityLogsResult
} from "./activity";

// Firebase Authentication types
export type {
  // Token and user types
  DecodedIdToken,
  // Authentication operation results
  VerifyAndCreateUserResult,
  GetUserFromTokenResult,
  SendResetPasswordEmailResult,
  VerifyPasswordResetCodeResult,
  ConfirmPasswordResetResult,
  SetCustomClaimsResult,
  CustomClaims
} from "./auth";

// Firestore types
export type {
  // User document types
  UserDocumentData,
  // Firestore operation results
  GetUsersResult,
  CreateUserDocumentResult,
  UpdateUserProfileResult,
  GetUserProfileResult,
  SetUserRoleResult
} from "./firestore";
