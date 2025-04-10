// types/user/admin.ts
import type { User } from "./common";
import type { ActionResponse } from "../common";
import type { UserRole } from "./common";

export interface CreateUserInput {
  email: string;
  password?: string;
  name?: string;
  role?: UserRole;
}

export interface CreateUserResponse extends ActionResponse {
  userId?: string;
}

export interface FetchUsersResponse extends ActionResponse {
  users?: User[];
  total?: number;
}

export interface SearchUsersResponse extends ActionResponse {
  users?: User[];
  total?: number;
}

export interface UpdateUserInput {
  userId: string;
  data: Partial<User>;
}

export interface UpdateUserResponse extends ActionResponse {}

export interface UpdateUserRoleInput {
  userId: string;
  role: UserRole;
}

export interface UpdateUserRoleResponse extends ActionResponse {
  message?: string;
}

export interface UserSearchState extends ActionResponse {
  users?: User[];
  total?: number;
}

// export interface UserRoleUpdateState extends ActionResponse {
//   message?: string;
// }
// src/types/user.ts (or wherever your user types live)

export interface UserData {
  passwordHash?: string;
  name?: string;
  email?: string;
  role?: "user" | "admin";
  createdAt?: unknown;
  updatedAt?: unknown;
  lastLoginAt?: unknown;
  // Add any other fields your user documents store
}
