// types/data-privacy/deletion.ts
// Types for account deletion
export type DeleteAccountState = {
  success: boolean;
  error?: string;
  message?: string;
  shouldRedirect?: boolean;
};

// Types for deletion requests
export type DeletionRequestStatus = "pending" | "processing" | "completed" | "failed";

export type DeletionRequest = {
  userId: string;
  email: string;
  requestedAt: Date;
  status: DeletionRequestStatus;
  completedAt: Date | null;
  reason?: string;
};

// Types for admin deletion processing
export type ProcessDeletionsResult = {
  success: boolean;
  processed: number;
  errors: number;
  error?: string; // Added error property
};
