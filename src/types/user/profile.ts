// types/user/profile.ts

import type { ActionResponse } from "../common";
import type { User } from "./common";

export interface UpdateProfileInput {
  name?: string;
  bio?: string;
  location?: string;
  website?: string;
  phone?: string;
  imageUrl?: string;
}

export interface GetProfileResponse extends ActionResponse {
  user?: User;
}

export interface UpdateUserProfileResponse extends ActionResponse {
  user?: User;
}
export interface ProfileUpdateState {
  success: boolean;
  error?: string;
}
