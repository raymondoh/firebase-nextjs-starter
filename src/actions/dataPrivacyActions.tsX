// "use server";

// import { auth, signOut } from "@/auth";
// import { adminAuth, adminDb, adminStorage } from "@/firebase/admin";
// import { Timestamp } from "firebase-admin/firestore";
// import { cookies } from "next/headers";

// // Import schemas and types
// import { exportDataSchema, accountDeletionSchema } from "@/schemas/data-privacy";
// import type { ExportFormat, ExportDataState, DeleteAccountState, ProcessDeletionsResult } from "@/types/data-privacy";

// // Helper function to convert Firestore Timestamp to ISO string
// function convertTimestamps(obj: any): any {
//   if (obj instanceof Timestamp) {
//     return obj.toDate().toISOString();
//   } else if (Array.isArray(obj)) {
//     return obj.map(convertTimestamps);
//   } else if (typeof obj === "object" && obj !== null) {
//     return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, convertTimestamps(value)]));
//   }
//   return obj;
// }

// // Convert object to CSV string
// function objectToCSV(data: any): string {
//   // Get all unique keys from all objects
//   const allKeys = new Set<string>();
//   const flattenedData = Array.isArray(data) ? data : [data];

//   flattenedData.forEach(item => {
//     Object.keys(item).forEach(key => allKeys.add(key));
//   });

//   const headers = Array.from(allKeys);
//   const csvRows = [headers.join(",")];

//   flattenedData.forEach(item => {
//     const values = headers.map(header => {
//       const value = item[header];
//       // Handle values that might contain commas or quotes
//       if (value === null || value === undefined) return "";
//       const stringValue = typeof value === "object" ? JSON.stringify(value) : String(value);
//       return `"${stringValue.replace(/"/g, '""')}"`;
//     });
//     csvRows.push(values.join(","));
//   });

//   return csvRows.join("\n");
// }

// // Export user data
// export async function exportUserData(prevState: ExportDataState | null, formData: FormData): Promise<ExportDataState> {
//   const session = await auth();

//   if (!session || !session.user || !session.user.id) {
//     return { success: false, error: "Not authenticated" };
//   }

//   try {
//     // Validate format
//     const format = formData.get("format") as ExportFormat;
//     const result = exportDataSchema.safeParse({ format });

//     if (!result.success) {
//       return { success: false, error: "Invalid export format" };
//     }

//     // Get user data from Firestore
//     const userDoc = await adminDb.collection("users").doc(session.user.id).get();
//     if (!userDoc.exists) {
//       return { success: false, error: "User data not found" };
//     }

//     // Get user's activity logs
//     let activityLogs = [];
//     try {
//       const activityLogsSnapshot = await adminDb
//         .collection("activityLogs")
//         .where("userId", "==", session.user.id)
//         .orderBy("timestamp", "desc")
//         .limit(100)
//         .get();

//       activityLogs = activityLogsSnapshot.docs.map(doc => ({
//         id: doc.id,
//         ...convertTimestamps(doc.data())
//       }));
//     } catch (indexError) {
//       console.warn(
//         "Activity logs index not yet available:",
//         indexError instanceof Error ? indexError.message : String(indexError)
//       );
//       // Continue without activity logs
//     }

//     // Compile user data
//     const userData = {
//       profile: {
//         id: session.user.id,
//         email: session.user.email,
//         name: session.user.name,
//         bio: session.user.bio || "",
//         image: session.user.image || "",
//         ...convertTimestamps(userDoc.data())
//       },
//       activityLogs
//     };

//     // Convert to requested format
//     let fileContent: string;
//     let contentType: string;
//     let fileExtension: string;

//     if (format === "json") {
//       fileContent = JSON.stringify(userData, null, 2);
//       contentType = "application/json";
//       fileExtension = "json";
//     } else {
//       // For CSV, we need to flatten the data structure
//       const flattenedData = {
//         ...userData.profile,
//         activityLogs: JSON.stringify(userData.activityLogs)
//       };
//       fileContent = objectToCSV(flattenedData);
//       contentType = "text/csv";
//       fileExtension = "csv";
//     }

//     // Upload to Firebase Storage
//     const fileName = `data-exports/${session.user.id}/user-data-${Date.now()}.${fileExtension}`;
//     const bucket = adminStorage.bucket();
//     const file = bucket.file(fileName);

//     await file.save(fileContent, {
//       metadata: {
//         contentType
//       }
//     });

//     // Generate a signed URL that expires in 1 hour
//     const [signedUrl] = await file.getSignedUrl({
//       action: "read",
//       expires: Date.now() + 60 * 60 * 1000 // 1 hour
//     });

//     // Log this export activity
//     await adminDb.collection("activityLogs").add({
//       userId: session.user.id,
//       type: "data_export",
//       description: `Data exported in ${format.toUpperCase()} format`,
//       timestamp: Timestamp.now(),
//       ipAddress: "N/A", // In a real app, you might want to capture this
//       status: "success"
//     });

//     return {
//       success: true,
//       downloadUrl: signedUrl,
//       message: `Your data has been exported in ${format.toUpperCase()} format`
//     };
//   } catch (error) {
//     console.error("Error exporting user data:", error instanceof Error ? error.message : String(error));
//     return { success: false, error: "Failed to export data" };
//   }
// }

// // Request account deletion
// export async function requestAccountDeletion(
//   prevState: DeleteAccountState | null,
//   formData: FormData
// ): Promise<DeleteAccountState> {
//   const session = await auth();

//   if (!session || !session.user || !session.user.id) {
//     return { success: false, error: "Not authenticated" };
//   }

