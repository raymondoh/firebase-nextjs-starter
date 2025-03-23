import { User, UserActionResponse, UserRole } from "./common";

// SEARCH
export type UserSearchState =
  | (UserActionResponse & {
      users?: User[];
      total?: number;
    })
  | null;

// ROLE UPDATE
export type UserRoleUpdateState = UserActionResponse | null;

// USER DATA
export type UserData = {
  email: string;
  passwordHash?: string;
  role?: UserRole;
  // Add any other Firestore fields here
};
