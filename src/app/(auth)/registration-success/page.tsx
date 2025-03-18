"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TriggerEmailVerification } from "@/components";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RegistrationSuccessPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Get email and password from URL params
    const emailParam = searchParams.get("email");
    const passwordParam = searchParams.get("password");

    if (emailParam) {
      setEmail(emailParam);
    }

    if (passwordParam) {
      setPassword(passwordParam);
    }
  }, [searchParams]);

  return (
    <div className="container max-w-md mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Registration Successful</CardTitle>
          <CardDescription>Please verify your email to complete your registration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {email && password ? (
            <TriggerEmailVerification email={email} password={password} autoTrigger={true} />
          ) : (
            <p className="text-sm text-red-500">Missing email or password information. Please try registering again.</p>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/")}>
            Go to Login
          </Button>
          <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
