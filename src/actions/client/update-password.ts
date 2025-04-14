// src/actions/client/updatePassword.ts
"use client";

import type { UpdatePasswordState } from "@/types/auth/password";

export async function clientUpdatePassword(formData: FormData): Promise<UpdatePasswordState> {
  try {
    const res = await fetch("/api/update-password", {
      method: "POST",
      body: formData
    });
    if (!res.ok) {
      return { success: false, error: "Failed to update password" } as UpdatePasswordState;
    }
    const data = (await res.json()) as UpdatePasswordState;
    return data;
  } catch (error) {
    console.error("clientUpdatePassword error:", error);
    return { success: false, error: "Unexpected error occurred" } as UpdatePasswordState;
  }
}
