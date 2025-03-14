"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { updatePassword } from "@/actions/auth";
import type { UpdatePasswordState } from "@/types/auth/password";

interface SecuritySettingsFormProps {
  id: string;
  onSubmitStart?: () => void;
  onSubmitComplete?: (success: boolean) => void;
}

export function SecuritySettingsForm({ id, onSubmitStart, onSubmitComplete }: SecuritySettingsFormProps) {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    onSubmitStart?.();
    setMessage(null);
    setIsSubmitting(true);

    try {
      // Provide the initial state as the first argument
      const initialState: UpdatePasswordState = { success: false };
      const result = await updatePassword(initialState, formData);

      if (result.success) {
        setMessage({ type: "success", text: "Password updated successfully!" });
        // Clear form
        (document.getElementById(id) as HTMLFormElement).reset();

        toast.success("Password updated", {
          description: "Your password has been updated successfully."
        });

        onSubmitComplete?.(true);
      } else {
        setMessage({ type: "error", text: result.error || "Failed to update password" });

        toast.error("Error", {
          description: result.error || "Failed to update password"
        });

        onSubmitComplete?.(false);
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" });

      toast.error("Error", {
        description: "An unexpected error occurred"
      });

      console.error(error);
      onSubmitComplete?.(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form id={id} action={handleSubmit} className="space-y-4">
      {message && (
        <Alert variant={message.type === "success" ? "default" : "destructive"} className="mb-6">
          {message.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertTitle>{message.type === "success" ? "Success" : "Error"}</AlertTitle>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-2">
        <Label htmlFor="currentPassword">Current Password</Label>
        <Input id="currentPassword" name="currentPassword" type="password" required />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="newPassword">New Password</Label>
        <Input id="newPassword" name="newPassword" type="password" required />
        <p className="text-sm text-muted-foreground">
          Password must be at least 8 characters and include uppercase, lowercase, numbers, and special characters.
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" required />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Updating..." : "Update Password"}
      </Button>
    </form>
  );
}
