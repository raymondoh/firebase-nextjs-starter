// Types for data export
export type ExportFormat = "json" | "csv";

export type ExportDataState = {
  success: boolean;
  error?: string;
  downloadUrl?: string;
  message?: string;
};
