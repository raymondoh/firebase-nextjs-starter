import { adminStorage } from "@/firebase/admin/firebase-admin-init";

/**
 * Debug utility to check Firebase Storage configuration and permissions
 */
export async function debugStorageAccess(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    const bucket = adminStorage.bucket();

    // Check if bucket exists
    const [exists] = await bucket.exists();
    if (!exists) {
      return {
        success: false,
        message: "Storage bucket does not exist or is not accessible"
      };
    }

    // Get bucket metadata
    const [metadata] = await bucket.getMetadata();

    // Try to list files (limited to 1) to check permissions
    const [files] = await bucket.getFiles({ maxResults: 1 });

    return {
      success: true,
      message: "Storage access successful",
      details: {
        bucketName: bucket.name,
        projectId: metadata.projectId,
        filesAccessible: true,
        sampleFile: files.length > 0 ? files[0].name : "No files found"
      }
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error accessing storage",
      details: { error }
    };
  }
}

/**
 * Debug utility to check if a specific user's storage folder exists
 */
export async function checkUserStorageFolder(userId: string): Promise<{
  success: boolean;
  message: string;
  files?: string[];
}> {
  try {
    const bucket = adminStorage.bucket();
    const folderPath = `users/${userId}`;

    // List files in the user's folder
    const [files] = await bucket.getFiles({ prefix: folderPath });

    if (files.length === 0) {
      return {
        success: true,
        message: `No files found in folder: ${folderPath}`,
        files: []
      };
    }

    return {
      success: true,
      message: `Found ${files.length} files in folder: ${folderPath}`,
      files: files.map(file => file.name)
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error checking user storage folder"
    };
  }
}
