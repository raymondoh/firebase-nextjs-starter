// firebase/admin/storage.ts
"use server";

import { adminStorage } from "./index";

/**
 * Get a reference to a file in storage
 * @param filePath - The path to the file
 */
export function getFileRef(filePath: string) {
  const bucket = adminStorage.bucket();
  return bucket.file(filePath);
}

/**
 * Generate a signed URL for a file
 * @param filePath - The path to the file
 * @param expiresIn - Time in milliseconds until the URL expires
 */
export async function generateSignedUrl(filePath: string, expiresIn = 60 * 60 * 1000): Promise<string> {
  const file = getFileRef(filePath);
  const [url] = await file.getSignedUrl({
    action: "read",
    expires: Date.now() + expiresIn
  });
  return url;
}

/**
 * Delete a file from storage
 * @param filePath - The path to the file
 */
export async function deleteFile(filePath: string): Promise<void> {
  const file = getFileRef(filePath);
  await file.delete();
}

/**
 * Get all files with a specific prefix
 * @param prefix - The prefix to filter by
 */
export async function getFilesByPrefix(prefix: string) {
  const bucket = adminStorage.bucket();
  const [files] = await bucket.getFiles({ prefix });
  return files;
}
