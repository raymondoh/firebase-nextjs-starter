"use client";

import React, { useActionState, useState, useEffect, startTransition, useRef } from "react";
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
import { auth } from "@/firebase/client";
import { loginUser, signInWithFirebase } from "@/actions/auth";
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formKey, setFormKey] = useState("0");

  const [state, action, isPending] = useActionState<LoginState, FormData>(loginUser, null, formKey);

  const hasToastShown = useRef(false);
  const isRedirecting = useRef(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

  const componentId = useRef(`login-form-${Math.random().toString(36).substring(7)}`).current;

  useEffect(() => {
    console.log(`[${componentId}] LoginForm mounted`);
    return () => console.log(`[${componentId}] LoginForm unmounted`);
  }, [componentId]);

  const handleInputChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      setErrorMessage(null);
      hasToastShown.current = false;
      isRedirecting.current = false;
      setFormKey(prev => `${parseInt(prev) + 1}`);
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
    if (state?.success && !hasToastShown.current && !isRedirecting.current) {
      setErrorMessage(null);
      hasToastShown.current = true;
      isRedirecting.current = true;

      toast.success("Login successful!");

      if (state.data?.customToken) {
        signInWithCustomToken(auth, state.data.customToken)
          .then(async userCredential => {
            const idToken = await userCredential.user.getIdToken();
            const signInResult = await signInWithFirebase({ idToken });

            if (!signInResult.success) throw new Error("Failed to sign in with NextAuth");

            await update();
            router.push("/");
          })
          .catch((error: unknown) => {
            console.error(`[${componentId}] Error exchanging token:`, error);

            if (isFirebaseError(error)) {
              toast.error(firebaseError(error));
            } else {
              toast.error("An error occurred during login. Please try again.");
            }

            hasToastShown.current = false;
            isRedirecting.current = false;
          });
      } else {
        update().then(() => {
          setTimeout(() => router.push("/"), 500);
        });
      }
    } else if (state?.message && !state.success && !hasToastShown.current) {
      setErrorMessage(state.message);
      hasToastShown.current = true;
      toast.error(state.message);
    }
  }, [state, router, update, componentId]);
  // for testing
  useEffect(() => {
    console.log("LoginForm state:", state);
  }, [state]);
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
        {errorMessage && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
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

          {/* <Button type="submit" className="w-full" disabled={isPending || isRedirecting.current || isGoogleSigningIn}>
            {isPending || isRedirecting.current ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                {isRedirecting.current ? "Redirecting..." : "Logging in..."}
              </>
            ) : (
              "Login"
            )}
          </Button> */}
          <SubmitButton
            isLoading={isPending || isRedirecting.current || isGoogleSigningIn}
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
        <div className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Button variant="link" className="p-0 h-auto" asChild>
            <Link href="/register">Sign up</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
