// "use client";

// import { useState, useEffect, useRef, startTransition } from "react";
// import { useRouter } from "next/navigation";
// import { useSession } from "next-auth/react";
// import { useActionState } from "react";
// import { Upload, AlertCircle } from "lucide-react";
// import { toast } from "sonner";
// import Image from "next/image";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Badge } from "@/components/ui/badge";
// import { updateUserProfile } from "@/actions/user";
// import { firebaseError, isFirebaseError } from "@/utils/firebase-error";
// import type { ProfileUpdateState } from "@/types/user";
// import { getInitials } from "@/utils/get-initials";
// import { uploadFile } from "@/utils/uploadFile";
// import { validateFileSize } from "@/utils/validateFileSize";
// import { SubmitButton } from "../shared/SubmitButton";
// interface UnifiedProfileFormProps {
//   id?: string;
//   onCancel?: () => void;
//   redirectAfterSuccess?: string;
//   isAdmin?: boolean;
// }

// export function UserProfileForm({ id, onCancel, redirectAfterSuccess, isAdmin = false }: UnifiedProfileFormProps) {
//   const { data: session, status, update: updateSessionFn } = useSession();
//   const router = useRouter();

//   const [name, setName] = useState("");
//   const [bio, setBio] = useState("");
//   const [photoURL, setPhotoURL] = useState<string | null>(null);
//   const [photoFile, setPhotoFile] = useState<File | null>(null);
//   const [formReady, setFormReady] = useState(false);
//   const [isSuccess, setIsSuccess] = useState(false);
//   const [isUploading, setIsUploading] = useState(false);

//   const updateProcessedRef = useRef(false);

//   const [state, formAction, isPending] = useActionState<ProfileUpdateState, FormData>(updateUserProfile, {
//     success: false
//   });

//   useEffect(() => {
//     if (status === "authenticated" && session?.user && !formReady) {
//       setName(session.user.name || "");
//       setBio(session.user.bio || "");
//       setPhotoURL(session.user.image || null);
//       setFormReady(true);
//     }
//   }, [session, status, formReady]);

//   useEffect(() => {
//     if (state && !updateProcessedRef.current) {
//       if (state.success) {
//         updateProcessedRef.current = true;
//         setIsSuccess(true);
//         toast.success("Profile updated successfully");

//         updateSessionFn()
//           .then(() => {
//             if (redirectAfterSuccess) {
//               setTimeout(() => router.push(redirectAfterSuccess), 1500);
//             }
//           })
//           .catch(error => {
//             const message = isFirebaseError(error) ? firebaseError(error) : "Failed to update session";
//             toast.error(message);
//             console.error("Session update error:", error);
//           });
//       } else if (state.error) {
//         const message = isFirebaseError(state.error) ? firebaseError(state.error) : state.error;
//         toast.error(message);
//       }
//     }
//   }, [state, router, updateSessionFn, redirectAfterSuccess]);

//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = e => setPhotoURL(e.target?.result as string);
//     reader.readAsDataURL(file);
//     setPhotoFile(file);
//   };

//   const handleCancel = () => {
//     if (!isPending && !isUploading) {
//       if (window.confirm("Are you sure you want to leave? Any unsaved changes will be lost.")) {
//         if (onCancel) {
//           onCancel();
//         } else {
//           router.push(isAdmin ? "/admin" : "/user");
//         }
//       }
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     updateProcessedRef.current = false;

//     try {
//       const formData = new FormData();
//       formData.append("name", name);
//       formData.append("bio", bio);

//       if (photoFile) {
//         const validationError = validateFileSize(photoFile, 2); // 2MB max
//         if (validationError) {
//           toast.error(validationError);
//           return;
//         }

//         const imageUrl = await uploadFile(photoFile, { prefix: "profile" });
//         formData.append("imageUrl", imageUrl);
//       }

