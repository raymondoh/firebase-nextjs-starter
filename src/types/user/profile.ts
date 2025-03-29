// types/user/profile.ts
import { User, UserActionResponse } from "./common";

// PROFILE
export type ProfileUpdateState =
  | (UserActionResponse & {
      user?: User;
    })
  | null;
