"use client";

import type React from "react";
import { useState, useEffect, useRef, startTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useActionState } from "react";
import { Upload, Loader2, Shield } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

import { updateUserProfile } from "@/actions/user";
import { isFirebaseError, firebaseError } from "@/utils/firebase-error";
import type { ProfileUpdateState } from "@/types/user";

interface AdminProfileFormProps {
  id?: string;
  onCancel?: () => void;
  redirectAfterSuccess?: string;
}

export function AdminProfileForm({ id, onCancel, redirectAfterSuccess = "/admin" }: AdminProfileFormProps) {
  const { data: session, status, update: updateSessionFn } = useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [formReady, setFormReady] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const updateProcessedRef = useRef(false);

  const [state, formAction, isPending] = useActionState<ProfileUpdateState, FormData>(updateUserProfile, {
    success: false
  });

  useEffect(() => {
    if (status === "authenticated" && session?.user && !formReady) {
      setName(session.user.name || "");
      setBio(session.user.bio || "");
      setPhotoURL(session.user.image || null);
      setFormReady(true);
    }
  }, [session, status, formReady]);

  useEffect(() => {
    if (state && !updateProcessedRef.current) {
      if (state.success) {
        updateProcessedRef.current = true;
        setIsSuccess(true);
        toast.success("Admin profile updated successfully");

        updateSessionFn()
          .then(() => {
            if (redirectAfterSuccess) {
              setTimeout(() => {
                router.push(redirectAfterSuccess);
              }, 1500);
            }
          })
          .catch(err => {
            const message = isFirebaseError(err) ? firebaseError(err) : "Failed to update session";
            toast.error(message);
            console.error("Session update error:", err);
          });
      } else if (state.error) {
        toast.error(state.error);
      }
    }
  }, [state, router, updateSessionFn, redirectAfterSuccess]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      setPhotoURL(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    setPhotoFile(file);
  };

  const handleCancel = () => {
    if (isPending || isUploading) return;
    if (!window.confirm("Are you sure you want to leave? Unsaved changes will be lost.")) return;

    if (onCancel) {
      onCancel();
    } else {
      router.push("/admin");
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    setIsUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: uploadFormData });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const result = await res.json();
      return result.url;
    } catch (err) {
      const message = isFirebaseError(err) ? firebaseError(err) : "Failed to upload image";
      toast.error(message);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateProcessedRef.current = false;

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("bio", bio);

      if (photoFile) {
        try {
          const imageUrl = await uploadFile(photoFile);
          formData.append("imageUrl", imageUrl);
        } catch {
          return;
        }
      }

      startTransition(() => {
        formAction(formData);
      });
    } catch (err) {
      const message = isFirebaseError(err) ? firebaseError(err) : "Failed to update profile";
      toast.error(message);
    }
  };

  if (status === "loading" || !formReady) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-24 w-24 rounded-full" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <form id={id} onSubmit={handleSubmit} className="grid w-full gap-6">
      {state?.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-6 md:flex-row md:items-center">
        <Avatar className="h-24 w-24 relative">
          {photoURL ? (
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <Image
                src={photoURL}
                alt={session?.user?.name || "Admin"}
                fill
                sizes="(max-width: 768px) 96px"
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <AvatarFallback className="text-lg">
              <Shield className="h-12 w-12" />
            </AvatarFallback>
          )}
        </Avatar>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium">Admin Profile</h3>
            <Badge variant="destructive">Admin</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Upload a new profile picture</p>
          <div className="flex items-center gap-2">
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

      <div className="space-y-2">
        <Label htmlFor="name">Admin Name</Label>
        <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={session?.user?.email || ""} disabled className="bg-muted" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={e => setBio(e.target.value)}
          placeholder="Tell us a bit about yourself"
          className="resize-none min-h-[100px]"
        />
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

      {isSuccess && <p className="mt-4 text-sm text-green-600">Profile updated successfully.</p>}
    </form>
  );
}
