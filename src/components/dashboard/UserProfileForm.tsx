"use client";

import { Button } from "@/components/ui/button";

import type React from "react";
import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { User, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { updateProfile } from "@/actions/userActions";
import { Skeleton } from "@/components/ui/skeleton";

const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters."
    })
    .max(30, {
      message: "Name must not be longer than 30 characters."
    })
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  id?: string;
  onSubmitStart?: () => void;
  onSubmitComplete?: (success: boolean) => void;
}

export function UserProfileForm({ id, onSubmitStart, onSubmitComplete }: ProfileFormProps) {
  const { data: session, status, update: updateSessionFn } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formReady, setFormReady] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: ""
    }
  });

  // Update form values and photoURL when session loads
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      console.log("Session loaded:", session);

      // Update the form with the user's name
      form.reset({
        name: session.user.name || ""
      });

      // Set the photo URL
      setPhotoURL(session.user.image || null);

      // Mark the form as ready
      setFormReady(true);

      // Reset the updated flag when session changes
      if (isUpdated) {
        setIsUpdated(false);
      }
    }
  }, [session, status, form, isUpdated]);

  async function onSubmit(data: ProfileFormValues) {
    // Notify parent component that submission is starting
    onSubmitStart?.();

    startTransition(async () => {
      try {
        // Create FormData object for the server action
        const formData = new FormData();
        formData.append("name", data.name);

        // Only append picture if it's different from the session
        if (photoURL && photoURL !== session?.user?.image) {
          formData.append("picture", photoURL);
        }

        // Call the server action
        const result = await updateProfile(formData);

        if (result.success) {
          toast("Profile updated successfully");
          console.log("Profile updated, refreshing session...");

          // Force a session refresh
          await updateSessionFn();

          // Mark as updated to trigger the useEffect
          setIsUpdated(true);

          // Update the form with the new values
          form.reset({
            name: data.name
          });

          // Force a router refresh to update any components that depend on the session
          router.refresh();

          // Notify parent component that submission completed successfully
          onSubmitComplete?.(true);
        } else {
          // Instead of throwing an error, handle it gracefully
          console.error("Error updating profile:", result.error);
          toast.error(result.error || "Failed to update profile");

          // Notify parent component that submission failed
          onSubmitComplete?.(false);
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        toast.error("Your profile could not be updated. Please try again.");

        // Notify parent component that submission failed
        onSubmitComplete?.(false);
      }
    });
  }

  // Function to handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // Create a FormData object for the file upload
      const formData = new FormData();
      formData.append("file", file);

      console.log("Uploading file:", file.name, file.type, file.size);

      // Upload the file to your server
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to upload image");
      }

      console.log("Upload successful, URL:", responseData.url);
      setPhotoURL(responseData.url);

      toast("Profile picture uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
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
    <Form {...form}>
      <form id={id} onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <Avatar className="h-24 w-24 relative">
              {photoURL ? (
                <div className="absolute inset-0 rounded-full overflow-hidden">
                  <Image
                    src={photoURL || "/placeholder.svg"}
                    alt={session?.user?.name || "User"}
                    fill
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

            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-medium">Profile Picture</h3>
              <p className="text-sm text-muted-foreground">Click the button below to upload a new profile picture.</p>
              <div className="flex items-center gap-2">
                <Input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("profile-image")?.click()}
                  disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormDescription>This is your public display name.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <FormLabel>Email</FormLabel>
            <Input value={session?.user?.email || ""} disabled className="bg-muted" />
            <FormDescription>
              Your email address is managed by your authentication provider and cannot be changed here.
            </FormDescription>
          </div>
        </div>

        {/* Add a submit button directly in the form for testing */}
        {/* <Button type="submit" disabled={isPending || isUploading}>
          {isPending ? "Saving..." : "Save changes"}
        </Button> */}
      </form>
    </Form>
  );
}
