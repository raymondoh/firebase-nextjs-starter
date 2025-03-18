"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface WelcomeMessageProps {
  username?: string;
  email?: string;
  onDismiss?: () => void;
}

export function WelcomeMessage({ username, email, onDismiss }: WelcomeMessageProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(true);

  const handleDismiss = () => {
    setVisible(false);
    if (onDismiss) onDismiss();
  };

  const handleGoToDashboard = () => {
    setVisible(false);
    router.push("/");
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Welcome to the App!</CardTitle>
          <CardDescription>Your account has been successfully created</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-2">
          <p className="font-medium">{username ? `Hello, ${username}!` : "Hello!"}</p>
          <p className="text-muted-foreground">
            {email ? `Your account (${email}) is now ready to use.` : "Your account is now ready to use."}
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            You can now access all features of the application. We're excited to have you on board!
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleDismiss}>
            Dismiss
          </Button>
          <Button onClick={handleGoToDashboard}>Go to Dashboard</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
