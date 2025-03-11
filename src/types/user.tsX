// User roles
export type UserRole = "user" | "admin";

// Basic user type
export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: UserRole;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Common response type for user actions
export type UserActionResponse = {
  success: boolean;
  error?: string;
  message?: string;
};

// PROFILE
export type ProfileUpdateState =
  | (UserActionResponse & {
      user?: User;
    })
  | null;

// SEARCH
export type UserSearchState =
  | (UserActionResponse & {
      users?: User[];
      total?: number;
    })
  | null;

// ROLE UPDATE
export type UserRoleUpdateState = UserActionResponse | null;
