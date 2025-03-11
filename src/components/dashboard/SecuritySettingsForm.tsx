"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { updatePassword } from "@/actions/auth";

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
      const result = await updatePassword(formData);

      if (result.success) {
        setMessage({ type: "success", text: "Password updated successfully!" });
        // Clear form
        (document.getElementById(id) as HTMLFormElement).reset();

        toast({
          title: "Password updated",
          description: "Your password has been updated successfully."
        });

        onSubmitComplete?.(true);
      } else {
        setMessage({ type: "error", text: result.error || "Failed to update password" });

        toast({
          title: "Error",
          description: result.error || "Failed to update password",
          variant: "destructive"
        });

        onSubmitComplete?.(false);
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" });

      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
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
