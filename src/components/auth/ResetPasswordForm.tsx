"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LoaderCircle, CheckCircle, XCircle, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { auth } from "@/firebase/client";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";

// Import the server actions
import { updatePasswordHash, getUserIdByEmail } from "@/actions/auth/password-reset";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"verifying" | "ready" | "submitting" | "success" | "error">("verifying");
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [oobCode, setOobCode] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const mode = searchParams.get("mode");
    const code = searchParams.get("oobCode");

    // If this is a password reset link
    if (mode === "resetPassword" && code) {
      setOobCode(code);

      // Verify the password reset code
      const verifyCode = async () => {
        try {
          // This will throw an error if the code is invalid
          const email = await verifyPasswordResetCode(auth, code);
          setEmail(email);

          // Try to get the user ID from Firebase Auth using our server action
          try {
            const result = await getUserIdByEmail(email);
            if (result.success && result.userId) {
              setUserId(result.userId);
              console.log("Found user ID:", result.userId);
            }
          } catch (error) {
            console.error("Error getting user ID:", error);
            // Continue anyway, we'll try to update the password hash later
          }

          setStatus("ready");
        } catch (error: any) {
          console.error("Error verifying password reset code:", error);
          setStatus("error");
          setErrorMessage(error.message || "Invalid or expired password reset link");
        }
      };

      verifyCode();
    } else if (mode === "verifyEmail") {
      // Redirect to verify-email page if this is an email verification link
      router.push(`/verify-email?${searchParams.toString()}`);
    } else {
      setStatus("error");
      setErrorMessage("Invalid password reset link");
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Client-side validation
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setStatus("submitting");

    try {
      // Confirm the password reset in Firebase Auth
      await confirmPasswordReset(auth, oobCode, password);

      // Also update the password hash in Firestore if we have the user ID
      if (userId) {
        try {
          console.log("Updating password hash in Firestore for user:", userId);
          await updatePasswordHash(userId, password);
          console.log("Password hash updated successfully in Firestore");
        } catch (hashError) {
          console.error("Error updating password hash in Firestore:", hashError);
          // Continue anyway, the password was reset in Firebase Auth
        }
      } else if (email) {
        // If we don't have the user ID but we have the email, try to get the user ID again
        try {
          const result = await getUserIdByEmail(email);
          if (result.success && result.userId) {
            console.log("Got user ID on second attempt:", result.userId);
            await updatePasswordHash(result.userId, password);
            console.log("Password hash updated successfully in Firestore");
          }
        } catch (idError) {
          console.error("Error getting user ID on second attempt:", idError);
        }
      } else {
        console.warn("No user ID or email available, password hash in Firestore not updated");
      }

      setStatus("success");
      toast.success("Password reset successful! You can now log in with your new password.");

      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error: any) {
      console.error("Error resetting password:", error);
      setStatus("error");
      setErrorMessage(error.message || "Failed to reset password");
      toast.error(error.message || "Failed to reset password");
    }
  };

  // Show different content based on status
  if (status === "verifying") {
    return (
      <div className="container flex items-center justify-center min-h-screen py-12">
        <Card className="max-w-md w-full">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <LoaderCircle className="h-10 w-10 text-primary animate-spin" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Verifying Link...</CardTitle>
            <CardDescription className="text-center">Please wait while we verify your reset link.</CardDescription>
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
            <CardTitle className="text-2xl text-center">Password Reset Successful!</CardTitle>
            <CardDescription className="text-center">Your password has been reset successfully.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p>You can now log in with your new password.</p>
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
            <CardTitle className="text-2xl text-center">Reset Link Invalid</CardTitle>
            <CardDescription className="text-center">{errorMessage}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p>The password reset link may have expired or been used already.</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link href="/forgot-password">Request New Reset Link</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Ready or submitting state - show the password reset form
  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="max-w-md w-full">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <KeyRound className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Reset Your Password</CardTitle>
          <CardDescription className="text-center">Create a new password for {email}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Password must be at least 8 characters long.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={status === "submitting"}>
              {status === "submitting" ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
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
