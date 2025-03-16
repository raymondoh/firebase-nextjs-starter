"use server";

import { auth } from "@/auth";
import { adminDb, adminStorage } from "@/firebase";
import { Timestamp } from "firebase-admin/firestore";
import { exportDataSchema } from "@/schemas/data-privacy";
//import type { ExportFormat, ExportDataState } from "@/types/data-privacy";
import type { ExportFormat, ExportDataState } from "@/types/data-privacy/export";

// To this:
import { convertTimestamps, objectToCSV } from "@/actions/utils";

// Functions: Export user data

// Export user data
export async function exportUserData(prevState: ExportDataState | null, formData: FormData): Promise<ExportDataState> {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Validate format
    const format = formData.get("format") as ExportFormat;
    const result = exportDataSchema.safeParse({ format });

    if (!result.success) {
      return { success: false, error: "Invalid export format" };
    }

    // Get user data from Firestore
    const userDoc = await adminDb.collection("users").doc(session.user.id).get();
    if (!userDoc.exists) {
      return { success: false, error: "User data not found" };
    }

    // Get user's activity logs
    let activityLogs = [];
    try {
      const activityLogsSnapshot = await adminDb
        .collection("activityLogs")
        .where("userId", "==", session.user.id)
        .orderBy("timestamp", "desc")
        .limit(100)
        .get();

      activityLogs = activityLogsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...convertTimestamps(doc.data())
      }));
    } catch (indexError) {
      console.warn(
        "Activity logs index not yet available:",
        indexError instanceof Error ? indexError.message : String(indexError)
      );
      // Continue without activity logs
    }

    // Compile user data
    const userData = {
      profile: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        bio: session.user.bio || "",
        image: session.user.image || "",
        ...convertTimestamps(userDoc.data())
      },
      activityLogs
    };

    // Convert to requested format
    let fileContent: string;
    let contentType: string;
    let fileExtension: string;

    if (format === "json") {
      fileContent = JSON.stringify(userData, null, 2);
      contentType = "application/json";
      fileExtension = "json";
    } else {
      // For CSV, we need to flatten the data structure
      const flattenedData = {
        ...userData.profile,
        activityLogs: JSON.stringify(userData.activityLogs)
      };
      fileContent = objectToCSV(flattenedData);
      contentType = "text/csv";
      fileExtension = "csv";
    }

    // Upload to Firebase Storage
    const fileName = `data-exports/${session.user.id}/user-data-${Date.now()}.${fileExtension}`;
    const bucket = adminStorage.bucket();
    const file = bucket.file(fileName);

    await file.save(fileContent, {
      metadata: {
        contentType
      }
    });

    // Generate a signed URL that expires in 1 hour
    const [signedUrl] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 60 * 60 * 1000 // 1 hour
    });

    // Log this export activity
    await adminDb.collection("activityLogs").add({
      userId: session.user.id,
      type: "data_export",
      description: `Data exported in ${format.toUpperCase()} format`,
      timestamp: Timestamp.now(),
      ipAddress: "N/A", // In a real app, you might want to capture this
      status: "success"
    });

    return {
      success: true,
      downloadUrl: signedUrl,
      message: `Your data has been exported in ${format.toUpperCase()} format`
    };
  } catch (error) {
    console.error("Error exporting user data:", error instanceof Error ? error.message : String(error));
    return { success: false, error: "Failed to export data" };
  }
}
