"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowRight, LoaderCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/firebase/client";
import { applyActionCode } from "firebase/auth";
import { updateEmailVerificationStatus } from "@/actions/auth/email-verification";
import { firebaseError, isFirebaseError } from "@/utils/firebase-error";

export function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"instructions" | "loading" | "success" | "error">("instructions");
  const [errorMessage, setErrorMessage] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);

  const verificationAttempted = useRef(false);
  const processedCode = useRef<string | null>(null);

  useEffect(() => {
    const mode = searchParams.get("mode");
    const oobCode = searchParams.get("oobCode");
    const continueUrl = searchParams.get("continueUrl") || "";

    if (verificationAttempted.current && processedCode.current === oobCode) return;

    if (mode === "verifyEmail" && oobCode) {
      processedCode.current = oobCode;
      verificationAttempted.current = true;
      setStatus("loading");

      let userId = "";
      try {
        if (continueUrl) {
          const url = new URL(continueUrl);
          userId = url.searchParams.get("uid") || "";
        }
      } catch (e) {
        console.error("Error parsing continueUrl:", e);
      }

      const verifyEmail = async () => {
        try {
          await applyActionCode(auth, oobCode);
          const user = auth.currentUser;

          if (user) {
            await user.reload();
            if (user.emailVerified) {
              try {
                await updateEmailVerificationStatus({ userId: user.uid, verified: true });
              } catch (firestoreError) {
                console.error("Error updating Firestore:", firestoreError);
              }
              setIsRedirecting(true);
              router.push("/verify-success");
            } else {
              setStatus("error");
              setErrorMessage("Email verification failed. Please try again.");
            }
          }
        } catch (error: unknown) {
          if (isFirebaseError(error)) {
            console.error("FirebaseError:", error.code, error.message);

            if (error.code === "auth/invalid-action-code") {
              const user = auth.currentUser;
              if (user) {
                try {
                  await user.reload();
                  if (user.emailVerified) {
                    await updateEmailVerificationStatus({ userId: user.uid, verified: true });

                    setIsRedirecting(true);
                    router.push("/verify-success");
                    return;
                  }
                } catch (reloadError) {
                  console.error("Error reloading user:", reloadError);
                }
              } else if (userId) {
                try {
                  await updateEmailVerificationStatus({ userId, verified: true });

                  setIsRedirecting(true);
                  router.push("/verify-success");
                  return;
                } catch (firestoreError) {
                  console.error("Error updating Firestore using userId:", firestoreError);
                }
              }

              setStatus("error");
              setErrorMessage(
                "This verification link has already been used. If you've already verified your email, you can log in to your account."
              );
            } else {
              setStatus("error");
              setErrorMessage(firebaseError(error));
            }
          } else {
            console.error("Unexpected error:", error);
            setStatus("error");
            setErrorMessage("An unexpected error occurred. Please try again.");
          }
        }
      };

      verifyEmail();
    }
  }, [searchParams, router]);

  if (isRedirecting) {
    return (
      <div className="container flex items-center justify-center min-h-screen py-12">
        <Card className="max-w-md w-full">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <LoaderCircle className="h-10 w-10 text-primary animate-spin" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Redirecting...</CardTitle>
            <CardDescription className="text-center">Please wait while we redirect you.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

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
            We&aposve sent you a verification email. Please check your inbox and spam folder.
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
