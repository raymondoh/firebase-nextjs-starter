// "use client";

// import { useEffect, useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import Link from "next/link";
// import { Mail, ArrowRight, LoaderCircle, CheckCircle, XCircle } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { auth } from "@/firebase/client";
// import { applyActionCode } from "firebase/auth";
// import { updateEmailVerificationStatus } from "@/actions/auth/email-verification";

// export function VerifyEmailForm() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const [status, setStatus] = useState<"instructions" | "loading" | "success" | "error">("instructions");
//   const [errorMessage, setErrorMessage] = useState("");

//   // Check if this is a verification link
//   useEffect(() => {
//     const mode = searchParams.get("mode");
//     const oobCode = searchParams.get("oobCode");
//     const continueUrl = searchParams.get("continueUrl") || "";

//     // Try to extract user ID from the continue URL if present
//     let userId = "";
//     try {
//       if (continueUrl) {
//         const url = new URL(continueUrl);
//         userId = url.searchParams.get("uid") || "";
//       }
//     } catch (e) {
//       console.error("Error parsing continueUrl:", e);
//     }

//     // If this is a verification email link
//     if (mode === "verifyEmail" && oobCode) {
//       setStatus("loading");

//       const verifyEmail = async () => {
//         try {
//           // Apply the action code to verify the email
//           await applyActionCode(auth, oobCode);

//           // Get the current user
//           const user = auth.currentUser;

//           // If we have a user, use their UID, otherwise use the one from the URL
//           const userIdToUpdate = user?.uid || userId;

//           // If we have a user ID, update the Firestore record
//           if (userIdToUpdate) {
//             try {
//               // Call server action to update Firestore
//               await updateEmailVerificationStatus(userIdToUpdate, true);
//               console.log("Firestore emailVerified field updated successfully");
//             } catch (firestoreError) {
//               console.error("Error updating Firestore emailVerified field:", firestoreError);
//             }
//           }

//           setStatus("success");

//           // Redirect to success page after a short delay
//           setTimeout(() => {
//             router.push("/verify-success");
//           }, 2000);
//         } catch (error: any) {
//           console.error("Error verifying email:", error);

//           setStatus("error"); // Default to error state

//           // Provide a user-friendly error message
//           let friendlyMessage = "Failed to verify email. Please try again.";

//           switch (error.code) {
//             case "auth/invalid-action-code":
//               friendlyMessage = "This verification link has already been used or is invalid.";
//               // This could happen if the verification was already processed by the server
//               // Check if we can still update Firestore

//               // Try to get the current user
//               const user = auth.currentUser;

//               if (user) {
//                 try {
//                   // Reload user to get fresh data
//                   await user.reload();

//                   // If the user's email is already verified, consider this a success
//                   if (user.emailVerified) {
//                     console.log("User email already verified, updating Firestore");

//                     // Update Firestore
//                     if (user.uid) {
//                       try {
//                         await updateEmailVerificationStatus(user.uid, true);
//                         console.log("Firestore updated for already verified user");
//                       } catch (firestoreError) {
//                         console.error("Error updating Firestore for already verified user:", firestoreError);
//                       }
//                       // Continue with success flow
//                       setStatus("success");

//                       // Redirect to success page
//                       setTimeout(() => {
//                         router.push("/verify-success");
//                       }, 2000);

//                       return;
//                     }
//                   }
//                 } catch (reloadError) {
//                   console.error("Error reloading user:", reloadError);
//                 }
//               } else if (userId) {
//                 // If we have a userId from the URL but no current user,
//                 // we can still try to update Firestore
//                 try {
//                   await updateEmailVerificationStatus(userId, true);
//                   console.log("Firestore updated using userId from URL");

//                   // Continue with success flow
//                   setStatus("success");

//                   // Redirect to success page
//                   setTimeout(() => {
//                     router.push("/verify-success");
//                   }, 2000);

//                   return;
//                 } catch (firestoreError) {
//                   console.error("Error updating Firestore using userId from URL:", firestoreError);
//                 }
//               }
//               break;
//             case "auth/expired-action-code":
//               friendlyMessage = "This verification link has expired. Please request a new one.";
//               break;
//             // Handle other Firebase Auth error codes as needed
//             default:
//               // Log the full error to the console for debugging
//               console.error("Unhandled error during verification:", error);
//           }

//           setErrorMessage(friendlyMessage);
//         }
//       };

//       verifyEmail();
//     }
//   }, [searchParams, router]);

//   // Rest of your component remains the same...
//   // (Include the UI rendering code based on status)

