// Types for data export
export type ExportFormat = "json" | "csv";

export type ExportDataState = {
  success: boolean;
  error?: string;
  downloadUrl?: string;
  message?: string;
};

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
};
