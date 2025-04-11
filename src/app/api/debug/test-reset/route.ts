// IMPORTANT: REMOVE THIS FILE BEFORE PRODUCTION
import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/firebase/admin/firebase-admin-init";
import bcryptjs from "bcryptjs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const newPassword = searchParams.get("password") || "TestPassword123!";

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    // Get the user by email
    const userRecord = await adminAuth.getUserByEmail(email);

    // Update password in Firebase Auth
    await adminAuth.updateUser(userRecord.uid, {
      password: newPassword
    });

    // Hash the new password for Firestore
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);

    // Update the password hash in Firestore
    await adminDb.collection("users").doc(userRecord.uid).update({
      passwordHash: hashedPassword,
      updatedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: "Password reset successful",
      email: email,
      newPassword: newPassword,
      userId: userRecord.uid
    });
  } catch (error: any) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        errorCode: error.code,
        email: email
      },
      { status: 500 }
    );
  }
}
