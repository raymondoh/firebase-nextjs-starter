"use server";

import { auth, signOut } from "@/auth";
import { adminAuth, adminDb, adminStorage } from "@/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import { serverTimestamp } from "@/firebase/admin/firestore";
import { cookies } from "next/headers";
import { accountDeletionSchema } from "@/schemas/data-privacy";
import type { DeleteAccountState } from "@/types/data-privacy/deletion";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";

// Functions: requestAccountDeletion, processAccountDeletion

export async function processAccountDeletion(userId: string): Promise<boolean> {
  try {
    // Delete user data from Firestore
    const userDocRef = adminDb.collection("users").doc(userId);
    await userDocRef.delete();

    // Delete user data from Firebase Authentication
    await adminAuth.deleteUser(userId);

    // Delete any associated files from Firebase Storage (example)
    const storageRef = adminStorage.bucket().file(`users/${userId}/profile.jpg`);
    try {
      await storageRef.delete();
    } catch (storageError: unknown) {
      if (
        typeof storageError === "object" &&
        storageError !== null &&
        "code" in storageError &&
        (storageError as { code?: number }).code === 404
      ) {
        console.log("File not found, skipping deletion.");
      } else {
        console.error("Error deleting file from storage:", storageError);
      }
    }

    // Update deletion request status
    const deletionRequestRef = adminDb.collection("deletionRequests").doc(userId);
    await deletionRequestRef.update({
      status: "completed",
      completedAt: serverTimestamp()
    });

    // Log this activity
    await adminDb.collection("activityLogs").add({
      userId: userId,
      type: "deletion_completed",
      description: "Account deletion completed",
      timestamp: serverTimestamp(),
      ipAddress: "N/A",
      status: "completed"
    });

    console.log(`Account deletion completed for user ${userId}`);
    return true;
  } catch (error) {
    console.error("Error processing account deletion:", error);

    const now = Timestamp.now();

    // Update deletion request status to failed
    const deletionRequestRef = adminDb.collection("deletionRequests").doc(userId);
    await deletionRequestRef.update({
      status: "failed",
      completedAt: serverTimestamp()
    });

    // Log this activity
    await adminDb.collection("activityLogs").add({
      userId: userId,
      type: "deletion_failed",
      description: "Account deletion failed",
      completedAt: serverTimestamp(),
      completedAtLocal: now,
      ipAddress: "N/A",
      status: "failed"
    });

    return false;
  }
}

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
      requestedAt: serverTimestamp(),
      status: "pending",
      completedAt: null
    });

    // Log this activity
    await adminDb.collection("activityLogs").add({
      userId: session.user.id,
      type: "deletion_request",
      description: "Account deletion requested",
      timestamp: serverTimestamp(),
      ipAddress: "N/A",
      status: "pending"
    });

    // Determine if we should process the deletion immediately or wait
    if (validatedData.immediateDelete) {
      await processAccountDeletion(session.user.id);

      await signOut({ redirect: false });

      const cookieStore = await cookies();
      const allCookies = cookieStore.getAll();
      allCookies.forEach((cookie: RequestCookie) => {
        cookieStore.set(cookie.name, "", { maxAge: 0 });
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
