import { sendEmailVerification, type User } from "firebase/auth";

/**
 * Sends a verification email to the specified user
 * @returns Promise that resolves when the email has been sent
 */
export const sendVerificationEmail = async (user: User): Promise<void> => {
  try {
    await sendEmailVerification(user);
    console.log("Verification email sent successfully");
    return Promise.resolve();
  } catch (error) {
    console.error("Error sending verification email:", error);
    return Promise.reject(error);
  }
};

/**
 * Checks if the user's email is verified
 * @returns Boolean indicating if email is verified
 */
export const isEmailVerified = (user: User | null): boolean => {
  return user?.emailVerified ?? false;
};

/**
 * Refreshes the user's token to get the latest emailVerified status
 * @param user The Firebase user object
 * @returns Promise that resolves with the updated user
 */
export const refreshUserStatus = async (user: User): Promise<User> => {
  await user.reload();
  return user;
};
