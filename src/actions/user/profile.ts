"use server";

// ================= Imports =================
import { auth } from "@/auth";
import { adminAuth, adminDb } from "@/firebase/admin/firebase-admin-init";
import { serverTimestamp } from "@/utils/date-server";
import { profileUpdateSchema } from "@/schemas/user";
import { logActivity } from "@/firebase/actions";
import { firebaseError, isFirebaseError } from "@/utils/firebase-error";
import { logger } from "@/utils/logger";
import { serializeUser } from "@/utils/serializeUser";
import { getUserImage } from "@/utils/get-user-image";

import type { GetProfileResponse, UpdateUserProfileResponse } from "@/types/user/profile";
import type { User } from "@/types/user";

// ================= User Profile Actions =================

/**
 * Get the current user's profile
 */
export async function getProfile(): Promise<GetProfileResponse> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  try {
    const [authUser, userDoc] = await Promise.all([
      adminAuth.getUser(session.user.id),
      adminDb.collection("users").doc(session.user.id).get()
    ]);

    const userData = userDoc.data();
    if (!userData) {
      logger({
        type: "warn",
        message: `User Firestore document not found for userId: ${session.user.id}`,
        context: "user-profile"
      });
      return { success: false, error: "User data not found" };
    }

    const rawUser: User = {
      id: authUser.uid,
      name: authUser.displayName || userData.name,
      email: authUser.email,
      bio: userData.bio || "",
      role: userData.role || "user",
      ...userData
    };

    rawUser.image = getUserImage({ ...rawUser, photoURL: authUser.photoURL });

    return {
      success: true,
      user: serializeUser(rawUser)
    };
  } catch (error) {
    const message = isFirebaseError(error) ? firebaseError(error) : "Failed to get profile";
    logger({ type: "error", message: "Error in getProfile", metadata: { error: message }, context: "user-profile" });
    return { success: false, error: message };
  }
}

/**
 * Update the current user's profile
 */
export async function updateUserProfile(_: unknown, formData: FormData): Promise<UpdateUserProfileResponse> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  try {
    const name = formData.get("name") as string;
    const bio = formData.get("bio") as string;
    const imageUrl = formData.get("imageUrl") as string | null;

    // Validate input
    const result = profileUpdateSchema.safeParse({ name, bio });
    if (!result.success) {
      const errorMessage = result.error.issues[0]?.message || "Invalid form data";
      logger({
        type: "warn",
        message: "Profile update validation failed",
        metadata: { error: errorMessage },
        context: "user-profile"
      });
      return { success: false, error: errorMessage };
    }

    // Prepare Firebase Auth update
    const authUpdate: { displayName?: string; photoURL?: string } = {};
    if (name) authUpdate.displayName = name;
    if (imageUrl) authUpdate.photoURL = imageUrl;

    if (Object.keys(authUpdate).length > 0) {
      try {
        await adminAuth.updateUser(session.user.id, authUpdate);
      } catch (error) {
        const message = isFirebaseError(error) ? firebaseError(error) : "Failed to update auth profile";
        logger({
          type: "error",
          message: "Error updating Firebase Auth profile",
          metadata: { error: message },
          context: "user-profile"
        });
        return { success: false, error: message };
      }
    }

    // Update Firestore user document
    const updateData: Record<string, unknown> = { updatedAt: serverTimestamp() };
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (imageUrl) updateData.picture = imageUrl;

    await adminDb.collection("users").doc(session.user.id).update(updateData);

    // Log activity
    await logActivity({
      userId: session.user.id,
      type: "profile_update",
      description: "Profile updated",
      status: "success"
    });

    logger({
      type: "info",
      message: "Profile updated successfully",
      metadata: { userId: session.user.id },
      context: "user-profile"
    });

    return { success: true };
  } catch (error) {
    const message = isFirebaseError(error) ? firebaseError(error) : "Failed to update profile";
    logger({
      type: "error",
      message: "Error updating user profile",
      metadata: { error: message },
      context: "user-profile"
    });
    return { success: false, error: message };
  }
}
