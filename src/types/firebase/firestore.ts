// types/firebase/firestore.ts (update)
import type { User } from "../user/common";
import type { Timestamp } from "firebase-admin/firestore";

/**
 * User document data as stored in Firestore
 */
export type UserDocumentData = Omit<User, "id"> & {
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
};

/**
 * Result types for Firestore operations
 */
export type GetUsersResult = {
  success: boolean;
  users?: User[];
  lastVisible?: string;
  error?: string;
};

export type CreateUserDocumentResult = {
  success: boolean;
  error?: string;
};

export type UpdateUserProfileResult = {
  success: boolean;
  error?: string;
};

export type GetUserProfileResult = {
  success: boolean;
  user?: User;
  error?: string;
};

export type SetUserRoleResult = {
  success: boolean;
  error?: string;
};