//   // Show different content based on status
//   if (status === "loading") {
//     return (
//       <div className="container flex items-center justify-center min-h-screen py-12">
//         <Card className="max-w-md w-full">
//           <CardHeader className="space-y-1">
//             <div className="flex justify-center mb-4">
//               <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
//                 <LoaderCircle className="h-10 w-10 text-primary animate-spin" />
//               </div>
//             </div>
//             <CardTitle className="text-2xl text-center">Verifying Email...</CardTitle>
//             <CardDescription className="text-center">Please wait while we verify your email address.</CardDescription>
//           </CardHeader>
//         </Card>
//       </div>
//     );
//   }

//   if (status === "success") {
//     return (
//       <div className="container flex items-center justify-center min-h-screen py-12">
//         <Card className="max-w-md w-full">
//           <CardHeader className="space-y-1">
//             <div className="flex justify-center mb-4">
//               <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
//                 <CheckCircle className="h-10 w-10 text-green-600" />
//               </div>
//             </div>
//             <CardTitle className="text-2xl text-center">Email Verified!</CardTitle>
//             <CardDescription className="text-center">Your email has been successfully verified.</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4 text-center">
//             <p>
//               Thank you for verifying your email address. You can now log in to your account and access all features.
//             </p>
//           </CardContent>
//           <CardFooter className="flex justify-center">
//             <Button asChild>
//               <Link href="/login">Continue to Login</Link>
//             </Button>
//           </CardFooter>
//         </Card>
//       </div>
//     );
//   }

//   if (status === "error") {
//     return (
//       <div className="container flex items-center justify-center min-h-screen py-12">
//         <Card className="max-w-md w-full">
//           <CardHeader className="space-y-1">
//             <div className="flex justify-center mb-4">
//               <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
//                 <XCircle className="h-10 w-10 text-red-600" />
//               </div>
//             </div>
//             <CardTitle className="text-2xl text-center">Verification Failed</CardTitle>
//             <CardDescription className="text-center">{errorMessage}</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4 text-center">
//             <p>There was a problem verifying your email. The link may have expired or been used already.</p>
//           </CardContent>
//           <CardFooter className="flex justify-center">
//             <Button asChild>
//               <Link href="/resend-verification">Resend Verification Email</Link>
//             </Button>
//           </CardFooter>
//         </Card>
//       </div>
//     );
//   }

//   // Default: show instructions
//   return (
//     <div className="container flex items-center justify-center min-h-screen py-12">
//       <Card className="max-w-md w-full">
//         <CardHeader className="space-y-1">
//           <div className="flex justify-center mb-4">
//             <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
//               <Mail className="h-10 w-10 text-primary" />
//             </div>
//           </div>
//           <CardTitle className="text-2xl text-center">Check your email</CardTitle>
//           <CardDescription className="text-center">
//             We've sent you a verification email. Please check your inbox and spam folder.
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4 text-center">
//           <p>
//             Click the verification link in the email to activate your account. If you don't see the email, check your
//             spam folder.
//           </p>
//           <p className="text-sm text-muted-foreground">The verification link will expire in 24 hours.</p>
//         </CardContent>
//         <CardFooter className="flex flex-col space-y-4">
//           <Button asChild className="w-full">
//             <Link href="/login">
//               Continue to login
//               <ArrowRight className="ml-2 h-4 w-4" />
//             </Link>
//           </Button>
//           <p className="text-xs text-center text-muted-foreground">
//             Didn't receive an email? Check your spam folder or{" "}
//             <Link href="/resend-verification" className="underline underline-offset-4 hover:text-primary">
//               try resending the verification email
//             </Link>
//           </p>
//         </CardFooter>
//       </Card>
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowRight, LoaderCircle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/firebase/client";
import { applyActionCode } from "firebase/auth";

async function updateEmailVerificationStatus(userId: string, isVerified: boolean) {
  // Placeholder for Firestore update logic
  // Replace with your actual Firestore update code
  console.log(`Updating Firestore for user ${userId} to emailVerified: ${isVerified}`);
  return new Promise(resolve => setTimeout(resolve, 500)); // Simulate async operation
}

