// types/dashboard/account.ts
import type { User, SerializedUser } from "../user/common";

/**
 * Props for the AccountSummary component
 */
export interface AccountSummaryProps {
  user: User;
  profileUrl?: string;
  className?: string;
}

/**
 * Props for the AccountSummaryClient component
 * Uses SerializedUser to ensure dates are properly serialized for client components
 */
export interface AccountSummaryClientProps {
  userData: SerializedUser;
}

/**
 * Props for account settings related components
 */
export interface AccountSettingsProps {
  user: User;
  className?: string;
}

/**
 * Props for user profile related components
 */
export interface UserProfileProps {
  user: User;
  className?: string;
}
