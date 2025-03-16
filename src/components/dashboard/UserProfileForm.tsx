"use client";

import type React from "react";
import { useState, useEffect, useRef, startTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useActionState } from "react";
import { User, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { updateUserProfile } from "@/actions/user";
import type { ProfileUpdateState } from "@/types/user";

interface ProfileFormProps {
  id?: string;
  onCancel?: () => void;
  redirectAfterSuccess?: string;
}

export function UserProfileForm({ id, onCancel, redirectAfterSuccess = "/user" }: ProfileFormProps) {
  const { data: session, status, update: updateSessionFn } = useSession();
  const router = useRouter();

  // Form state
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [formReady, setFormReady] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Use a ref to track if we've already processed a successful update
  const updateProcessedRef = useRef(false);

  // Use action state for form submission
  const [state, formAction, isPending] = useActionState<ProfileUpdateState, FormData>(updateUserProfile, {
    success: false
  });

  // Update form values and photoURL when session loads
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Only update the form values if they're empty or if we haven't loaded them yet
      if (!formReady) {
        console.log("Loading session data into form:", session.user);
        setName(session.user.name || "");
        setBio(session.user.bio || "");
        setPhotoURL(session.user.image || null);
        setFormReady(true);
      }
    }
  }, [session, status, formReady]);

  // Handle form submission result
  useEffect(() => {
    if (state && !updateProcessedRef.current) {
      if (state.success) {
        // Mark that we've processed this update to prevent loops
        updateProcessedRef.current = true;

        setIsSuccess(true);
        toast.success("Profile updated successfully");

        // Only update the session once
        updateSessionFn()
          .then(() => {
            console.log("Session updated successfully");

            // Only redirect if specified
            if (redirectAfterSuccess) {
              setTimeout(() => {
                router.push(redirectAfterSuccess);
              }, 1500);
            }
          })
          .catch(error => {
            console.error("Error updating session:", error);
          });
      } else if (state.error) {
        toast.error(state.error);
      }
    }
  }, [state, router, updateSessionFn, redirectAfterSuccess]);

  // Function to handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Preview the image
    const reader = new FileReader();
    reader.onload = e => {
      setPhotoURL(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Store the file for upload during form submission
    setPhotoFile(file);
  };

  // Function to handle cancel
  const handleCancel = () => {
    if (isPending || isUploading) return;

    if (!window.confirm("Are you sure you want to leave? Any unsaved changes will be lost.")) {
      return;
    }

    if (onCancel) {
      onCancel();
    } else {
      router.push("/user");
    }
  };

  // Function to upload the file and get the URL
  const uploadFile = async (file: File): Promise<string> => {
    setIsUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || "Failed to upload image");
      }

      const uploadResult = await uploadResponse.json();
      console.log("Image uploaded successfully:", uploadResult.url);
      return uploadResult.url;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Reset the update processed flag
    updateProcessedRef.current = false;

    try {
      // Create the form data
      const formData = new FormData();
      formData.append("name", name);
      formData.append("bio", bio);

      // If there's a new photo file, upload it first
      if (photoFile) {
        setIsUploading(true);
        try {
          const imageUrl = await uploadFile(photoFile);
          formData.append("imageUrl", imageUrl);
        } catch (error) {
          console.error("Error uploading file:", error);
          toast.error(error instanceof Error ? error.message : "Failed to upload image");
          return;
        } finally {
          setIsUploading(false);
        }
      }

      // Now submit the form with the action inside startTransition
      startTransition(() => {
        formAction(formData);
      });
    } catch (error) {
      console.error("Error during form submission:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    }
  };

  // Show loading state while session is loading
  if (status === "loading" || !formReady) {
    return (
      <div className="space-y-8">
        <div className="space-y-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-60" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-60" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <form id={id} onSubmit={handleSubmit} className="grid w-full gap-6" style={{ border: "none" }}>
        {state?.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        {/* Profile Picture Section */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center" style={{ border: "none" }}>
          <Avatar className="h-24 w-24 relative">
            {photoURL ? (
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <Image
                  src={photoURL || "/placeholder.svg"}
                  alt={session?.user?.name || "User"}
                  fill
                  sizes="(max-width: 768px) 96px, 96px"
                  className="object-cover"
                  priority
                />
              </div>
            ) : (
              <AvatarFallback className="text-lg">
                <User className="h-12 w-12" />
              </AvatarFallback>
            )}
          </Avatar>

          <div className="flex flex-col gap-2" style={{ border: "none" }}>
            <h3 className="text-lg font-medium">Profile Picture</h3>
            <p className="text-sm text-muted-foreground">Click the button below to upload a new profile picture.</p>
            <div className="flex items-center gap-2" style={{ border: "none" }}>
              <Input
                id="profile-image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={isPending || isUploading}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("profile-image")?.click()}
                disabled={isPending || isUploading}>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </div>
          </div>
        </div>

        {/* Name Field */}
        <div className="space-y-2" style={{ border: "none" }}>
          <Label htmlFor="name">Username</Label>
          <Input
            id="name"
            name="name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your display name"
            required
          />
          <p className="text-sm text-muted-foreground">This is your public display name.</p>
        </div>

        {/* Email Field (Read-only) */}
        <div className="space-y-2" style={{ border: "none" }}>
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={session?.user?.email || ""} disabled className="bg-muted" />
          <p className="text-sm text-muted-foreground">
            Your email address is managed by your authentication provider and cannot be changed here.
          </p>
        </div>

        {/* Bio Field */}
        <div className="space-y-2" style={{ border: "none" }}>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            name="bio"
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="Tell us a little bit about yourself"
            className="resize-none min-h-[100px]"
          />
          <p className="text-sm text-muted-foreground">
            Share a brief description about yourself. You can @mention other users and organizations.
          </p>
        </div>

        <div className="mt-6 flex items-center justify-start gap-4">
          <Button type="submit" disabled={isPending || isUploading}>
            {isPending || isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isUploading ? "Uploading..." : "Saving..."}
              </>
            ) : (
              "Save changes"
            )}
          </Button>
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isPending || isUploading}>
            Cancel
          </Button>
        </div>
      </form>

      {isSuccess && <p className="mt-4 text-sm text-green-600">Your profile has been updated successfully.</p>}
    </div>
  );
}
