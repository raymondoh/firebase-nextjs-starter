"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { isEmailVerified, refreshUserStatus } from "@/firebase/email-verification/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Loader2, Mail } from "lucide-react";

interface EmailVerificationStatusProps {
  email?: string;
  onVerified?: () => void;
  redirectTo?: string;
}

export function EmailVerificationStatus({ email, onVerified, redirectTo }: EmailVerificationStatusProps) {
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const router = useRouter();
  const auth = getAuth();

  // Check verification status on load and when auth state changes
  useEffect(() => {
    const checkVerification = async () => {
      setLoading(true);

      try {
        // First check if we have a client-side user
        const unsubscribe = onAuthStateChanged(auth, async user => {
          if (user) {
            // Refresh the user to get the latest emailVerified status
            await refreshUserStatus(user);

            // Check if email is verified client-side
            const isVerified = isEmailVerified(user);

            if (isVerified) {
              // If verified, update Firestore via API route
              try {
                await fetch("/api/email-verification", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                    userId: user.uid,
                    action: "update"
                  })
                });
              } catch (error) {
                console.error("Error updating verification status:", error);
              }

              setVerified(true);
              if (onVerified) onVerified();
              if (redirectTo) router.push(redirectTo);
            }
          }
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (err) {
        console.error("Error checking verification:", err);
        setLoading(false);
      }
    };

    checkVerification();
  }, [auth, onVerified, redirectTo, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (verified) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">Your email has been verified successfully!</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Verification Required
        </CardTitle>
        <CardDescription>Please verify your email address to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">
          We've sent a verification email to <span className="font-medium">{email || "your email address"}</span>.
        </p>
        <p className="mt-2 text-sm">
          Please check your inbox and click the verification link to complete your registration. If you don't see the
          email, check your spam folder.
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={() => window.location.reload()} className="w-full">
          I've Verified My Email
        </Button>
      </CardFooter>
    </Card>
  );
}
