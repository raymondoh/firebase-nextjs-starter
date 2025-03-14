/**
 * User Types Index
 *
 * This file explicitly exports all user-related types.
 * Using this index file makes imports clearer and helps with IDE auto-imports.
 */

// Common user types
export type {
  // Core user types
  UserRole,
  User,
  // Response types
  UserActionResponse
} from "./common";

// Admin-related user types
export type {
  // Search functionality
  UserSearchState,
  // Role management
  UserRoleUpdateState
} from "./admin";

// Profile-related user types
export type {
  // Profile management
  ProfileUpdateState
} from "./profile";
