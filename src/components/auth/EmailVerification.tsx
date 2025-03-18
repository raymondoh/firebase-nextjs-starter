"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { sendVerificationEmail, isEmailVerified, refreshUserStatus } from "@/firebase/client/auth";
import { updateEmailVerificationStatus, checkEmailVerificationStatus } from "@/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Loader2, Mail } from "lucide-react";

interface EmailVerificationProps {
  userId?: string;
  email?: string;
  onVerified?: () => void;
  redirectTo?: string;
}

export function EmailVerification({ userId, email, onVerified, redirectTo }: EmailVerificationProps) {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const auth = getAuth();

  // Check verification status on load and when auth state changes
  useEffect(() => {
    const checkVerification = async () => {
      setLoading(true);
      setError(null);

      try {
        // First check if we have a client-side user
        const unsubscribe = onAuthStateChanged(auth, async user => {
          if (user) {
            // Refresh the user to get the latest emailVerified status
            await refreshUserStatus(user);

            // Check if email is verified client-side
            const isVerified = isEmailVerified(user);

            if (isVerified) {
              // If verified client-side, update server-side status
              if (userId) {
                await updateEmailVerificationStatus(userId);
              }
              setVerified(true);
              if (onVerified) onVerified();
              if (redirectTo) router.push(redirectTo);
            } else if (userId) {
              // Double-check with server if client says not verified
              const serverStatus = await checkEmailVerificationStatus(userId);
              if (serverStatus.isVerified) {
                setVerified(true);
                if (onVerified) onVerified();
                if (redirectTo) router.push(redirectTo);
              }
            }
          }
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (err) {
        console.error("Error checking verification:", err);
        setError("Failed to check email verification status");
        setLoading(false);
      }
    };

    checkVerification();
  }, [auth, userId, onVerified, redirectTo, router]);

  const handleSendVerification = async () => {
    setSending(true);
    setError(null);
    setSuccess(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("No user is currently signed in");
      }

      await sendVerificationEmail(user);
      setSuccess("Verification email sent successfully! Please check your inbox.");
    } catch (err: any) {
      console.error("Error sending verification email:", err);
      setError(err.message || "Failed to send verification email");
    } finally {
      setSending(false);
    }
  };

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
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <div className="text-sm">
          <p>
            We've sent a verification email to <span className="font-medium">{email || "your email address"}</span>.
          </p>
          <p className="mt-2">
            Please check your inbox and click the verification link to complete your registration. If you don't see the
            email, check your spam folder.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSendVerification} disabled={sending} className="w-full">
          {sending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Resend Verification Email"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
