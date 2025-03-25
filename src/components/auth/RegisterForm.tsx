// "use client";

// import type React from "react";
// import type { RegisterState } from "@/types/auth";
// import { FirebaseError } from "firebase/app";
// import { useState, useEffect, startTransition, useRef } from "react";
// import { useActionState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { LoaderCircle, Eye, EyeOff, AlertCircle, Info } from "lucide-react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { toast } from "sonner";
// import { registerUser, loginUser } from "@/actions/auth";
// import { useSession } from "next-auth/react";
// import { auth } from "@/firebase/client";
// import { signInWithCustomToken, sendEmailVerification } from "firebase/auth";
// import { getVerificationSettings } from "@/firebase/client/auth";
// import { signInWithFirebase } from "@/actions/auth/firebase-auth";
// import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
// import { CloseButton } from "@/components";

// export function RegisterForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
//   const router = useRouter();
//   const { update } = useSession();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [isLoggingIn, setIsLoggingIn] = useState(false);
//   const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

//   const registrationToastShown = useRef(false);
//   const errorToastShown = useRef(false);
//   const signInAttempted = useRef(false);
//   const isRedirecting = useRef(false);
//   const verificationEmailSent = useRef(false);

//   const [state, action, isPending] = useActionState<RegisterState, FormData>(registerUser, null);
//   const [loginState, loginAction, isLoginPending] = useActionState(loginUser, null);

//   // const componentId = useRef(`register-form-${Math.random().toString(36).substring(7)}`).current;

//   useEffect(() => {
//     return () => {
//       registrationToastShown.current = false;
//       errorToastShown.current = false;
//       signInAttempted.current = false;
//       isRedirecting.current = false;
//       verificationEmailSent.current = false;
//     };
//   }, []);

//   const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
//     event.preventDefault();

//     if (password !== confirmPassword) {
//       toast.error("Passwords do not match");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("name", email.split("@")[0]);
//     formData.append("email", email);
//     formData.append("password", password);
//     formData.append("confirmPassword", confirmPassword);

//     startTransition(() => {
//       action(formData);
//     });
//   };

//   useEffect(() => {
//     if (state?.success && !registrationToastShown.current) {
//       registrationToastShown.current = true;
//       toast.success("Registration successful! Please verify your email.");

//       const handleSignInForVerification = async () => {
//         if (signInAttempted.current) return;

//         signInAttempted.current = true;
//         setIsLoggingIn(true);
//         try {
//           await new Promise(resolve => setTimeout(resolve, 3000));

//           const loginFormData = new FormData();
//           loginFormData.append("email", email);
//           loginFormData.append("password", password);
//           loginFormData.append("isRegistration", "true");
//           loginFormData.append("skipSession", "true");

//           if (state.role) loginFormData.append("role", state.role);
//           if (state.userId) loginFormData.append("id", state.userId);

//           const loginResult = await loginUser(null, loginFormData);

//           if (loginResult?.success && loginResult.customToken) {
//             const userCredential = await signInWithCustomToken(auth, loginResult.customToken);
//             const user = userCredential.user;

//             if (user && !verificationEmailSent.current) {
//               verificationEmailSent.current = true;

//               try {
//                 await sendEmailVerification(user, getVerificationSettings());
//                 toast.info("Verification email sent. Check your inbox.");
//                 setTimeout(() => router.push("/verify-email"), 1500);
//               } catch (error: unknown) {
//                 const err = error as FirebaseError;
//                 console.error("Email verification failed:", err.message);
//                 toast.error("Could not send verification email.");
//               }
//             }
//           } else {
//             toast.error("Could not complete registration.");
//           }
//         } catch (error: unknown) {
//           const err = error as FirebaseError;
//           console.error("Verification flow error:", err.message);
//           toast.error("An unexpected error occurred.");
//         } finally {
//           setIsLoggingIn(false);
//         }
//       };

//       handleSignInForVerification();
//     } else if (state?.error && !errorToastShown.current) {
//       errorToastShown.current = true;
//       toast.error(state.error);
//     }
//   }, [state, email, password, router]);

//   useEffect(() => {
//     if (verificationEmailSent.current) return;

//     if (loginState?.success && !isRedirecting.current) {
//       isRedirecting.current = true;

//       if (loginState.customToken) {
//         signInWithCustomToken(auth, loginState.customToken)
//           .then(async userCredential => {
//             const idToken = await userCredential.user.getIdToken();
//             const signInResult = await signInWithFirebase(idToken);
//             if (!signInResult.success) throw new Error("NextAuth sign-in failed");
//             toast.success("You're now logged in!");
//             await update();
//             router.push("/");
//           })
//           .catch((error: FirebaseError) => {
//             console.error("Token exchange failed:", error.message);
//             toast.error("Login failed, try again.");
//             isRedirecting.current = false;
//             router.push("/login");
//           });
//       } else {
//         update().then(() => router.push("/"));
//       }
//     } else if (loginState?.message && !loginState.success && !errorToastShown.current) {
//       errorToastShown.current = true;
//       toast.error(`Login failed: ${loginState.message}`);
//       router.push("/login");
//     }
//   }, [loginState, update, router]);

