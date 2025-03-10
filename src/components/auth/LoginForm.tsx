"use client";

import type React from "react";
import type { LoginState } from "@/types/auth";

import { useState, useEffect, startTransition, useRef } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LoaderCircle, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { loginUser } from "@/actions";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter();
  const { update } = useSession();
  const [showPassword, setShowPassword] = useState(false);
  const hasToastShown = useRef(false);
  const isRedirecting = useRef(false);

  // Store form values in state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Set up useActionState for server-side validation and login
  const [state, action, isPending] = useActionState<LoginState, FormData>(loginUser, null);

  // Add a unique ID to help track component instances
  const componentId = useRef(`login-form-${Math.random().toString(36).substring(7)}`).current;

  // Add this near the top of the component, after the state declarations
  useEffect(() => {
    console.log(`[${componentId}] LoginForm component mounted`);
    return () => {
      console.log(`[${componentId}] LoginForm component unmounted`);
    };
  }, [componentId]);

  // Handle form submission
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(`[${componentId}] Login form submitted`);

    // Create FormData and append values
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    // Reset the toast flag
    hasToastShown.current = false;
    isRedirecting.current = false;
    console.log(
      `[${componentId}] Reset flags: hasToastShown=${hasToastShown.current}, isRedirecting=${isRedirecting.current}`
    );

    // Wrap action call in startTransition
    startTransition(() => {
      console.log(`[${componentId}] Starting login action transition`);
      action(formData);
    });
  };

  // Enhance the existing useEffect for state changes
  useEffect(() => {
    console.log(`[${componentId}] Login state effect triggered`, {
      state,
      hasToastShown: hasToastShown.current,
      isRedirecting: isRedirecting.current,
      isPending
    });

    if (state?.success && !hasToastShown.current && !isRedirecting.current) {
      console.log(`[${componentId}] Login successful, showing toast`);
      hasToastShown.current = true;
      isRedirecting.current = true;

      toast.success("Login successful!", { id: "login-success" });

      // Update the session client-side
      update().then(() => {
        console.log(`[${componentId}] Session updated, redirecting`);
        // Redirect to dashboard after successful login
        setTimeout(() => {
          router.push("/");
        }, 500);
      });
    } else if (state?.message && !state.success && !hasToastShown.current) {
      console.log(`[${componentId}] Login failed, showing error toast`);
      hasToastShown.current = true;
      toast.error(state.message, { id: "login-error" });
    }
  }, [state, router, update]);

  return (
    <Card className={className} {...props}>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        {state?.message && !state.success && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}

        <form id="login-form" onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
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
            <div className="flex justify-between text-sm">
              <Link href="/forgot-password" className="text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isPending || isRedirecting.current}>
            {isPending ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : isRedirecting.current ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Redirecting...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center gap-4">
        <div className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Button variant="link" className="p-0 h-auto" asChild>
            <Link href="/register">Sign up</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
