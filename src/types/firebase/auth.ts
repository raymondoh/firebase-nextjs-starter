// types/firebase/auth.ts (update)
/**
 * Firebase Authentication related types
 */

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

export type SendResetPasswordEmailResult = {
  success: boolean;
  error?: string;
};

export type VerifyPasswordResetCodeResult = {
  success: boolean;
  email?: string;
  error?: string;
};

export type ConfirmPasswordResetResult = {
  success: boolean;
  error?: string;
};

export type SetCustomClaimsResult = {
  success: boolean;
  error?: any;
};
