// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { useActionState } from "react";
// import { loginUser } from "@/actions";
// import { signIn } from "next-auth/react";
// import { toast } from "sonner";

// // Update import
// import type { LoginState } from "@/types/auth";

// export function LoginForm() {
//   const router = useRouter();
//   const [showPassword, setShowPassword] = useState(false);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [state, action, isPending] = useActionState<LoginState, FormData>(loginUser, null);

//   // Handle form submission result
//   useEffect(() => {
//     if (state) {
//       console.log("Login state:", state); // Debug log

//       if (state.success) {
//         toast.success(state.message || "Login successful");

//         // Redirect to home page after successful login
//         setTimeout(() => {
//           window.location.href = "/";
//         }, 500);
//       } else if (state.error) {
//         toast.error(state.error);
//       } else if (state.message && !state.success) {
//         toast.error(state.message);
//       }
//     }
//   }, [state, router]);

//   const handleGoogleSignIn = async () => {
//     try {
//       const result = await signIn("google", { callbackUrl: "/" });
//       if (result?.error) {
//         toast.error("Failed to sign in with Google. Please try again");
//       }
//     } catch (error) {
//       console.error("Google sign-in error:", error);
//       toast.error("An unexpected error occurred during Google sign-in. Please try again later.");
//     }
//   };

//   // Get the error message from either error or message property
//   const errorMessage = state && !state.success ? state.error || state.message : null;

//   return (
//     <Card className="w-full max-w-md">
//       <CardHeader>
//         <CardTitle>Sign In</CardTitle>
//         <CardDescription>Enter your credentials to access your account</CardDescription>
//       </CardHeader>
//       <CardContent>
//         {errorMessage && (
//           <Alert variant="destructive" className="mb-4">
//             <AlertCircle className="h-4 w-4" />
//             <AlertDescription>{errorMessage}</AlertDescription>
//           </Alert>
//         )}

//         <form action={action} className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="email">Email</Label>
//             <Input
//               id="email"
//               name="email"
//               type="email"
//               placeholder="name@example.com"
//               required
//               value={email}
//               onChange={e => setEmail(e.target.value)}
//             />
//           </div>

//           <div className="space-y-2">
//             <div className="flex items-center justify-between">
//               <Label htmlFor="password">Password</Label>
//               <Button variant="link" className="p-0 h-auto" asChild>
//                 <Link href="/forgot-password">Forgot password?</Link>
//               </Button>
//             </div>
//             <div className="relative">
//               <Input
//                 id="password"
//                 name="password"
//                 type={showPassword ? "text" : "password"}
//                 placeholder="••••••••"
//                 required
//                 value={password}
//                 onChange={e => setPassword(e.target.value)}
//               />
//               <Button
//                 type="button"
//                 variant="ghost"
//                 size="sm"
//                 className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
//                 onClick={() => setShowPassword(!showPassword)}>
//                 {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//               </Button>
//             </div>
//           </div>

//           <Button type="submit" className="w-full" disabled={isPending}>
//             {isPending ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 Signing in...
//               </>
//             ) : (
//               "Sign In"
//             )}
//           </Button>
//         </form>

//         <div className="relative my-6">
//           <div className="absolute inset-0 flex items-center">
//             <span className="w-full border-t" />
//           </div>
//           <div className="relative flex justify-center text-xs uppercase">
//             <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
//           </div>
//         </div>

//         <Button variant="outline" type="button" className="w-full" onClick={handleGoogleSignIn}>
//           <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
//             <path
//               d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
//               fill="#4285F4"
//             />
//             <path
//               d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
//               fill="#34A853"
//             />
//             <path
//               d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
//               fill="#FBBC05"
//             />
//             <path
//               d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
//               fill="#EA4335"
//             />
//           </svg>
//           Sign in with Google
//         </Button>
//       </CardContent>
//       <CardFooter className="flex flex-col items-center gap-4">
//         <div className="text-sm text-muted-foreground">
//           Don't have an account?{" "}
//           <Button variant="link" className="p-0 h-auto" asChild>
//             <Link href="/register">Sign up</Link>
//           </Button>
//         </div>
//       </CardFooter>
//     </Card>
//   );
// }
"use client";

import type React from "react";
import type { LoginState } from "@/types/auth";

import { useState, useEffect, startTransition } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LoaderCircle, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { loginUser } from "@/actions/authActions";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter();
  const { update } = useSession();
  const [showPassword, setShowPassword] = useState(false);

  // Store form values in state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Set up useActionState for server-side validation and login
  const [state, action, isPending] = useActionState<LoginState, FormData>(loginUser, null);

  // Handle form submission
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Create FormData and append values
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    // Wrap action call in startTransition
    startTransition(() => {
      action(formData);
    });
  };

  // Handle successful login
  useEffect(() => {
    if (state?.success) {
      toast.success("Login successful!");

      // Update the session client-side
      update();

      // Redirect to dashboard after successful login
      setTimeout(() => {
        router.push("/");
      }, 500);
    } else if (state?.message && !state.success) {
      toast.error(state.message);
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

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
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
