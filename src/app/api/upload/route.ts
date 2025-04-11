// app/api/upload/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { adminStorage } from "@/firebase/admin/firebase-admin-init";

export async function POST(request: NextRequest) {
  try {
    console.log("Upload API route called");

    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const bucket = adminStorage.bucket();
    const fileExtension = file.name.split(".").pop();
    const isAdmin = session.user.role === "admin";
    const isProfileImage = file.name.startsWith("profile-");

    let filePath = "";

    if (isProfileImage) {
      // All users can upload profile images
      filePath = `users/${session.user.id}/profile-${Date.now()}.${fileExtension}`;
    } else if (isAdmin) {
      // Only admins can upload product images
      filePath = `products/product-${Date.now()}.${fileExtension}`;
    } else {
      return NextResponse.json({ error: "Unauthorized to upload this image" }, { status: 403 });
    }

    const fileRef = bucket.file(filePath);

    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type
      }
    });

    await fileRef.makePublic();

    const url = `https://storage.googleapis.com/${bucket.name}/${fileRef.name}`;
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload route error:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: `Upload failed: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ error: "Unknown upload error" }, { status: 500 });
  }
}