//       startTransition(() => {
//         formAction(formData);
//       });
//     } catch (error: unknown) {
//       const message =
//         error instanceof Error && error.message.includes("File too large")
//           ? "Image too large. Please upload a file under 2MB."
//           : isFirebaseError(error)
//           ? firebaseError(error)
//           : error instanceof Error
//           ? error.message
//           : "Failed to update profile";

//       toast.error(message);
//       console.error("Profile update error:", error);
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   if (status === "loading" || !formReady) {
//     return (
//       <div className="space-y-8">
//         <Skeleton className="h-24 w-24 rounded-full" />
//         <Skeleton className="h-5 w-40" />
//         <Skeleton className="h-10 w-full" />
//         <Skeleton className="h-10 w-full" />
//       </div>
//     );
//   }

//   return (
//     <form id={id} onSubmit={handleSubmit} className="grid w-full gap-6">
//       {state?.error && (
//         <Alert variant="destructive">
//           <AlertCircle className="h-4 w-4" />
//           <AlertDescription>{state.error}</AlertDescription>
//         </Alert>
//       )}

//       <div className="flex flex-col gap-6 md:flex-row md:items-center">
//         {/* <Avatar className="h-24 w-24 relative">
//           {photoURL ? (
//             <div className="absolute inset-0 overflow-hidden rounded-full">
//               <Image
//                 src={photoURL || "/placeholder.svg"}
//                 alt={session?.user?.name || "User"}
//                 fill
//                 sizes="(max-width: 768px) 96px"
//                 className="object-cover"
//                 priority
//               />
//             </div>
//           ) : (
//             <AvatarFallback className="text-lg">
//               {isAdmin ? <Shield className="h-12 w-12" /> : <User className="h-12 w-12" />}
//             </AvatarFallback>
//           )}
//         </Avatar> */}
//         <Avatar className="h-24 w-24 relative">
//           {photoURL ? (
//             <div className="absolute inset-0 overflow-hidden rounded-full">
//               <Image
//                 src={photoURL || "/placeholder.svg"}
//                 alt={session?.user?.name || "User"}
//                 fill
//                 sizes="(max-width: 768px) 96px"
//                 className="object-cover"
//                 priority
//               />
//             </div>
//           ) : (
//             <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
//               {getInitials(session?.user?.name || session?.user?.email || "U")}
//             </AvatarFallback>
//           )}
//         </Avatar>

//         <div className="flex flex-col gap-2">
//           <div className="flex items-center gap-2">
//             <h3 className="text-lg font-medium">{isAdmin ? "Admin Profile" : "User Profile"}</h3>
//             <Badge variant={isAdmin ? "destructive" : "secondary"}>{isAdmin ? "Admin" : "User"}</Badge>
//           </div>
//           <p className="text-sm text-muted-foreground">Upload a new profile picture</p>
//           <div className="flex items-center gap-2">
//             <Input
//               id="profile-image"
//               type="file"
//               accept="image/*"
//               className="hidden"
//               onChange={handleFileChange}
//               disabled={isPending || isUploading}
//             />
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => document.getElementById("profile-image")?.click()}
//               disabled={isPending || isUploading}>
//               <Upload className="mr-2 h-4 w-4" /> Upload
//             </Button>
//           </div>
//         </div>
//       </div>

//       <div className="space-y-2">
//         <Label htmlFor="name">Name</Label>
//         <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
//       </div>

//       <div className="space-y-2">
//         <Label htmlFor="email">Email</Label>
//         <Input id="email" value={session?.user?.email || ""} disabled className="bg-muted" />
//       </div>

//       <div className="space-y-2">
//         <Label htmlFor="bio">Bio</Label>
//         <Textarea
//           id="bio"
//           value={bio}
//           onChange={e => setBio(e.target.value)}
//           placeholder="Tell us a bit about yourself"
//           className="resize-none min-h-[100px]"
//         />
//       </div>