//   try {
//     // Parse and validate the form data
//     const immediateDelete = formData.get("immediateDelete") === "true";
//     const validatedData = accountDeletionSchema.parse({ immediateDelete });

//     // Create a deletion request in Firestore
//     await adminDb.collection("deletionRequests").doc(session.user.id).set({
//       userId: session.user.id,
//       email: session.user.email,
//       requestedAt: Timestamp.now(),
//       status: "pending",
//       completedAt: null
//     });

//     // Log this activity
//     await adminDb.collection("activityLogs").add({
//       userId: session.user.id,
//       type: "deletion_request",
//       description: "Account deletion requested",
//       timestamp: Timestamp.now(),
//       ipAddress: "N/A", // In a real app, you might want to capture this
//       status: "pending"
//     });

//     // Determine if we should process the deletion immediately or wait
//     if (validatedData.immediateDelete) {
//       // Process the deletion immediately
//       await processAccountDeletion(session.user.id);

//       // Sign the user out
//       await signOut({ redirect: false });

//       // Clear cookies
//       cookies()
//         .getAll()
//         .forEach(cookie => {
//           cookies().delete(cookie.name);
//         });

//       return {
//         success: true,
//         message: "Your account has been deleted. You will be redirected to the homepage.",
//         shouldRedirect: true
//       };
//     }

//     return {
//       success: true,
//       message: "Your account deletion request has been submitted. You will receive an email confirmation shortly."
//     };
//   } catch (error) {
//     console.error("Error requesting account deletion:", error instanceof Error ? error.message : String(error));
//     return { success: false, error: "Failed to request account deletion" };
//   }
// }

// // Process account deletion (can be called directly or by a background process)
// async function processAccountDeletion(userId: string): Promise<boolean> {
//   try {
//     console.log(`Processing account deletion for user: ${userId}`);

//     // 1. Get user data for reference
//     const userDoc = await adminDb.collection("users").doc(userId).get();
//     if (!userDoc.exists) {
//       console.error(`User ${userId} not found in Firestore`);
//       return false;
//     }

//     const userData = userDoc.data();

//     // 2. Delete user's files from Storage
//     try {
//       const bucket = adminStorage.bucket();

//       // Delete profile pictures
//       const [userFiles] = await bucket.getFiles({ prefix: `users/${userId}/` });
//       await Promise.all(userFiles.map(file => file.delete()));

//       // Delete data exports
//       const [exportFiles] = await bucket.getFiles({ prefix: `data-exports/${userId}/` });
//       await Promise.all(exportFiles.map(file => file.delete()));

//       console.log(`Deleted ${userFiles.length + exportFiles.length} files for user ${userId}`);
//     } catch (storageError) {
//       console.error(`Error deleting files for user ${userId}:`, storageError);
//       // Continue with deletion even if file deletion fails
//     }

//     // 3. Delete user's activity logs
//     try {
//       const logsSnapshot = await adminDb.collection("activityLogs").where("userId", "==", userId).get();

//       const batch = adminDb.batch();
//       logsSnapshot.docs.forEach(doc => {
//         batch.delete(doc.ref);
//       });

//       await batch.commit();
//       console.log(`Deleted ${logsSnapshot.size} activity logs for user ${userId}`);
//     } catch (logsError) {
//       console.error(`Error deleting activity logs for user ${userId}:`, logsError);
//       // Continue with deletion even if logs deletion fails
//     }

//     // 4. Delete user's deletion request if it exists
//     try {
//       await adminDb.collection("deletionRequests").doc(userId).delete();
//     } catch (requestError) {
//       console.error(`Error deleting deletion request for user ${userId}:`, requestError);
//       // Continue with deletion even if request deletion fails
//     }

//     // 5. Delete user from Firestore
//     await adminDb.collection("users").doc(userId).delete();
//     console.log(`Deleted user ${userId} from Firestore`);

//     // 6. Delete user from Firebase Auth
//     await adminAuth.deleteUser(userId);
//     console.log(`Deleted user ${userId} from Firebase Auth`);

//     // 7. Update deletion request status if we're processing from a queue
//     try {
//       await adminDb.collection("deletionRequests").doc(userId).set(
//         {
//           status: "completed",
//           completedAt: Timestamp.now()
//         },
//         { merge: true }
//       );
//     } catch (updateError) {
//       console.error(`Error updating deletion request status for user ${userId}:`, updateError);
//       // This is not critical, so we can ignore it
//     }

//     return true;
//   } catch (error) {
//     console.error(`Error processing account deletion for user ${userId}:`, error);
//     return false;
//   }
// }

// // For admin use: Process all pending deletion requests
// export async function processPendingDeletions(): Promise<ProcessDeletionsResult> {
//   const session = await auth();

//   // Check if user is admin
//   if (!session?.user?.role || session.user.role !== "admin") {
//     throw new Error("Unauthorized. Only admins can process deletion requests.");
//   }

//   try {
//     // Get all pending deletion requests
//     const pendingRequestsSnapshot = await adminDb.collection("deletionRequests").where("status", "==", "pending").get();

//     console.log(`Found ${pendingRequestsSnapshot.size} pending deletion requests`);

//     let processed = 0;
//     let errors = 0;

//     // Process each request
//     for (const doc of pendingRequestsSnapshot.docs) {
//       const request = doc.data();
//       try {
//         const success = await processAccountDeletion(request.userId);
//         if (success) {
//           processed++;
//         } else {
//           errors++;
//         }
//       } catch (error) {
//         console.error(`Error processing deletion for user ${request.userId}:`, error);
//         errors++;
//       }
//     }

//     return { success: true, processed, errors };
//   } catch (error) {
//     console.error("Error processing pending deletions:", error);
//     return { success: false, processed: 0, errors: 0 };
//   }
// }
