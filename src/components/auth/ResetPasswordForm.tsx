"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { auth } from "@/firebase/client";
import { verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";
import { syncPasswordWithFirestore } from "@/actions/auth/password";
import type { ResetPasswordState } from "@/types/auth/password";
//import { WelcomeMessage } from "./WelcomeMessage";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [state, setState] = useState<ResetPasswordState>({ success: false });
  const [showSuccess, setShowSuccess] = useState(false);

  // Check if oobCode is present
  useEffect(() => {
    if (!oobCode) {
      toast.error("Invalid or expired password reset link");
    }
  }, [oobCode]);

  // Handle form submission result
  useEffect(() => {
    if (state) {
      if (state.success) {
        setShowSuccess(true);
        toast.success("Password reset successful");
      } else if (state.error) {
        toast.error(state.error);
      }
    }
  }, [state]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!oobCode) {
      setState({ success: false, error: "Invalid reset code" });
      return;
    }

    if (password !== confirmPassword) {
      setState({ success: false, error: "Passwords do not match" });
      return;
    }

    setIsPending(true);

    try {
      // Verify the code and get the email
      const email = await verifyPasswordResetCode(auth, oobCode);

      // Reset the password
      await confirmPasswordReset(auth, oobCode, password);

      // Sync with Firestore (server action)
      const result = await syncPasswordWithFirestore(email, password);

      if (result.success) {
        setState({ success: true });
      } else {
        setState({ success: false, error: result.error || "Failed to sync password" });
      }
    } catch (error: any) {
      console.error("Error resetting password:", error);
      let errorMessage = "Failed to reset password. Please try again.";

      if (error.code === "auth/expired-action-code") {
        errorMessage = "The password reset link has expired. Please request a new one.";
      } else if (error.code === "auth/invalid-action-code") {
        errorMessage = "The password reset link is invalid. Please request a new one.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "The password is too weak. Please choose a stronger password.";
      }

      setState({ success: false, error: errorMessage });
    } finally {
      setIsPending(false);
    }
  };

  if (showSuccess) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Password Reset Complete</CardTitle>
          <CardDescription>Your password has been successfully reset</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>You can now log in with your new password.</AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button className="w-full" onClick={() => router.push("/login")}>
            Go to Login
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (!oobCode) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Invalid Reset Link</CardTitle>
          <CardDescription>The password reset link is invalid or has expired</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Please request a new password reset link.</AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button variant="outline" className="w-full" onClick={() => router.push("/forgot-password")}>
            Request New Reset Link
          </Button>
          <Button variant="link" className="w-full" onClick={() => router.push("/login")}>
            Back to Login
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Reset Your Password</CardTitle>
        <CardDescription>Enter a new password for your account</CardDescription>
      </CardHeader>
      <CardContent>
        {state?.error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your new password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
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
            <p className="text-sm text-muted-foreground">
              Password must be 8-72 characters long and contain at least one uppercase letter, one lowercase letter, one
              number, and one special character.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your new password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
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

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting Password...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center gap-4">
        <div className="text-sm text-muted-foreground">
          Remember your password?{" "}
          <Button variant="link" className="p-0 h-auto" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
