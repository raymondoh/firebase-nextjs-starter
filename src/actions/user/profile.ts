// "use server";

// import { auth } from "@/auth";
// import { adminAuth, adminDb } from "@/firebase/admin/firebase-admin-init";
// import { serverTimestamp } from "@/firebase/admin/firestore";
// import { profileUpdateSchema } from "@/schemas/user";
// import { convertTimestamps } from "@/firebase/utils/firestore";
// import { logActivity } from "@/firebase/actions";
// import { firebaseError, isFirebaseError } from "@/utils/firebase-error";
// import type { GetProfileResponse, UpdateUserProfileResponse } from "@/types/user/profile";
// import type { User } from "@/types/user";

// /**
//  * Get user profile
//  */
// export async function getProfile(): Promise<GetProfileResponse> {
//   const session = await auth();
//   if (!session?.user?.id) return { success: false, error: "Not authenticated" };

//   try {
//     const [authUser, userDoc] = await Promise.all([
//       adminAuth.getUser(session.user.id),
//       adminDb.collection("users").doc(session.user.id).get()
//     ]);

//     const userData = userDoc.data();
//     if (!userData) return { success: false, error: "User data not found" };

//     return {
//       success: true,
//       user: convertTimestamps({
//         id: authUser.uid,
//         name: authUser.displayName || userData.name,
//         email: authUser.email,
//         bio: userData.bio || "",
//         image: authUser.photoURL || userData.picture,
//         role: userData.role || "user",
//         ...userData
//       }) as User
//     };
//   } catch (error) {
//     const message = isFirebaseError(error) ? firebaseError(error) : "Failed to get profile";
//     console.error("[GET_PROFILE]", message);
//     return { success: false, error: message };
//   }
// }

// /**
//  * Update user profile
//  */
// export async function updateUserProfile(_: unknown, formData: FormData): Promise<UpdateUserProfileResponse> {
//   const session = await auth();
//   if (!session?.user?.id) return { success: false, error: "Not authenticated" };

//   try {
//     const name = formData.get("name") as string;
//     const bio = formData.get("bio") as string;
//     const imageUrl = formData.get("imageUrl") as string | null;

//     const result = profileUpdateSchema.safeParse({ name, bio });
//     if (!result.success) {
//       const errorMessage = result.error.issues[0]?.message || "Invalid form data";
//       return { success: false, error: errorMessage };
//     }

//     const authUpdate: { displayName?: string; photoURL?: string } = {};
//     if (name) authUpdate.displayName = name;
//     if (imageUrl) authUpdate.photoURL = imageUrl;

//     if (Object.keys(authUpdate).length > 0) {
//       try {
//         await adminAuth.updateUser(session.user.id, authUpdate);
//       } catch (error) {
//         const message = isFirebaseError(error) ? firebaseError(error) : "Failed to update auth profile";
//         return { success: false, error: message };
//       }
//     }

//     const updateData: Record<string, unknown> = {
//       updatedAt: serverTimestamp()
//     };
//     if (name) updateData.name = name;
//     if (bio !== undefined) updateData.bio = bio;
//     if (imageUrl) updateData.picture = imageUrl;

//     await adminDb.collection("users").doc(session.user.id).update(updateData);

//     await logActivity({
//       userId: session.user.id,
//       type: "profile_update",
//       description: "Profile updated",
//       status: "success"
//     });

//     return { success: true };
//   } catch (error) {
//     const message = isFirebaseError(error) ? firebaseError(error) : "Failed to update profile";
//     console.error("[UPDATE_PROFILE]", message);
//     return { success: false, error: message };
//   }
// }
"use server";

import { auth } from "@/auth";
import { adminAuth, adminDb } from "@/firebase/admin/firebase-admin-init";
// Update the serverTimestamp import to use the new date helper
import { serverTimestamp } from "@/utils/date-server";
import { profileUpdateSchema } from "@/schemas/user";
import { logActivity } from "@/firebase/actions";
import { firebaseError, isFirebaseError } from "@/utils/firebase-error";
import type { GetProfileResponse, UpdateUserProfileResponse } from "@/types/user/profile";
import type { User } from "@/types/user";
import { serializeUser } from "@/utils/serializeUser";

/**
 * Get user profile
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
    if (!userData) return { success: false, error: "User data not found" };

    // Build a raw user object from both Auth and Firestore data
    const rawUser: User = {
      id: authUser.uid,
      name: authUser.displayName || userData.name,
      email: authUser.email,
      bio: userData.bio || "",
      image: authUser.photoURL || userData.picture,
      role: userData.role || "user",
      ...userData
    };

    return {
      success: true,
      user: serializeUser(rawUser)
    };
  } catch (error) {
    const message = isFirebaseError(error) ? firebaseError(error) : "Failed to get profile";
    console.error("[GET_PROFILE]", message);
    return { success: false, error: message };
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(_: unknown, formData: FormData): Promise<UpdateUserProfileResponse> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  try {
    const name = formData.get("name") as string;
    const bio = formData.get("bio") as string;
    const imageUrl = formData.get("imageUrl") as string | null;

    const result = profileUpdateSchema.safeParse({ name, bio });
    if (!result.success) {
      const errorMessage = result.error.issues[0]?.message || "Invalid form data";
      return { success: false, error: errorMessage };
    }

    const authUpdate: { displayName?: string; photoURL?: string } = {};
    if (name) authUpdate.displayName = name;
    if (imageUrl) authUpdate.photoURL = imageUrl;

    if (Object.keys(authUpdate).length > 0) {
      try {
        await adminAuth.updateUser(session.user.id, authUpdate);
      } catch (error) {
        const message = isFirebaseError(error) ? firebaseError(error) : "Failed to update auth profile";
        return { success: false, error: message };
      }
    }

    const updateData: Record<string, unknown> = {
      updatedAt: serverTimestamp()
    };
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (imageUrl) updateData.picture = imageUrl;

    await adminDb.collection("users").doc(session.user.id).update(updateData);

    await logActivity({
      userId: session.user.id,
      type: "profile_update",
      description: "Profile updated",
      status: "success"
    });

    return { success: true };
  } catch (error) {
    const message = isFirebaseError(error) ? firebaseError(error) : "Failed to update profile";
    console.error("[UPDATE_PROFILE]", message);
    return { success: false, error: message };
  }
}
