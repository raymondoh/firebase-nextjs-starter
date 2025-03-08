// app/api/upload/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { adminStorage } from "@/firebase/admin";

export async function POST(request: NextRequest) {
  try {
    console.log("Upload API route called");

    // Check authentication
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      console.log("Unauthorized - no valid session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.log("No file provided");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log("File received:", file.name, file.type, file.size);

    // Check file type
    if (!file.type.startsWith("image/")) {
      console.log("File is not an image:", file.type);
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    console.log("File converted to buffer, size:", buffer.length);

    // Check if adminStorage is properly initialized
    if (!adminStorage) {
      console.error("adminStorage is not initialized");
      return NextResponse.json({ error: "Storage not configured" }, { status: 500 });
    }

    try {
      // Get the bucket
      const bucket = adminStorage.bucket();
      console.log("Got storage bucket:", bucket.name);

      // Generate a unique filename
      const fileExtension = file.name.split(".").pop();
      const fileName = `profile-${Date.now()}.${fileExtension}`;
      const filePath = `users/${session.user.id}/${fileName}`;
      console.log("File will be saved at:", filePath);

      // Upload to Firebase Storage
      const fileRef = bucket.file(filePath);

      await fileRef.save(buffer, {
        metadata: {
          contentType: file.type
        }
      });
      console.log("File saved to storage");

      // Make the file publicly accessible
      await fileRef.makePublic();
      console.log("File made public");

      // Get the public URL
      const url = `https://storage.googleapis.com/${bucket.name}/${fileRef.name}`;
      console.log("File URL:", url);

      return NextResponse.json({ url });
    } catch (storageError) {
      console.error("Firebase Storage error:", storageError);
      return NextResponse.json({ error: `Storage error: ${storageError.message}` }, { status: 500 });
    }
  } catch (error) {
    console.error("Error in upload API route:", error);
    return NextResponse.json({ error: `Failed to upload file: ${error.message}` }, { status: 500 });
  }
}
