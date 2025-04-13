"use client";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export function VerificationSuccessForm() {
  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="max-w-md w-full">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Email Verified!</CardTitle>
          <CardDescription className="text-center">Your email has been successfully verified.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 text-center">
          <p>Thank you for verifying your email address. You can now log in to your account and access all features.</p>
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
