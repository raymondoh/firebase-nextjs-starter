"use server";

import { auth } from "@/auth";
import { adminDb, adminStorage } from "@/firebase/admin/firebase-admin-init";
import { exportDataSchema } from "@/schemas/data-privacy";
import { firebaseError, isFirebaseError } from "@/utils/firebase-error";
import { logActivity } from "@/firebase/actions";
import { convertTimestamps } from "@/firebase/utils/firestore";
import type { ExportFormat, ExportDataState } from "@/types/data-privacy/export";
import { ExportedActivityLog } from "@/types/data-privacy/export";
import { objectToCSV } from "@/actions/utils/format-helpers";

export async function exportUserData(prevState: ExportDataState | null, formData: FormData): Promise<ExportDataState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const format = formData.get("format") as ExportFormat;
    const result = exportDataSchema.safeParse({ format });

    if (!result.success) {
      return { success: false, error: "Invalid export format" };
    }

    const userDoc = await adminDb.collection("users").doc(session.user.id).get();
    if (!userDoc.exists) {
      return { success: false, error: "User data not found" };
    }

    let activityLogs: ExportedActivityLog[] = [];

    try {
      const snapshot = await adminDb
        .collection("activityLogs")
        .where("userId", "==", session.user.id)
        .orderBy("timestamp", "desc")
        .limit(100)
        .get();

      activityLogs = snapshot.docs.map(doc => ({
        ...(convertTimestamps(doc.data()) as ExportedActivityLog),
        id: doc.id
      }));
    } catch (indexError) {
      console.warn("Activity logs index issue:", indexError);
    }

    const userData = {
      profile: {
        email: session.user.email,
        name: session.user.name,
        bio: session.user.bio || "",
        image: session.user.image || "",
        ...(convertTimestamps(userDoc.data()) as Record<string, unknown>),
        id: session.user.id
      },
      activityLogs
    };

    let fileContent: string;
    let contentType: string;
    let fileExtension: string;

    if (format === "json") {
      fileContent = JSON.stringify(userData, null, 2);
      contentType = "application/json";
      fileExtension = "json";
    } else {
      const flattened = {
        ...userData.profile,
        activityLogs: JSON.stringify(userData.activityLogs)
      };
      fileContent = await objectToCSV(flattened);
      contentType = "text/csv";
      fileExtension = "csv";
    }

    const fileName = `data-exports/${session.user.id}/user-data-${Date.now()}.${fileExtension}`;
    const file = adminStorage.bucket().file(fileName);

    await file.save(fileContent, {
      metadata: { contentType }
    });

    const [signedUrl] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 60 * 60 * 1000 // 1 hour
    });

    await logActivity({
      userId: session.user.id,
      type: "data_export",
      description: `Exported data in ${format.toUpperCase()} format`,
      status: "success",
      metadata: {
        format,
        fileName
      }
    });

    return {
      success: true,
      downloadUrl: signedUrl,
      message: `Your data has been exported in ${format.toUpperCase()} format`
    };
  } catch (error: unknown) {
    let message: string;

    if (isFirebaseError(error)) {
      message = firebaseError(error);
    } else if (error instanceof Error) {
      message = error.message;
    } else {
      message = "Failed to export data";
    }

    console.error("Error exporting data:", error);
    return { success: false, error: message };
  }
}
