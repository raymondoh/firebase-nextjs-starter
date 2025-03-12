import type { User } from "../user/common";

export type UserDocumentData = Omit<User, "id"> & {
  createdAt: Date;
  updatedAt: Date;
};

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
