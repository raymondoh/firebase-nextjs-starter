"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { User } from "lucide-react";

import { isFirebaseError, firebaseError } from "@/utils/firebase-error";

interface AccountSettingsFormProps {
  id: string;
  onSubmitStart?: () => void;
  onSubmitComplete?: (success: boolean) => void;
}

export function AccountSettingsForm({ id, onSubmitStart, onSubmitComplete }: AccountSettingsFormProps) {
  const { data: session } = useSession();
  const [isUploading, setIsUploading] = useState(false);

  async function handleSubmit() {
    onSubmitStart?.();

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success("Profile updated", {
        description: "Your profile has been updated successfully."
      });

      onSubmitComplete?.(true);
    } catch (error: unknown) {
      console.error("Error updating profile:", error);

      const message = isFirebaseError(error) ? firebaseError(error) : "Failed to update profile. Please try again.";

      toast.error("Error", { description: message });
      onSubmitComplete?.(false);
    }
  }

  const handleAvatarChange = async () => {
    setIsUploading(true);

    try {
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success("Avatar updated", {
        description: "Your profile picture has been updated successfully."
      });
    } catch (error: unknown) {
      const message = isFirebaseError(error) ? firebaseError(error) : "Failed to update avatar. Please try again.";

      toast.error("Error", { description: message });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form id={id} action={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={session?.user?.image || ""} alt="Profile" />
            <AvatarFallback>{session?.user?.name?.[0] || <User className="h-6 w-6" />}</AvatarFallback>
          </Avatar>
          <Button type="button" variant="outline" size="sm" onClick={handleAvatarChange} disabled={isUploading}>
            {isUploading ? "Uploading..." : "Change Avatar"}
          </Button>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={session?.user?.name || ""} placeholder="Your name" />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={session?.user?.email || ""}
            placeholder="Your email"
            disabled
          />
          <p className="text-sm text-muted-foreground">Your email address is used for login and cannot be changed.</p>
        </div>
      </div>

      <Button type="submit" disabled={isUploading}>
        Save changes
      </Button>
    </form>
  );
}
