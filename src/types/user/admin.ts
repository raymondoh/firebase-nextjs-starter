import { User, UserActionResponse } from "./common";

// SEARCH
export type UserSearchState =
  | (UserActionResponse & {
      users?: User[];
      total?: number;
    })
  | null;

// ROLE UPDATE
export type UserRoleUpdateState = UserActionResponse | null;
