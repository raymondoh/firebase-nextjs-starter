"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { sendPasswordResetEmail } from "@/actions/auth";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await sendPasswordResetEmail(email);

      if (result.success) {
        setIsSubmitted(true);
        toast.success("Password reset email sent. Please check your inbox.");
      } else {
        setError(result.error || "Failed to send password reset email. Please try again.");
        toast.error(result.error || "Failed to send password reset email. Please try again.");
      }
    } catch (err) {
      console.error("Error sending password reset email:", err);
      setError("An unexpected error occurred. Please try again.");
      toast.error("An unexpected error occurred. Please try again.");
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
              We've sent you a password reset link. Please check your inbox and spam folder.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p>
              Click the reset link in the email to set a new password. If you don't see the email, check your spam
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
              Didn't receive an email? Check your spam folder or{" "}
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
            Enter your email address and we'll send you a link to reset your password.
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