//   return (
//     <Card className={className} {...props}>
//       <div className="relative">
//         <CardHeader>
//           <div className="absolute right-2 top-2 z-10">
//             <CloseButton />
//           </div>
//           <CardTitle>Register</CardTitle>
//           <CardDescription>Create a new account</CardDescription>
//         </CardHeader>
//       </div>
//       <CardContent>
//         {state?.error && (
//           <Alert variant="destructive" className="mb-6">
//             <AlertCircle className="h-4 w-4" />
//             <AlertDescription>{state.error}</AlertDescription>
//           </Alert>
//         )}

//         <form id="register-form" onSubmit={handleSubmit} className="space-y-8">
//           <div className="space-y-2">
//             <Label htmlFor="email">Email</Label>
//             <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
//           </div>

//           <div className="space-y-2">
//             <div className="flex items-center gap-1">
//               <Label htmlFor="password">Password</Label>
//               <TooltipProvider>
//                 <Tooltip>
//                   <TooltipTrigger asChild>
//                     <Button variant="ghost" size="icon" className="h-5 w-5 p-0 text-muted-foreground">
//                       <Info className="h-4 w-4" />
//                     </Button>
//                   </TooltipTrigger>
//                   <TooltipContent className="max-w-xs p-4">
//                     <p className="text-sm">Must be 8–72 chars, 1 uppercase, 1 lowercase, 1 number, and 1 symbol.</p>
//                   </TooltipContent>
//                 </Tooltip>
//               </TooltipProvider>
//             </div>
//             <div className="relative">
//               <Input
//                 id="password"
//                 type={showPassword ? "text" : "password"}
//                 required
//                 value={password}
//                 onChange={e => setPassword(e.target.value)}
//               />
//               <Button
//                 type="button"
//                 variant="ghost"
//                 size="sm"
//                 className="absolute right-0 top-0 h-full px-3 py-2"
//                 onClick={() => setShowPassword(!showPassword)}>
//                 {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//               </Button>
//             </div>
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="confirmPassword">Confirm Password</Label>
//             <div className="relative">
//               <Input
//                 id="confirmPassword"
//                 type={showConfirmPassword ? "text" : "password"}
//                 required
//                 value={confirmPassword}
//                 onChange={e => setConfirmPassword(e.target.value)}
//               />
//               <Button
//                 type="button"
//                 variant="ghost"
//                 size="sm"
//                 className="absolute right-0 top-0 h-full px-3 py-2"
//                 onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
//                 {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//               </Button>
//             </div>
//             <p className="text-sm text-muted-foreground">Re-enter your password to confirm.</p>
//           </div>

//           <Button
//             type="submit"
//             className="w-full"
//             disabled={isPending || isLoggingIn || isLoginPending || isRedirecting.current || isGoogleSigningIn}>
//             {isPending || isLoggingIn || isLoginPending ? (
//               <>
//                 <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
//                 Preparing...
//               </>
//             ) : (
//               "Register"
//             )}
//           </Button>

//           <div className="mt-6">
//             <div className="relative">
//               <div className="absolute inset-0 flex items-center">
//                 <span className="w-full border-t" />
//               </div>
//               <div className="relative flex justify-center text-xs uppercase">
//                 <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
//               </div>
//             </div>
//             <GoogleAuthButton mode="signup" className="mt-4" />
//           </div>
//         </form>
//       </CardContent>
//       <CardFooter className="flex flex-col items-center gap-4">
//         <p className="text-sm text-muted-foreground">
//           Already have an account?{" "}
//           <Button variant="link" className="p-0 h-auto" asChild>
//             <Link href="/login">Sign in</Link>
//           </Button>
//         </p>
//       </CardFooter>
//     </Card>
//   );
// }
"use client";

import type React from "react";
import type { RegisterState } from "@/types/auth";
import { useState, useEffect, startTransition, useRef } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LoaderCircle, Eye, EyeOff, AlertCircle, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { registerUser, loginUser } from "@/actions/auth";
import { useSession } from "next-auth/react";
import { auth } from "@/firebase/client";
import { signInWithCustomToken, sendEmailVerification } from "firebase/auth";
import { getVerificationSettings } from "@/firebase/client/auth";
import { signInWithFirebase } from "@/actions/auth/firebase-auth";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { CloseButton } from "@/components";
import { firebaseError, isFirebaseError } from "@/utils/firebase-error";

