// src/lib/syncUserWithFirebase.ts
import { adminAuth, adminDb } from "@/firebase/admin/firebase-admin-init";
import { serverTimestamp } from "@/firebase/admin/firestore";
import { logActivity } from "@/firebase/actions";

/\*\*

- Synchronizes a user between NextAuth.js and Firebase
- Works with any authentication provider
  \*/
  export async function syncUserWithFirebase(
  userId: string,
  userData: {
  email: string;
  name?: string;
  image?: string;
  provider: string;
  providerAccountId?: string;
  }
  ) {
  try {
  console.log(`Syncing user with Firebase: ${userId}, Provider: ${userData.provider}, Email: ${userData.email}`);

      let firebaseUid = userId;
      let firebaseUser = null;

      try {
        firebaseUser = await adminAuth.getUser(firebaseUid);
        console.log(`Found existing Firebase Auth user: ${firebaseUid}`);
      } catch {
        console.log(`User ${firebaseUid} not found in Firebase Auth, attempting to create...`);

        try {
          const userByEmail = await adminAuth.getUserByEmail(userData.email);
          if (userByEmail) {
            firebaseUid = userByEmail.uid;
            firebaseUser = userByEmail;
            console.log(`Found user by email: ${userData.email}, ID: ${firebaseUid}`);
          }
        } catch {
          console.log(`No user found with email: ${userData.email}`);
        }

        if (!firebaseUser) {
          console.log(`Creating new Firebase Auth user for ${userData.email}`);

          const userRecord = await adminAuth.createUser({
            uid: firebaseUid,
            email: userData.email,
            displayName: userData.name ?? userData.email.split("@")[0],
            photoURL: userData.image,
            emailVerified: true
          });

          firebaseUser = userRecord;
          console.log(`Created basic user in Firebase Auth: ${firebaseUid}`);

          if (userData.provider === "google") {
            await adminDb.collection("accounts").add({
              userId: firebaseUid,
              type: "oauth",
              provider: "google",
              providerAccountId: userData.providerAccountId ?? `unknown-${Date.now()}`,
              access_token: "placeholder",
              token_type: "bearer",
              scope: "email profile",
              id_token: "placeholder",
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });

            console.log(`Added Google provider link in accounts collection for user: ${firebaseUid}`);
          }
        }
      }

      const userDocRef = adminDb.collection("users").doc(firebaseUid);
      const userDoc = await userDocRef.get();

      if (!userDoc.exists) {
        const usersSnapshot = await adminDb.collection("users").count().get();
        const isFirstUser = usersSnapshot.data().count === 0;
        const role = isFirstUser ? "admin" : "user";

        console.log(`Creating new Firestore user document for ${userData.email} with role ${role}`);

        await userDocRef.set({
          email: userData.email,
          name: userData.name ?? userData.email.split("@")[0],
          photoURL: userData.image,
          role,
          provider: userData.provider,
          emailVerified: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastLoginAt: serverTimestamp()
        });

        await adminAuth.setCustomUserClaims(firebaseUid, { role });

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
        const existingUserData = userDoc.data();
        console.log(`Updating existing user document for ${userData.email}`);

        await userDocRef.update({
          lastLoginAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          ...(userData.name && { name: userData.name }),
          ...(userData.image && { photoURL: userData.image })
        });

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
  await logActivity({
  userId: userId,
  type: "error",
  description: "Failed to sync user with Firebase",
  status: "error",
  metadata: {
  error: error instanceof Error ? error.message : "Unknown error",
  provider: userData.provider,
  email: userData.email
  }
  });
  throw error;
  }
  }

Uncaught SyntaxError: Invalid or unexpected token
Failed to load resource: the server responded with a status of 400 ()

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
.text-balance {
text-wrap: balance;
}
}

@layer base {
:root {
/_ Softer background colors for light mode _/
--background: 220 20% 97%; /_ Changed from pure white to a very light gray with slight blue tint _/
--foreground: 222.2 84% 4.9%;

    --card: 220 20% 98%; /* Slightly softer card background */
    --card-foreground: 222.2 84% 4.9%;

    --popover: 220 20% 98%; /* Matching popover to card */
    --popover-foreground: 222.2 84% 4.9%;

    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;

    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;

    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;

    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;

    --radius: 0.5rem;

    /* Sidebar colors adjusted to match the new background */
    --sidebar-background: 220 20% 96%; /* Slightly darker than main background */
    --sidebar-foreground: 240 5.3% 26.1%;
    --sidebar-primary: 240 5.9% 10%;
    --sidebar-primary-foreground: 220 20% 97%;
    --sidebar-accent: 240 4.8% 95.9%;
    --sidebar-accent-foreground: 240 5.9% 10%;
    --sidebar-border: 220 13% 91%;
    --sidebar-ring: 217.2 91.2% 59.8%;

}

.dark {
--background: 222.2 84% 4.9%;
--foreground: 210 40% 98%;

    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;

    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;

    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;

    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;

    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;

    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;

    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;

    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;

    --sidebar-background: 240 5.9% 10%;
    --sidebar-foreground: 240 4.8% 95.9%;
    --sidebar-primary: 224.3 76.3% 48%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 240 3.7% 15.9%;
    --sidebar-accent-foreground: 240 4.8% 95.9%;
    --sidebar-border: 240 3.7% 15.9%;
    --sidebar-ring: 217.2 91.2% 59.8%;

}
}

@layer base {

- {
  @apply border-border;
  }
  body {
  @apply bg-background text-foreground;
  }
  }
  /_ Add these styles to your globals.css file _/

/_ Center icons in collapsed sidebar _/
[data-collapsible="icon"] [data-sidebar="menu-button"] {
display: flex !important;
justify-content: center !important;
align-items: center !important;
width: 2.5rem !important;
height: 2.5rem !important;
margin-left: auto !important;
margin-right: auto !important;
padding: 0.5rem !important;
}

/_ Adjust icon size if needed _/
[data-collapsible="icon"] [data-sidebar="menu-button"] svg {
width: 1.25rem !important;
height: 1.25rem !important;
}
/_ Adjust height for the taller menu items _/
[data-sidebar="menu-button"] {
min-height: 2.25rem;
}
