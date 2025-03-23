"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
//import { useRouter } from "next/navigation";
import { Mail, ArrowRight, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { auth } from "@/firebase/client";
import { sendPasswordResetEmail } from "firebase/auth";
import { logPasswordResetActivity } from "@/actions/auth/password-reset"; // Renamed function

export function ForgotPasswordForm() {
  //const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    console.log(`[FORGOT_PASSWORD] Submitting forgot password form for email: ${email}`);

    try {
      // Define actionCodeSettings
      const actionCodeSettings = {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/auth-action`,
        handleCodeInApp: false
      };

      console.log(`[FORGOT_PASSWORD] Using action code settings:`, actionCodeSettings);
      console.log(`[FORGOT_PASSWORD] NEXT_PUBLIC_APP_URL:`, process.env.NEXT_PUBLIC_APP_URL);

      // Send password reset email using Firebase client SDK
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      console.log(`[FORGOT_PASSWORD] Password reset email sent successfully`);

      // Log the activity using a server action
      await logPasswordResetActivity(email);

      setIsSubmitted(true);
      toast.success("Password reset email sent. Please check your inbox.");
    } catch (err: any) {
      console.error("[FORGOT_PASSWORD] Error sending password reset email:", err);
      console.error("[FORGOT_PASSWORD] Error code:", err.code);
      console.error("[FORGOT_PASSWORD] Error message:", err.message);

      // Handle specific Firebase errors
      let errorMessage = "Failed to send password reset email. Please try again later.";
      if (err.code === "auth/user-not-found") {
        // For security, we still show success even if user is not found
        console.log("[FORGOT_PASSWORD] User not found, but showing success to prevent email enumeration");
        setIsSubmitted(true);
        toast.success("Password reset email sent. Please check your inbox.");
        return;
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      } else if (err.code === "auth/missing-email") {
        errorMessage = "Please enter your email address.";
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
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
              We&aposve sent you a password reset link. Please check your inbox and spam folder.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p>
              Click the reset link in the email to set a new password. If you don&apost see the email, check your spam
              folder.
            </p>
            <p className="text-sm text-muted-foreground">The reset link will expire in 1 hour.</p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button asChild className="w-full">
              <Link href="/login">
                Return to login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Didn&apost receive an email? Check your spam folder or{" "}
              <Button variant="link" className="p-0 h-auto" onClick={() => setIsSubmitted(false)}>
                try again
              </Button>
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="max-w-md w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Forgot Password</CardTitle>
          <CardDescription className="text-center">
            Enter your email address and we&aposll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-muted-foreground">
            Remember your password?{" "}
            <Button variant="link" className="p-0 h-auto" asChild>
              <Link href="/login">Back to login</Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
