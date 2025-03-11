import { User } from "../user/common";

export type DecodedIdToken = {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
};

export type VerifyAndCreateUserResult = {
  success: boolean;
  uid?: string;
  error?: string;
};

export type GetUserFromTokenResult = {
  success: boolean;
  user?: DecodedIdToken;
  error?: string;
};

export type SetCustomClaimsResult = {
  success: boolean;
  error?: any;
};