//       <div className="mt-6 flex flex-wrap items-center justify-start gap-4">
//         {/* <Button type="submit" disabled={isPending || isUploading}>
//           {isPending || isUploading ? (
//             <>
//               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//               {isUploading ? "Uploading..." : "Saving..."}
//             </>
//           ) : (
//             "Save changes"
//           )}
//         </Button> */}
//         <SubmitButton isLoading={isPending || isUploading} loadingText={isUploading ? "Uploading..." : "Saving..."}>
//           Save changes
//         </SubmitButton>

//         <Button type="button" variant="outline" onClick={handleCancel} disabled={isPending || isUploading}>
//           Cancel
//         </Button>
//       </div>

//       {isSuccess && <p className="mt-4 text-sm text-green-600">Profile updated successfully.</p>}
//     </form>
//   );
// }
// components/dashboard/user/UserProfileForm.tsx

"use client";

import { useState, useEffect, useRef, startTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useActionState } from "react";
import { Upload, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { updateUserProfile } from "@/actions/user";
import { firebaseError, isFirebaseError } from "@/utils/firebase-error";
import type { ProfileUpdateState } from "@/types/user";
import { getInitials } from "@/utils/get-initials";
import { uploadFile } from "@/utils/uploadFile";
import { validateFileSize } from "@/utils/validateFileSize";
import { SubmitButton } from "@/components/shared/SubmitButton";

interface UnifiedProfileFormProps {
  id?: string;
  onCancel?: () => void;
  redirectAfterSuccess?: string;
  isAdmin?: boolean;
}

export function UserProfileForm({ id, onCancel, redirectAfterSuccess, isAdmin = false }: UnifiedProfileFormProps) {
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
            const message = isFirebaseError(error) ? firebaseError(error) : "Failed to update session";
            toast.error(message);
            console.error("Session update error:", error);
          });
      } else if (state.error) {
        const message = isFirebaseError(state.error) ? firebaseError(state.error) : state.error;
        toast.error(message);
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
          router.push(isAdmin ? "/admin" : "/user");
        }
      }
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
        const validationError = validateFileSize(photoFile, 2); // 2MB max
        if (validationError) {
          toast.error(validationError);
          return;
        }

        const imageUrl = await uploadFile(photoFile, { prefix: "profile" });
        formData.append("imageUrl", imageUrl);
      }

      startTransition(() => {
        formAction(formData);
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error && error.message.includes("File too large")
          ? "Image too large. Please upload a file under 2MB."
          : isFirebaseError(error)
          ? firebaseError(error)
          : error instanceof Error
          ? error.message
          : "Failed to update profile";

      toast.error(message);
      console.error("Profile update error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  if (status === "loading" || !formReady) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Update your personal details and profile picture.</CardDescription>
      </CardHeader>
      <form id={id} onSubmit={handleSubmit} className="w-full">
        <CardContent className="grid gap-6">
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
                    src={photoURL || "/placeholder.svg"}
                    alt={session?.user?.name || "User"}
                    fill
                    sizes="(max-width: 768px) 96px"
                    className="object-cover"
                    priority
                  />
                </div>
              ) : (
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {getInitials(session?.user?.name || session?.user?.email || "U")}
                </AvatarFallback>
              )}
            </Avatar>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">{isAdmin ? "Admin Profile" : "User Profile"}</h3>
                <Badge variant={isAdmin ? "destructive" : "secondary"}>{isAdmin ? "Admin" : "User"}</Badge>
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
                  <Upload className="mr-2 h-4 w-4" /> Upload
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
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
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-start gap-4">
          <SubmitButton isLoading={isPending || isUploading} loadingText={isUploading ? "Uploading..." : "Saving..."}>
            Save changes
          </SubmitButton>

          <Button type="button" variant="outline" onClick={handleCancel} disabled={isPending || isUploading}>
            Cancel
          </Button>

          {isSuccess && <p className="text-sm text-green-600">Profile updated successfully.</p>}
        </CardFooter>
      </form>
    </Card>
  );
}
