// types/user/common.ts
import type { Timestamp } from "firebase-admin/firestore";
import type { ActionResponse } from "../common";

/**
 * User roles in the system
 */
export type UserRole = "user" | "admin" | "editor" | "moderator" | string;

/**
 * User account status
 */
export type UserStatus = "active" | "disabled" | "pending" | string;

/**
 * Comprehensive User type
 */
export interface User {
  // Basic user information
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  picture?: string; // Added from firebase/user.ts
  username?: string; // Username (may be same as name)
  profileImage?: string; // Alternative to image/picture

  // Authentication and security
  emailVerified?: boolean;
  hasPassword?: boolean;
  has2FA?: boolean;
  provider?: "email" | "google" | "github" | string;
  passwordHash?: string; // Hashed password (server-side only)

  // Timestamps
  createdAt?: Date | string | number | Timestamp;
  lastLoginAt?: Date | string | number | Timestamp;
  updatedAt?: Date | string | number | Timestamp;

  // User profile and preferences
  bio?: string;
  location?: string;
  phone?: string;
  website?: string;

  // Access control
  role?: UserRole;
  permissions?: string[];
  status?: UserStatus; // Account status (active, disabled, pending)

  // Additional metadata
  metadata?: Record<string, any>;
}

export interface PreviewUser {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string;
  createdAt?: Date;
}

/**
 * Serialized user safe for client components
 * All dates are converted to ISO strings
 */
export interface SerializedUser extends Omit<User, "createdAt" | "lastLoginAt" | "updatedAt"> {
  // Timestamps as ISO strings
  createdAt?: string;
  lastLoginAt?: string;
  updatedAt?: string;
}

/**
 * User-specific action response
 */
export interface UserActionResponse extends ActionResponse {
  // User-specific fields can be added here
}

/**
 * Response for user search operations
 */
export interface UserSearchState extends ActionResponse {
  users?: User[];
  total?: number;
}

/**
 * Response for user role update operations
 */
export interface UserRoleUpdateState extends ActionResponse {
  message?: string;
}