export function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"instructions" | "loading" | "success" | "error">("instructions");
  const [errorMessage, setErrorMessage] = useState("");

  // Check if this is a verification link
  useEffect(() => {
    const mode = searchParams.get("mode");
    const oobCode = searchParams.get("oobCode");
    const continueUrl = searchParams.get("continueUrl") || "";

    // Try to extract user ID from the continue URL if present
    let userId = "";
    try {
      if (continueUrl) {
        const url = new URL(continueUrl);
        userId = url.searchParams.get("uid") || "";
      }
    } catch (e) {
      console.error("Error parsing continueUrl:", e);
    }

    // If this is a verification email link
    if (mode === "verifyEmail" && oobCode) {
      setStatus("loading");

      const verifyEmail = async () => {
        try {
          // 1. Try to verify email on client-side
          await applyActionCode(auth, oobCode);

          // If successful, proceed with normal flow
          const user = auth.currentUser;
          if (user) {
            await user.reload();
            if (user.emailVerified) {
              try {
                await updateEmailVerificationStatus(user.uid, true);
                console.log("Firestore emailVerified field updated successfully");
              } catch (firestoreError) {
                console.error("Error updating Firestore:", firestoreError);
              }

              setStatus("success");
              setTimeout(() => {
                router.push("/verify-success");
              }, 2000);
            } else {
              setStatus("error");
              setErrorMessage("Email verification failed. Please try again.");
            }
          }
        } catch (error: any) {
          console.error("Error verifying email:", error);

          // CRITICAL PART: Check if this is an invalid action code error
          if (error.code === "auth/invalid-action-code") {
            // The code might be invalid because it was already used by the server
            // Check if the user is already verified
            const user = auth.currentUser;

            if (user) {
              try {
                // Reload user to get fresh data
                await user.reload();

                // If the user's email is already verified, consider this a success
                if (user.emailVerified) {
                  console.log("User email already verified, updating Firestore");

                  // Update Firestore
                  try {
                    await updateEmailVerificationStatus(user.uid, true);
                    console.log("Firestore updated for already verified user");
                  } catch (firestoreError) {
                    console.error("Error updating Firestore:", firestoreError);
                  }

                  // Continue with success flow
                  setStatus("success");
                  setTimeout(() => {
                    router.push("/verify-success");
                  }, 2000);

                  return; // Exit early
                }
              } catch (reloadError) {
                console.error("Error reloading user:", reloadError);
              }
            } else if (userId) {
              // If we have a userId from the URL but no current user,
              // we can still try to update Firestore
              try {
                await updateEmailVerificationStatus(userId, true);
                console.log("Firestore updated using userId from URL");

                // Continue with success flow
                setStatus("success");

                // Redirect to success page
                setTimeout(() => {
                  router.push("/verify-success");
                }, 2000);

                return;
              } catch (firestoreError) {
                console.error("Error updating Firestore using userId from URL:", firestoreError);
              }
            }
          }

          // If we get here, we couldn't recover from the error
          setStatus("error");
          let friendlyMessage = "Email verification failed. Please try again.";

          if (error.code === "auth/invalid-action-code") {
            friendlyMessage = "This verification link has already been used or is invalid.";
          } else if (error.code === "auth/expired-action-code") {
            friendlyMessage = "This verification link has expired. Please request a new one.";
          }
          setErrorMessage(friendlyMessage);
        }
      };

      verifyEmail();
    }
  }, [searchParams, router]);

  // Show different content based on status
  if (status === "loading") {
    return (
      <div className="container flex items-center justify-center min-h-screen py-12">
        <Card className="max-w-md w-full">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <LoaderCircle className="h-10 w-10 text-primary animate-spin" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Verifying Email...</CardTitle>
            <CardDescription className="text-center">Please wait while we verify your email address.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="container flex items-center justify-center min-h-screen py-12">
        <Card className="max-w-md w-full">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Email Verified!</CardTitle>
            <CardDescription className="text-center">Your email has been successfully verified.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p>
              Thank you for verifying your email address. You can now log in to your account and access all features.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link href="/login">Continue to Login</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="container flex items-center justify-center min-h-screen py-12">
        <Card className="max-w-md w-full">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Verification Failed</CardTitle>
            <CardDescription className="text-center">{errorMessage}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p>There was a problem verifying your email. The link may have expired or been used already.</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link href="/auth/verify-email">Resend Verification Email</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Default: show instructions
  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="max-w-md w-full">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Check your email</CardTitle>
          <CardDescription className="text-center">
            We&apos;ve sent you a verification email. Please check your inbox and spam folder.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p>
            Click the verification link in the email to activate your account. If you don&apos;t see the email, check
            your spam folder.
          </p>
          <p className="text-sm text-muted-foreground">The verification link will expire in 24 hours.</p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button asChild className="w-full">
            <Link href="/login">
              Continue to login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Didn&apos;t receive an email? Check your spam folder or{" "}
            <Link href="/auth/verify-email" className="underline underline-offset-4 hover:text-primary">
              try resending the verification email
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
