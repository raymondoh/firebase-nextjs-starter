"use client";

import { useState, useEffect, useRef, startTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useActionState } from "react";
import { User, Upload, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { updateUserProfile } from "@/actions/user";
import type { ProfileUpdateState } from "@/types/user";
import { firebaseError, isFirebaseError } from "@/utils/firebase-error";

interface ProfileFormProps {
  id?: string;
  onCancel?: () => void;
  redirectAfterSuccess?: string;
}

export function UserProfileForm({ id, onCancel, redirectAfterSuccess = "/user" }: ProfileFormProps) {
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
        toast.success("Profile updated successfully");

        updateSessionFn()
          .then(() => {
            if (redirectAfterSuccess) {
              setTimeout(() => router.push(redirectAfterSuccess), 1500);
            }
          })
          .catch(error => {
            console.error("Error updating session:", error);
          });
      } else if (state.error) {
        const errorMessage = isFirebaseError(state.error) ? firebaseError(state.error) : state.error;

        toast.error(errorMessage);
      }
    }
  }, [state, router, updateSessionFn, redirectAfterSuccess]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => setPhotoURL(e.target?.result as string);
    reader.readAsDataURL(file);
    setPhotoFile(file);
  };

  const handleCancel = () => {
    if (!isPending && !isUploading) {
      if (window.confirm("Are you sure you want to leave? Any unsaved changes will be lost.")) {
        if (onCancel) {
          onCancel();
        } else {
          router.push("/user");
        }
      }
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Upload failed");
      return result.url;
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
        const imageUrl = await uploadFile(photoFile);
        formData.append("imageUrl", imageUrl);
      }

      startTransition(() => {
        formAction(formData);
      });
    } catch (error) {
      const errMsg = isFirebaseError(error) ? firebaseError(error) : "Failed to update profile";
      toast.error(errMsg);
      console.error("Profile update error:", error);
    }
  };

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

  //   return (
  //     <div>
  //       <form id={id} onSubmit={handleSubmit} className="grid w-full gap-6">
  //         {state?.error && (
  //           <Alert variant="destructive">
  //             <AlertCircle className="h-4 w-4" />
  //             <AlertDescription>
  //               {isFirebaseError(state.error) ? firebaseError(state.error) : state.error}
  //             </AlertDescription>
  //           </Alert>
  //         )}

  //         <div className="flex flex-col gap-6 md:flex-row md:items-center">
  //           <Avatar className="h-24 w-24 relative">
  //             {photoURL ? (
  //               <div className="absolute inset-0 rounded-full overflow-hidden">
  //                 <Image
  //                   src={photoURL || "/placeholder.svg"}
  //                   alt={session?.user?.name || "User"}
  //                   fill
  //                   sizes="(max-width: 768px) 96px, 96px"
  //                   className="object-cover"
  //                   priority
  //                 />
  //               </div>
  //             ) : (
  //               <AvatarFallback className="text-lg">
  //                 <User className="h-12 w-12" />
  //               </AvatarFallback>
  //             )}
  //           </Avatar>

  //           <div className="flex flex-col gap-2">
  //             <h3 className="text-lg font-medium">Profile Pictures</h3>
  //             <p className="text-sm text-muted-foreground">Click to upload a new profile picture.</p>
  //             <div className="flex items-center gap-2">
  //               <Input
  //                 id="profile-image"
  //                 type="file"
  //                 accept="image/*"
  //                 className="hidden"
  //                 onChange={handleFileChange}
  //                 disabled={isPending || isUploading}
  //               />
  //               <Button
  //                 type="button"
  //                 variant="outline"
  //                 onClick={() => document.getElementById("profile-image")?.click()}
  //                 disabled={isPending || isUploading}>
  //                 <Upload className="mr-2 h-4 w-4" />
  //                 Upload
  //               </Button>
  //             </div>
  //           </div>
  //         </div>

  //         <div className="space-y-2">
  //           <Label htmlFor="name">Username</Label>
  //           <Input
  //             id="name"
  //             name="name"
  //             value={name}
  //             onChange={e => setName(e.target.value)}
  //             placeholder="Your display name"
  //             required
  //           />
  //           <p className="text-sm text-muted-foreground">This is your public display name.</p>
  //         </div>

  //         <div className="space-y-2">
  //           <Label htmlFor="email">Email</Label>
  //           <Input id="email" value={session?.user?.email || ""} disabled className="bg-muted" />
  //           <p className="text-sm text-muted-foreground">
  //             Your email address is managed by your authentication provider and cannot be changed here.
  //           </p>
  //         </div>

  //         <div className="space-y-2">
  //           <Label htmlFor="bio">Bio</Label>
  //           <Textarea
  //             id="bio"
  //             name="bio"
  //             value={bio}
  //             onChange={e => setBio(e.target.value)}
  //             placeholder="Tell us a little bit about yourself"
  //             className="resize-none min-h-[100px]"
  //           />
  //           <p className="text-sm text-muted-foreground">You can @mention other users and organizations.</p>
  //         </div>

  //         <div className="mt-6 flex items-center justify-start gap-4">
  //           <Button type="submit" disabled={isPending || isUploading}>
  //             {isPending || isUploading ? (
  //               <>
  //                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  //                 {isUploading ? "Uploading..." : "Saving..."}
  //               </>
  //             ) : (
  //               "Save changes"
  //             )}
  //           </Button>
  //           <Button type="button" variant="outline" onClick={handleCancel} disabled={isPending || isUploading}>
  //             Cancel
  //           </Button>
  //         </div>
  //       </form>

  //       {isSuccess && <p className="mt-4 text-sm text-green-600">Your profile has been updated successfully.</p>}
  //     </div>
  //   );
  // }
  return (
    <div className="w-full max-w-full overflow-hidden">
      <form id={id} onSubmit={handleSubmit} className="grid w-full gap-6">
        {state?.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {isFirebaseError(state.error) ? firebaseError(state.error) : state.error}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-6 md:flex-row md:items-center">
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

          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-medium">Profile Pictures</h3>
            <p className="text-sm text-muted-foreground">Click to upload a new profile picture.</p>
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

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={session?.user?.email || ""} disabled className="bg-muted" />
          <p className="text-sm text-muted-foreground break-words">
            Your email address is managed by your authentication provider and cannot be changed here.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            name="bio"
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="Tell us a little bit about yourself"
            className="resize-none min-h-[100px]"
          />
          <p className="text-sm text-muted-foreground">You can @mention other users and organizations.</p>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-start gap-4">
          <Button type="submit" disabled={isPending || isUploading} className="w-full sm:w-auto">
            {isPending || isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isUploading ? "Uploading..." : "Saving..."}
              </>
            ) : (
              "Save changes"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isPending || isUploading}
            className="w-full sm:w-auto">
            Cancel
          </Button>
        </div>
      </form>

      {isSuccess && <p className="mt-4 text-sm text-green-600">Your profile has been updated successfully.</p>}
    </div>
  );
}
