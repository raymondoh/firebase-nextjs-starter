// "use client";

// import { useState, useEffect, useRef, startTransition, useActionState } from "react";
// import { useRouter } from "next/navigation";
// import { useSession } from "next-auth/react";
// import { Upload, AlertCircle } from "lucide-react";
// import { toast } from "sonner";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
// import { updateUserProfile } from "@/actions/user";
// import { firebaseError, isFirebaseError } from "@/utils/firebase-error";
// import { uploadFile } from "@/utils/uploadFile";
// import { validateFileSize } from "@/utils/validateFileSize";
// import { SubmitButton } from "@/components/shared/SubmitButton";
// import { UserProfileSkeleton } from "./UserProfileSkeleton";
// import type { ProfileUpdateState, User } from "@/types/user";
// import { UserAvatar } from "../shared/UserAvatar";

// interface UnifiedProfileFormProps {
//   id?: string;
//   onCancel?: () => void;
//   redirectAfterSuccess?: string;
//   isAdmin?: boolean;
//   isLoading?: boolean;
//   user?: User | null;
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
//         const message = typeof state.error === "string" ? state.error : firebaseError(state.error);
//         toast.error(message);
//       }
//     }
//   }, [state, router, updateSessionFn, redirectAfterSuccess]);

//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     const error = validateFileSize(file, 2);
//     if (error) {
//       toast.error(error);
//       return;
//     }

//     const reader = new FileReader();
//     reader.onload = e => setPhotoURL(e.target?.result as string);
//     reader.readAsDataURL(file);
//     setPhotoFile(file);
//   };

