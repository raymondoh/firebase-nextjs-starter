// types/index.ts

// Auth types
export type {
  // Common auth types

  UserProfile,

  // Login types
  LoginState,

  // Registration types
  RegisterState,

  // Password types
  ForgotPasswordState,
  ResetPasswordState,
  UpdatePasswordState
} from "./auth";

// User types
export type {
  // Common user types
  User,
  UserRole,
  //UserActionResponse,

  // Profile types
  ProfileUpdateState,

  // Admin types
  UserSearchState
  //UserRoleUpdateState

  // Firestore data
} from "./user";

// Data privacy types
export type {
  // Export types
  ExportFormat,
  ExportDataState,

  // Deletion types
  DeleteAccountState,
  DeletionRequestStatus,
  DeletionRequest,
  ProcessDeletionsResult
} from "./data-privacy";

// Firebase types
export type {
  UserDocumentData,
  DecodedIdToken,
  VerifyAndCreateUserResult,
  GetUserFromTokenResult,
  SetCustomClaimsResult
} from "./firebase";

// Product types
export type { Product } from "./product/product";

// Common types (once you've created the common folder)
export type { ActionResponse } from "./common/response";
