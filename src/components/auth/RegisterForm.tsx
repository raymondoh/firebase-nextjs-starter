"use client";

import type React from "react";
import type { RegisterState } from "@/types/auth";

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
import { registerUser } from "@/actions/auth";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

export function RegisterForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Store form values in state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Add a ref to track if registration toast has been shown
  const registrationToastShown = useRef(false);
  // Add a ref to track if error toast has been shown
  const errorToastShown = useRef(false);
  // Add a ref to track if sign-in has been attempted
  const signInAttempted = useRef(false);

  // Set up useActionState for server-side validation and registration
  const [state, action, isPending] = useActionState<RegisterState, FormData>(registerUser, null);

  // Add a unique ID to help track component instances
  const componentId = useRef(`register-form-${Math.random().toString(36).substring(7)}`).current;

  // Add this near the top of the component, after the state declarations
  useEffect(() => {
    console.log(`[${componentId}] RegisterForm component mounted`);
    return () => {
      console.log(`[${componentId}] RegisterForm component unmounted`);
    };
  }, [componentId]);

  // Reset toast flags when component unmounts
  useEffect(() => {
    return () => {
      registrationToastShown.current = false;
      errorToastShown.current = false;
      signInAttempted.current = false;
    };
  }, []);

  // Handle form submission
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(`[${componentId}] Register form submitted`);

    // Client-side validation
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Reset toast flags
    registrationToastShown.current = false;
    errorToastShown.current = false;
    signInAttempted.current = false;
    console.log(
      `[${componentId}] Reset flags: registrationToastShown=${registrationToastShown.current}, errorToastShown=${errorToastShown.current}, signInAttempted=${signInAttempted.current}`
    );

    // Create FormData and append values
    const formData = new FormData();
    formData.append("name", name || email.split("@")[0]); // Use email username as fallback
    formData.append("email", email);
    formData.append("password", password);

    // Wrap action call in startTransition
    startTransition(() => {
      console.log(`[${componentId}] Starting registration action transition`);
      action(formData);
    });
  };

  // Enhance the existing useEffect for state changes
  useEffect(() => {
    console.log(`[${componentId}] Register state effect triggered:`, {
      state,
      isLoggingIn,
      registrationToastShown: registrationToastShown.current,
      errorToastShown: errorToastShown.current,
      signInAttempted: signInAttempted.current
    });

    if (state?.success && !registrationToastShown.current) {
      console.log(`[${componentId}] Registration successful!`);
      registrationToastShown.current = true;
      toast.success("Registration successful!", { id: "registration-success" });

      // Attempt to sign in after successful registration
      const handleSignIn = async () => {
        if (isLoggingIn || signInAttempted.current) {
          console.log(`[${componentId}] Already logging in or sign-in attempted, skipping duplicate login attempt`);
          return;
        }

        signInAttempted.current = true;
        setIsLoggingIn(true);
        try {
          console.log(`[${componentId}] Attempting automatic sign-in after registration`);
          toast.info("Logging you in...", { id: "login-attempt" });

          const signInResult = await signIn("credentials", {
            redirect: false,
            email,
            password
          });

          console.log(`[${componentId}] Sign-in result:`, signInResult);
          if (signInResult?.ok) {
            console.log(`[${componentId}] Automatic sign-in successful`);
            toast.success("You are now logged in!", { id: "login-success" });
            // Add a delay before redirecting
            setTimeout(() => {
              console.log(`[${componentId}] Redirecting to home page`);
              router.push("/");
            }, 500);
          } else {
            console.error(`[${componentId}] Automatic sign-in failed:`, signInResult?.error);
            toast.error("Automatic sign-in failed. Please try logging in manually.", { id: "login-error" });
            // Add a delay before redirecting
            setTimeout(() => {
              console.log(`[${componentId}] Redirecting to login page`);
              router.push("/login");
            }, 1500);
          }
        } catch (error) {
          console.error(`[${componentId}] Sign-in error:`, error);
          toast.error("Automatic sign-in failed. Please try logging in manually.", { id: "login-error" });
          // Add a delay before redirecting
          setTimeout(() => {
            console.log(`[${componentId}] Redirecting to login page after error`);
            router.push("/login");
          }, 1500);
        } finally {
          setIsLoggingIn(false);
        }
      };

      handleSignIn();
    } else if (state?.error && !errorToastShown.current) {
      console.log(`[${componentId}] Registration error:`, state.error);
      errorToastShown.current = true;
      toast.error(state.error, { id: "registration-error" });
    }
  }, [state, router, email, password, isLoggingIn, componentId]);

  return (
    <Card className={className} {...props}>
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription>Create a new account</CardDescription>
      </CardHeader>
      <CardContent>
        {state?.error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        <form id="register-form" onSubmit={handleSubmit} className="space-y-8">
          {/* Name field is optional but kept for future use */}
          <div className="space-y-2">
            <Label htmlFor="name">Name (Optional)</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

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
                placeholder="Confirm your password"
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
            <p className="text-sm text-muted-foreground">Re-enter your password to confirm.</p>
          </div>

          <Button type="submit" className="w-full" disabled={isPending || isLoggingIn}>
            {isPending ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : isLoggingIn ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Register"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center gap-4">
        <div className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Button variant="link" className="p-0 h-auto" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
