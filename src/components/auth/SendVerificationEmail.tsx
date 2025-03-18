"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { sendVerificationEmail } from "@/firebase/client/auth";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

interface SendVerificationEmailProps {
  email: string;
  password: string;
  userId?: string;
}

export function SendVerificationEmail({ email, password, userId }: SendVerificationEmailProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const auth = getAuth();

  const handleSendVerification = async () => {
    setLoading(true);
    setError(null);

    try {
      // Sign in to get the user object
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Send verification email
      await sendVerificationEmail(user);
      setSuccess(true);

      // Redirect to verification page
      router.push(`/verify-email?email=${encodeURIComponent(email)}&userId=${user.uid}`);
    } catch (err: any) {
      console.error("Error sending verification email:", err);
      setError(err.message || "Failed to send verification email");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Verification email sent successfully! Redirecting...
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <p className="text-sm">To complete your registration, we need to verify your email address.</p>

      <Button onClick={handleSendVerification} disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending verification email...
          </>
        ) : (
          "Send Verification Email"
        )}
      </Button>
    </div>
  );
}
