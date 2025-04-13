"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowRight, LoaderCircle, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

import { auth } from "@/firebase/client/firebase-client-init";
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
      verificationAttempted.current = true;
      processedCode.current = oobCode;
      setStatus("loading");

      let userIdFromContinueUrl = "";
      try {
        const url = new URL(continueUrl);
        userIdFromContinueUrl = url.searchParams.get("uid") || "";
      } catch (e) {
        console.error("Invalid continueUrl format:", e);
      }

      const verifyEmail = async () => {
        try {
          await applyActionCode(auth, oobCode);
          const user = auth.currentUser;

          if (user) {
            await user.reload();
            if (user.emailVerified) {
              await updateEmailVerificationStatus({ userId: user.uid, verified: true });
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

              try {
                await user?.reload();
              } catch (reloadError) {
                console.error("Reload error:", reloadError);
              }

              if (user?.emailVerified) {
                await updateEmailVerificationStatus({ userId: user.uid, verified: true });
                setIsRedirecting(true);
                router.push("/verify-success");
                return;
              }

              if (userIdFromContinueUrl) {
                try {
                  await updateEmailVerificationStatus({ userId: userIdFromContinueUrl, verified: true });
                  setIsRedirecting(true);
                  router.push("/verify-success");
                  return;
                } catch (firestoreError) {
                  console.error("Firestore update fallback failed:", firestoreError);
                }
              }

              setStatus("error");
              setErrorMessage(
                "This verification link has already been used. If you've already verified your email, you can log in."
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
      <CenteredCard
        icon={<LoaderCircle className="h-10 w-10 text-primary animate-spin" />}
        title="Redirecting..."
        description="Please wait while we redirect you."
      />
    );
  }

  if (status === "loading") {
    return (
      <CenteredCard
        icon={<LoaderCircle className="h-10 w-10 text-primary animate-spin" />}
        title="Verifying Email..."
        description="Please wait while we verify your email address."
      />
    );
  }

  if (status === "error") {
    return (
      <CenteredCard
        icon={<XCircle className="h-10 w-10 text-red-600" />}
        title="Verification Failed"
        description={errorMessage}
        footer={
          <Button asChild>
            <Link href="/verify-email">Resend Verification Email</Link>
          </Button>
        }
      />
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
            Didn&apos;t receive an email?{" "}
            <Link href="/verify-email" className="underline underline-offset-4 hover:text-primary">
              Try resending it
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

function CenteredCard({
  icon,
  title,
  description,
  footer
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  footer?: React.ReactNode;
}) {
  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="max-w-md w-full">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">{icon}</div>
          </div>
          <CardTitle className="text-2xl text-center">{title}</CardTitle>
          <CardDescription className="text-center">{description}</CardDescription>
        </CardHeader>
        {footer && <CardFooter className="flex justify-center">{footer}</CardFooter>}
      </Card>
    </div>
  );
}