//   const handleCancel = () => {
//     if (!isPending && !isUploading) {
//       if (window.confirm("Are you sure you want to leave? Any unsaved changes will be lost.")) {
//         if (onCancel) onCancel();
//         else router.push(isAdmin ? "/admin" : "/user");
//       }
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     try {
//       const formData = new FormData();
//       formData.append("name", name);
//       formData.append("bio", bio);

//       if (photoFile) {
//         setIsUploading(true);
//         const imageUrl = await uploadFile(photoFile, { prefix: "profile" });
//         formData.append("imageUrl", imageUrl);
//       }

//       startTransition(() => {
//         updateProcessedRef.current = false;
//         formAction(formData);
//       });
//     } catch (error: unknown) {
//       console.error("Profile update error:", error);
//       const message =
//         error instanceof Error && error.message.includes("File too large")
//           ? "Image too large. Please upload a file under 2MB."
//           : isFirebaseError(error)
//           ? firebaseError(error)
//           : error instanceof Error
//           ? error.message
//           : "Failed to update profile";

//       toast.error(message);
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   if (status === "loading" || !formReady) {
//     return <UserProfileSkeleton />;
//   }

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Personal Information</CardTitle>
//         <CardDescription>Update your personal details and profile picture.</CardDescription>
//       </CardHeader>
//       <form id={id} onSubmit={handleSubmit} className="w-full">
//         <CardContent className="grid gap-6">
//           {state?.error && (
//             <Alert variant="destructive">
//               <AlertCircle className="h-4 w-4" />
//               <AlertDescription>{state.error}</AlertDescription>
//             </Alert>
//           )}

//           <div className="flex flex-col gap-6 md:flex-row md:items-center">
//             <Button
//               type="button"
//               variant="ghost"
//               size="icon"
//               className="h-20 w-20 p-1 rounded-full
//              ring-0 ring-offset-0
//              hover:ring-2 hover:ring-gray-400
//              focus:ring-2 focus:ring-gray-400
//              transition duration-200">
//               <UserAvatar
//                 src={photoURL}
//                 name={session?.user?.name}
//                 email={session?.user?.email}
//                 className="h-full w-full"
//               />
//             </Button>

//             <div className="flex flex-col gap-2">
//               <div className="flex items-center gap-2">
//                 <h3 className="text-lg font-medium">{isAdmin ? "Admin Profile" : "User Profile"}</h3>
//                 <Badge variant={isAdmin ? "destructive" : "secondary"}>{isAdmin ? "Admin" : "User"}</Badge>
//               </div>
//               <p className="text-sm text-muted-foreground">Upload a new profile picture</p>
//               <div className="flex items-center gap-2">
//                 <Input
//                   id="profile-image"
//                   type="file"
//                   accept="image/*"
//                   className="hidden"
//                   onChange={handleFileChange}
//                   disabled={isPending || isUploading}
//                 />
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={() => document.getElementById("profile-image")?.click()}
//                   disabled={isPending || isUploading}>
//                   <Upload className="mr-2 h-4 w-4" /> Upload
//                 </Button>
//               </div>
//               {photoFile && <p className="text-sm text-muted-foreground">{photoFile.name}</p>}
//             </div>
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="name">Name</Label>
//             <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="email">Email</Label>
//             <Input id="email" value={session?.user?.email || ""} disabled className="bg-muted" />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="bio">Bio</Label>
//             <Textarea
//               id="bio"
//               value={bio}
//               onChange={e => setBio(e.target.value)}
//               placeholder="Tell us a bit about yourself"
//               className="resize-none min-h-[100px]"
//             />
//           </div>
//         </CardContent>
//         <CardFooter className="flex flex-wrap items-center justify-start gap-4">
//           <SubmitButton
//             isLoading={isPending || isUploading}
//             variant="default"
//             loadingText={isUploading ? "Uploading..." : "Saving..."}>
//             Save changes
//           </SubmitButton>

//           <Button type="button" variant="outline" onClick={handleCancel} disabled={isPending || isUploading}>
//             Cancel
//           </Button>

//           {isSuccess && <p className="text-sm text-green-600">Profile updated successfully.</p>}
//         </CardFooter>
//       </form>
//     </Card>
//   );
// }
"use client";

import { useState, useEffect, useRef, startTransition, useActionState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Upload, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { updateUserProfile } from "@/actions/user";
import { firebaseError, isFirebaseError } from "@/utils/firebase-error";
import { uploadFile } from "@/utils/uploadFile";
import { validateFileSize } from "@/utils/validateFileSize";
import { SubmitButton } from "@/components/shared/SubmitButton";
import { UserProfileSkeleton } from "./UserProfileSkeleton";
import type { ProfileUpdateState, User } from "@/types/user";
import { UserAvatar } from "../shared/UserAvatar";

interface UnifiedProfileFormProps {
  id?: string;
  onCancel?: () => void;
  redirectAfterSuccess?: string;
  isAdmin?: boolean;
  isLoading?: boolean;
  user?: User | null;
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

  const [initialName, setInitialName] = useState("");
  const [initialBio, setInitialBio] = useState("");
  const [initialPhotoURL, setInitialPhotoURL] = useState<string | null>(null);

  const updateProcessedRef = useRef(false);

  const [state, formAction, isPending] = useActionState<ProfileUpdateState, FormData>(updateUserProfile, {
    success: false
  });

  useEffect(() => {
    if (status === "authenticated" && session?.user && !formReady) {
      setName(session.user.name || "");
      setBio(session.user.bio || "");
      setPhotoURL(session.user.image || null);

      setInitialName(session.user.name || "");
      setInitialBio(session.user.bio || "");
      setInitialPhotoURL(session.user.image || null);

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
        const message = typeof state.error === "string" ? state.error : firebaseError(state.error);
        toast.error(message);
      }
    }
  }, [state, router, updateSessionFn, redirectAfterSuccess]);

  const resetForm = () => {
    setName(initialName);
    setBio(initialBio);
    setPhotoURL(initialPhotoURL);
    setPhotoFile(null);
    setIsSuccess(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const error = validateFileSize(file, 2);
    if (error) {
      toast.error(error);
      return;
    }

    const reader = new FileReader();
    reader.onload = e => setPhotoURL(e.target?.result as string);
    reader.readAsDataURL(file);
    setPhotoFile(file);
  };

  const handleCancel = () => {
    if (!isPending && !isUploading) {
      const formChanged =
        name !== initialName || bio !== initialBio || (photoURL !== initialPhotoURL && photoURL !== null);

      if (formChanged) {
        if (!window.confirm("You have unsaved changes. Are you sure you want to discard them?")) {
          return;
        }
      }

      resetForm();
      toast.info("Changes discarded");

      if (onCancel) {
        onCancel();
      } else {
        router.push(isAdmin ? "/admin" : "/user");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("bio", bio);

      if (photoFile) {
        setIsUploading(true);
        const imageUrl = await uploadFile(photoFile, { prefix: "profile" });
        formData.append("imageUrl", imageUrl);
      }

      startTransition(() => {
        updateProcessedRef.current = false;
        formAction(formData);
      });
    } catch (error: unknown) {
      console.error("Profile update error:", error);
      const message =
        error instanceof Error && error.message.includes("File too large")
          ? "Image too large. Please upload a file under 2MB."
          : isFirebaseError(error)
          ? firebaseError(error)
          : error instanceof Error
          ? error.message
          : "Failed to update profile";

      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  if (status === "loading" || !formReady) {
    return <UserProfileSkeleton />;
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
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-20 w-20 p-1 rounded-full 
             ring-0 ring-offset-0 
             hover:ring-2 hover:ring-gray-400 
             focus:ring-2 focus:ring-gray-400 
             transition duration-200">
              <UserAvatar
                src={photoURL}
                name={session?.user?.name}
                email={session?.user?.email}
                className="h-full w-full"
              />
            </Button>

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
              {photoFile && <p className="text-sm text-muted-foreground">{photoFile.name}</p>}
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
          <SubmitButton
            isLoading={isPending || isUploading}
            variant="default"
            loadingText={isUploading ? "Uploading..." : "Saving..."}>
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
