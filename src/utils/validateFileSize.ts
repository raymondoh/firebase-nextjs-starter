// utils/validateFileSize.ts
export function validateFileSize(file: File, maxSizeMB = 2): string | null {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `Image too large. Max allowed size is ${maxSizeMB}MB.`;
  }
  return null;
}
