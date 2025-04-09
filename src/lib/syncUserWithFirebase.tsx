//src/lib/syncUserWithFirebase.ts
import { adminAuth, adminDb } from "@/firebase/admin";
import { serverTimestamp } from "@/firebase/admin/firestore";
import { logActivity } from "@/firebase";

/**
 * Synchronizes a user between NextAuth.js and Firebase
 * Works with any authentication provider
 */
export async function syncUserWithFirebase(
  userId: string,
  userData: {
    email: string;
    name?: string;
    image?: string;
    provider: string;
    providerAccountId?: string; // Add this to store the Google account ID
  }
) {
  try {
    console.log(`Syncing user with Firebase: ${userId}, Provider: ${userData.provider}, Email: ${userData.email}`);

    // For Google auth, we need to ensure we're using the correct ID format
    let firebaseUid = userId;

    // Check if user exists in Firebase Auth
    let firebaseUser = null;
    try {
      firebaseUser = await adminAuth.getUser(firebaseUid);
      console.log(`Found existing Firebase Auth user: ${firebaseUid}`);
    } catch (error) {
      console.log(`User ${firebaseUid} not found in Firebase Auth, attempting to create...`);

      try {
        // Try to find user by email first
        const userByEmail = await adminAuth.getUserByEmail(userData.email);
        if (userByEmail) {
          console.log(`Found user by email: ${userData.email}, ID: ${userByEmail.uid}`);
          firebaseUid = userByEmail.uid;
          firebaseUser = userByEmail;
        }
      } catch (emailError) {
        // No user with this email exists
        console.log(`No user found with email: ${userData.email}`);
      }

      // If still no user, create a new one
      if (!firebaseUser) {
        try {
          console.log(`Creating new Firebase Auth user for ${userData.email}`);

          // For Google provider, we need to create a user with Google provider data
          if (userData.provider === "google") {
            try {
              // We can't directly create a user with Google provider in Firebase Admin SDK
              // So we'll create a basic user first
              const userRecord = await adminAuth.createUser({
                uid: firebaseUid,
                email: userData.email,
                displayName: userData.name || userData.email.split("@")[0],
                photoURL: userData.image || null,
                emailVerified: true
              });

              console.log(`Created basic user in Firebase Auth: ${userRecord.uid}`);
              firebaseUser = userRecord;

              // Now we need to manually add this user to the accounts collection
              // to link it with Google provider
              await adminDb.collection("accounts").add({
                userId: firebaseUid,
                type: "oauth",
                provider: "google",
                providerAccountId: userData.providerAccountId || userData.email,
                access_token: "placeholder", // NextAuth will update this
                token_type: "bearer",
                scope: "email profile",
                id_token: "placeholder", // NextAuth will update this
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
              });

              console.log(`Added Google provider link in accounts collection for user: ${firebaseUid}`);
            } catch (createError) {
              console.error("Error creating Google user:", createError);
              throw createError;
            }
          } else {
            // For non-Google providers, create user normally
            firebaseUser = await adminAuth.createUser({
              uid: firebaseUid,
              email: userData.email,
              displayName: userData.name || userData.email.split("@")[0],
              photoURL: userData.image || null,
              emailVerified: true
            });
          }

          console.log(`Created new Firebase Auth user: ${firebaseUid}`);
        } catch (createError) {
          console.error("Error creating Firebase Auth user:", createError);
          throw createError;
        }
      }
    }

    // Now handle Firestore user document
    const userDocRef = adminDb.collection("users").doc(firebaseUid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      // Determine if this is the first user (for admin role)
      const usersSnapshot = await adminDb.collection("users").count().get();
      const isFirstUser = usersSnapshot.data().count === 0;
      const role = isFirstUser ? "admin" : "user";

      console.log(`Creating new Firestore user document for ${userData.email} with role ${role}`);

      // Create new user document
      await userDocRef.set({
        email: userData.email,
        name: userData.name || userData.email.split("@")[0],
        photoURL: userData.image || null,
        role: role,
        provider: userData.provider,
        emailVerified: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      });

      // Set custom claims
      await adminAuth.setCustomUserClaims(firebaseUid, { role });

      // Log activity for new user
      await logActivity({
        userId: firebaseUid,
        type: "register",
        description: `Account created via ${userData.provider}`,
        status: "success",
        metadata: {
          provider: userData.provider,
          email: userData.email
        }
      });

      return { isNewUser: true, role, uid: firebaseUid };
    } else {
      // Update existing user
      const existingUserData = userDoc.data();

      console.log(`Updating existing user document for ${userData.email}`);

      await userDocRef.update({
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // Only update these if provided and not null/undefined
        ...(userData.name && { name: userData.name }),
        ...(userData.image && { photoURL: userData.image })
      });

      // Log activity
      await logActivity({
        userId: firebaseUid,
        type: "login",
        description: `Logged in with ${userData.provider}`,
        status: "success",
        metadata: {
          provider: userData.provider,
          email: userData.email
        }
      });

      return {
        isNewUser: false,
        role: existingUserData?.role || "user",
        uid: firebaseUid
      };
    }
  } catch (error) {
    console.error("Error syncing user with Firebase:", error);
    throw error;
  }
}
