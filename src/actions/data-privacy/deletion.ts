"use server";

import { auth, signOut } from "@/auth";
import { adminAuth, adminDb, adminStorage } from "@/firebase";
import { Timestamp } from "firebase-admin/firestore";
import { cookies } from "next/headers";
import { accountDeletionSchema } from "@/schemas/data-privacy";
import type { DeleteAccountState } from "@/types/data-privacy/deletion";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";

// Functions: requestAccountDeletion, processAccountDeletion

export async function processAccountDeletion(userId: string) {
  try {
    // Delete user data from Firestore
    const userDocRef = adminDb.collection("users").doc(userId);
    await userDocRef.delete();

    // Delete user data from Firebase Authentication
    await adminAuth.deleteUser(userId);

    // Delete any associated files from Firebase Storage (example)
    const storageRef = adminStorage.bucket().file(`users/${userId}/profile.jpg`); // Adjust path as needed
    try {
      await storageRef.delete();
    } catch (storageError: any) {
      if (storageError.code === 404) {
        console.log("File not found, skipping deletion.");
      } else {
        console.error("Error deleting file from storage:", storageError);
      }
    }

    // Update deletion request status
    const deletionRequestRef = adminDb.collection("deletionRequests").doc(userId);
    await deletionRequestRef.update({
      status: "completed",
      completedAt: Timestamp.now()
    });

    // Log this activity
    await adminDb.collection("activityLogs").add({
      userId: userId,
      type: "deletion_completed",
      description: "Account deletion completed",
      timestamp: Timestamp.now(),
      ipAddress: "N/A", // In a real app, you might want to capture this
      status: "completed"
    });

    console.log(`Account deletion completed for user ${userId}`);
  } catch (error) {
    console.error("Error processing account deletion:", error);
    throw new Error("Failed to process account deletion"); // Re-throw to handle in caller
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
      const cookieStore = cookies();
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
