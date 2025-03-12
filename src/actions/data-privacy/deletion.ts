"use server";

import { auth, signOut } from "@/auth";
//import { adminAuth, adminDb, adminStorage } from "@/firebase/admin";
import { adminAuth, adminDb, adminStorage } from "@/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import { cookies } from "next/headers";
import { accountDeletionSchema } from "@/schemas/data-privacy";
import type { DeleteAccountState } from "@/types/data-privacy";

// Functions: requestAccountDeletion, processAccountDeletion

// Request account deletion
export async function requestAccountDeletion(
  prevState: DeleteAccountState | null,
  formData: FormData
): Promise<DeleteAccountState> {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Parse and validate the form data
    const immediateDelete = formData.get("immediateDelete") === "true";
    const validatedData = accountDeletionSchema.parse({ immediateDelete });

    // Create a deletion request in Firestore
    await adminDb.collection("deletionRequests").doc(session.user.id).set({
      userId: session.user.id,
      email: session.user.email,
      requestedAt: Timestamp.now(),
      status: "pending",
      completedAt: null
    });

    // Log this activity
    await adminDb.collection("activityLogs").add({
      userId: session.user.id,
      type: "deletion_request",
      description: "Account deletion requested",
      timestamp: Timestamp.now(),
      ipAddress: "N/A", // In a real app, you might want to capture this
      status: "pending"
    });

    // Determine if we should process the deletion immediately or wait
    if (validatedData.immediateDelete) {
      // Process the deletion immediately
      await processAccountDeletion(session.user.id);

      // Sign the user out
      await signOut({ redirect: false });

      // Clear cookies
      cookies()
        .getAll()
        .forEach(cookie => {
          cookies().delete(cookie.name);
        });

      return {
        success: true,
        message: "Your account has been deleted. You will be redirected to the homepage.",
        shouldRedirect: true
      };
    }

    return {
      success: true,
      message: "Your account deletion request has been submitted. You will receive an email confirmation shortly."
    };
  } catch (error) {
    console.error("Error requesting account deletion:", error instanceof Error ? error.message : String(error));
    return { success: false, error: "Failed to request account deletion" };
  }
}

// Process account deletion (can be called directly or by a background process)
export async function processAccountDeletion(userId: string): Promise<boolean> {
  try {
    console.log(`Processing account deletion for user: ${userId}`);

    // 1. Get user data for reference
    const userDoc = await adminDb.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      console.error(`User ${userId} not found in Firestore`);
      return false;
    }

    const userData = userDoc.data();

    // 2. Delete user's files from Storage
    try {
      const bucket = adminStorage.bucket();

      // Delete profile pictures
      const [userFiles] = await bucket.getFiles({ prefix: `users/${userId}/` });
      await Promise.all(userFiles.map(file => file.delete()));

      // Delete data exports
      const [exportFiles] = await bucket.getFiles({ prefix: `data-exports/${userId}/` });
      await Promise.all(exportFiles.map(file => file.delete()));

      console.log(`Deleted ${userFiles.length + exportFiles.length} files for user ${userId}`);
    } catch (storageError) {
      console.error(`Error deleting files for user ${userId}:`, storageError);
      // Continue with deletion even if file deletion fails
    }

    // 3. Delete user's activity logs
    try {
      const logsSnapshot = await adminDb.collection("activityLogs").where("userId", "==", userId).get();

      const batch = adminDb.batch();
      logsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(`Deleted ${logsSnapshot.size} activity logs for user ${userId}`);
    } catch (logsError) {
      console.error(`Error deleting activity logs for user ${userId}:`, logsError);
      // Continue with deletion even if logs deletion fails
    }

    // 4. Delete user's deletion request if it exists
    try {
      await adminDb.collection("deletionRequests").doc(userId).delete();
    } catch (requestError) {
      console.error(`Error deleting deletion request for user ${userId}:`, requestError);
      // Continue with deletion even if request deletion fails
    }

    // 5. Delete user from Firestore
    await adminDb.collection("users").doc(userId).delete();
    console.log(`Deleted user ${userId} from Firestore`);

    // 6. Delete user from Firebase Auth
    await adminAuth.deleteUser(userId);
    console.log(`Deleted user ${userId} from Firebase Auth`);

    // 7. Update deletion request status if we're processing from a queue
    try {
      await adminDb.collection("deletionRequests").doc(userId).set(
        {
          status: "completed",
          completedAt: Timestamp.now()
        },
        { merge: true }
      );
    } catch (updateError) {
      console.error(`Error updating deletion request status for user ${userId}:`, updateError);
      // This is not critical, so we can ignore it
    }

    return true;
  } catch (error) {
    console.error(`Error processing account deletion for user ${userId}:`, error);
    return false;
  }
}
