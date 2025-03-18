"use client";

import { useState, useEffect } from "react";
import { getAuth, signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

interface TriggerEmailVerificationProps {
  email: string;
  password: string;
  autoTrigger?: boolean;
}

export function TriggerEmailVerification({ email, password, autoTrigger = false }: TriggerEmailVerificationProps) {
  const [loading, setLoading] = useState(autoTrigger);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const auth = getAuth();

  // Automatically trigger verification email if autoTrigger is true
  useEffect(() => {
    if (autoTrigger) {
      sendVerificationEmailToUser();
    }
  }, [autoTrigger]);

  const sendVerificationEmailToUser = async () => {
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Signing in to send verification email...");
      // Sign in to get the user object
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log("Sending verification email...");
      // Send verification email
      await sendEmailVerification(user);
      console.log("Verification email sent successfully!");

      setSuccess(true);
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
          Verification email sent successfully! Please check your inbox.
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

      <Button onClick={sendVerificationEmailToUser} disabled={loading} className="w-full">
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
