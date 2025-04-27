// // /actions/client/fetchAllUsersClient.ts

// "use client";

// import type { SerializedUser } from "@/types/user";

// export async function fetchAllUsersClient(): Promise<SerializedUser[]> {
//   try {
//     const res = await fetch("/api/users");
//     const json = await res.json();
//     console.log("[fetchAllUsersClient] Result!!!:", json); // ✅ Add this
//     return json.users || [];
//   } catch (error) {
//     console.error("[fetchAllUsersClient] Error:", error);
//     return [];
//   }
// }
"use client";

// ================= Imports =================
import type { SerializedUser } from "@/types/user";

// ================= Client Actions =================

/**
 * Fetch all users (client-side)
 */
export async function fetchAllUsersClient(): Promise<SerializedUser[]> {
  try {
    const response = await fetch("/api/users");
    const json = await response.json();

    console.log("[fetchAllUsersClient] Response:", json);

    return json.users || [];
  } catch (error) {
    console.error("[fetchAllUsersClient] Error:", error);
    return [];
  }
}
