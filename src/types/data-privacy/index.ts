/**
 * Data Privacy Types Index
 *
 * This file explicitly exports all data privacy related types.
 * Using this index file makes imports clearer and helps with IDE auto-imports.
 */

// Account deletion types
export type { DeleteAccountState, DeletionRequestStatus, DeletionRequest, ProcessDeletionsResult } from "./deletion";

// Data export types
export type { ExportFormat, ExportDataState } from "./export";

// Alternative approach with grouped exports
// export type {
//   // Deletion
//   DeleteAccountState,
//   DeletionRequestStatus,
//   DeletionRequest,
//   ProcessDeletionsResult,
//
//   // Export
//   ExportFormat,
//   ExportDataState
// } from "./deletion";
