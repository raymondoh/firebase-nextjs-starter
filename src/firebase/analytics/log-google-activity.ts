import { adminDb } from "@/firebase/admin";
import { logActivity } from "@/firebase";

export async function logGoogleActivity(userId: string, email: string, displayName?: string | null) {
  try {
    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();
    const isNewUser = !userDoc.exists;

    // If this is a new user, set their name
    if (isNewUser) {
      const name = displayName?.trim() || email.split("@")[0];

      await userRef.set(
        {
          name,
          email,
          provider: "google",
          photoURL: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastLoginAt: new Date(),
          role: "user"
        },
        { merge: true } // don't overwrite existing fields if added elsewhere
      );
    }

    await logActivity({
      userId,
      type: isNewUser ? "register" : "login",
      description: isNewUser ? "Account created with Google" : "Logged in with Google",
      status: "success",
      userEmail: email, // ✅ optional but useful for filtering/search
      metadata: {
        provider: "google",
        email,
        name: displayName ?? email.split("@")[0] // ✅ use actual name here
      }
    });
  } catch (error) {
    console.error("Failed to log Google auth activity:", error);
  }
}