export function RegisterForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter();
  const { update } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

  const registrationToastShown = useRef(false);
  const errorToastShown = useRef(false);
  const signInAttempted = useRef(false);
  const isRedirecting = useRef(false);
  const verificationEmailSent = useRef(false);

  const [state, action, isPending] = useActionState<RegisterState, FormData>(registerUser, null);
  const [loginState, loginAction, isLoginPending] = useActionState(loginUser, null);

  useEffect(() => {
    return () => {
      registrationToastShown.current = false;
      errorToastShown.current = false;
      signInAttempted.current = false;
      isRedirecting.current = false;
      verificationEmailSent.current = false;
    };
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const formData = new FormData();
    formData.append("name", email.split("@")[0]);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("confirmPassword", confirmPassword);

    startTransition(() => {
      action(formData);
    });
  };

  useEffect(() => {
    if (state?.success && !registrationToastShown.current) {
      registrationToastShown.current = true;
      toast.success("Registration successful! Please verify your email.");

      const handleSignInForVerification = async () => {
        if (signInAttempted.current) return;

        signInAttempted.current = true;
        setIsLoggingIn(true);
        try {
          await new Promise(resolve => setTimeout(resolve, 3000));

          const loginFormData = new FormData();
          loginFormData.append("email", email);
          loginFormData.append("password", password);
          loginFormData.append("isRegistration", "true");
          loginFormData.append("skipSession", "true");

          if (state.role) loginFormData.append("role", state.role);
          if (state.userId) loginFormData.append("id", state.userId);

          const loginResult = await loginUser(null, loginFormData);

          if (loginResult?.success && loginResult.customToken) {
            const userCredential = await signInWithCustomToken(auth, loginResult.customToken);
            const user = userCredential.user;

            if (user && !verificationEmailSent.current) {
              verificationEmailSent.current = true;

              try {
                await sendEmailVerification(user, getVerificationSettings());
                toast.info("Verification email sent. Check your inbox.");
                setTimeout(() => router.push("/verify-email"), 1500);
              } catch (error: unknown) {
                console.error("Email verification failed:", error);
                const msg = isFirebaseError(error) ? firebaseError(error) : "Could not send verification email.";
                toast.error(msg);
              }
            }
          } else {
            toast.error("Could not complete registration.");
          }
        } catch (error: unknown) {
          console.error("Verification flow error:", error);
          const msg = isFirebaseError(error) ? firebaseError(error) : "An unexpected error occurred.";
          toast.error(msg);
        } finally {
          setIsLoggingIn(false);
        }
      };

      handleSignInForVerification();
    } else if (state?.error && !errorToastShown.current) {
      errorToastShown.current = true;
      toast.error(state.error);
    }
  }, [state, email, password, router]);

  useEffect(() => {
    if (verificationEmailSent.current) return;

    if (loginState?.success && !isRedirecting.current) {
      isRedirecting.current = true;

      if (loginState.customToken) {
        signInWithCustomToken(auth, loginState.customToken)
          .then(async userCredential => {
            const idToken = await userCredential.user.getIdToken();
            const signInResult = await signInWithFirebase(idToken);
            if (!signInResult.success) throw new Error("NextAuth sign-in failed");
            toast.success("You're now logged in!");
            await update();
            router.push("/");
          })
          .catch((error: unknown) => {
            console.error("Token exchange failed:", error);
            const msg = isFirebaseError(error) ? firebaseError(error) : "Login failed. Please try again.";
            toast.error(msg);
            isRedirecting.current = false;
            router.push("/login");
          });
      } else {
        update().then(() => router.push("/"));
      }
    } else if (loginState?.message && !loginState.success && !errorToastShown.current) {
      errorToastShown.current = true;
      toast.error(`Login failed: ${loginState.message}`);
      router.push("/login");
    }
  }, [loginState, update, router]);

  return (
    <Card className={className} {...props}>
      <div className="relative">
        <CardHeader>
          <div className="absolute right-2 top-2 z-10">
            <CloseButton />
          </div>
          <CardTitle>Register</CardTitle>
          <CardDescription>Create a new account</CardDescription>
        </CardHeader>
      </div>
      <CardContent>
        {state?.error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        <form id="register-form" onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Label htmlFor="password">Password</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-5 w-5 p-0 text-muted-foreground">
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs p-4">
                    <p className="text-sm">Must be 8–72 chars, 1 uppercase, 1 lowercase, 1 number, and 1 symbol.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2"
                onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">Re-enter your password to confirm.</p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isPending || isLoggingIn || isLoginPending || isRedirecting.current || isGoogleSigningIn}>
            {isPending || isLoggingIn || isLoginPending ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Preparing...
              </>
            ) : (
              "Register"
            )}
          </Button>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            <GoogleAuthButton mode="signup" className="mt-4" />
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center gap-4">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Button variant="link" className="p-0 h-auto" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
}
