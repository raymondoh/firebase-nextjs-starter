// Create a helper file: tests/helpers/create-test-user.ts
import { adminAuth, adminDb } from "@/firebase/admin";
import bcryptjs from "bcryptjs";

export async function createTestUser() {
  const email = "test@example.com";
  const password = "password123";

  try {
    // Check if user already exists
    try {
      await adminAuth.getUserByEmail(email);
      console.log("Test user already exists");
      return;
    } catch (error) {
      // User doesn't exist, create it
    }

    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: "Test User"
    });

    // Hash password for Firestore
    const salt = await bcryptjs.genSalt(10);
    const passwordHash = await bcryptjs.hash(password, salt);

    // Create user in Firestore
    await adminDb.collection("users").doc(userRecord.uid).set({
      name: "Test User",
      email,
      role: "user",
      passwordHash,
      createdAt: new Date()
    });

    console.log("Test user created successfully");
  } catch (error) {
    console.error("Error creating test user:", error);
  }
}
