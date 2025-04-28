"use client";

import React, { useState, useEffect, useRef, startTransition, useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "@/firebase/client/firebase-client-init";
import { loginUser } from "@/actions/auth";
import { signInWithNextAuth } from "@/firebase/client/next-auth";
import type { LoginState } from "@/types/auth";
import { GoogleAuthButton } from "@/components";
import { CloseButton } from "@/components";
import { isFirebaseError, firebaseError } from "@/utils/firebase-error";
import { SubmitButton } from "../shared/SubmitButton";

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter();
  const { update } = useSession();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formKey, setFormKey] = useState("0");

  const [state, action, isPending] = useActionState<LoginState, FormData>(loginUser, null, formKey);

  const loginErrorToastShown = useRef(false);
  const isRedirecting = useRef(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

  function resetForm() {
    setEmail("");
    setPassword("");
    loginErrorToastShown.current = false;
    isRedirecting.current = false;
    emailInputRef.current?.focus();
  }

  const handleInputChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
    };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("isRegistration", "false");
    startTransition(() => {
      action(formData);
    });
  };

  useEffect(() => {
    if (!state || loginErrorToastShown.current) return;

    if (state.success) {
      toast.success("Login successful!");
      loginErrorToastShown.current = true;
      isRedirecting.current = true;

      const handleRedirect = async () => {
        try {
          if (!navigator.onLine) throw new Error("You are offline");
          if (!auth || !state.data?.customToken) throw new Error("Missing auth or customToken");

          const userCredential = await signInWithCustomToken(auth, state.data.customToken);
          const idToken = await userCredential.user.getIdToken();
          const signInResult = await signInWithNextAuth({ idToken });

          if (!signInResult.success) throw new Error("NextAuth sign-in failed");

          await update();
          router.push("/");
        } catch (error) {
          console.error("[LOGIN] Error during redirect:", error);
          toast.error(isFirebaseError(error) ? firebaseError(error) : "An error occurred during login");
          loginErrorToastShown.current = false;
          isRedirecting.current = false;
        }
      };

      handleRedirect();
    } else if (state.error && !loginErrorToastShown.current) {
      loginErrorToastShown.current = true;
      toast.error(state.error || "Login failed.");
      resetForm(); // ✨ reset inputs on error
    }
  }, [state, router, update]);

  return (
    <Card className={className} {...props}>
      <div className="relative">
        <CardHeader>
          <div className="absolute right-2 top-2 z-10">
            <CloseButton />
          </div>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
      </div>
      <CardContent>
        {state?.error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        <form id="login-form" onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              ref={emailInputRef}
              value={email}
              onChange={handleInputChange(setEmail)}
              placeholder="Enter your email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={handleInputChange(setPassword)}
                placeholder="Enter your password"
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

          <SubmitButton
            isLoading={isPending || isRedirecting.current}
            loadingText={isRedirecting.current ? "Redirecting..." : "Logging in..."}
            className="w-full">
            Login
          </SubmitButton>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            <GoogleAuthButton mode="signin" className="mt-4" />
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center gap-4">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Button variant="link" className="p-0 h-auto" asChild>
            <Link href="/register">Sign up</Link>
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
}
