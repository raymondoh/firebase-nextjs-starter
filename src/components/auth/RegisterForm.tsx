// "use client";

// import type React from "react";
// import type { RegisterState } from "@/types/auth";

// import { useState, useEffect, startTransition, useRef } from "react";
// import { useActionState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { LoaderCircle, Eye, EyeOff, AlertCircle, Info } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { registerUser, loginUser } from "@/actions/auth"; // Import loginUser
// import { useSession } from "next-auth/react"; // Add signIn import
// import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
// import { toast } from "sonner";
// import { auth } from "@/firebase/client";
// import { signInWithCustomToken, sendEmailVerification } from "firebase/auth";
// import { signInWithFirebase } from "@/actions/auth/firebase-auth";
// // Add this import at the top of the file
// import { getVerificationSettings } from "@/firebase/client/auth";
// import { CloseButton } from "@/components";

// export function RegisterForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
//   const router = useRouter();
//   const { update } = useSession(); // Add this to get the session update function
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false); // Add state for Google sign-in

//   // Store form values in state
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [isLoggingIn, setIsLoggingIn] = useState(false);

//   // Add a ref to track if registration toast has been shown
//   const registrationToastShown = useRef(false);
//   // Add a ref to track if error toast has been shown
//   const errorToastShown = useRef(false);
//   // Add a ref to track if sign-in has been attempted
//   const signInAttempted = useRef(false);
//   // Add a ref to track if redirecting
//   const isRedirecting = useRef(false);
//   // Add a ref to track if verification email has been sent
//   const verificationEmailSent = useRef(false);

//   // Set up useActionState for server-side validation and registration
//   const [state, action, isPending] = useActionState<RegisterState, FormData>(registerUser, null);
//   // Set up useActionState for login
//   const [loginState, loginAction, isLoginPending] = useActionState(loginUser, null);

//   // Add a unique ID to help track component instances
//   const componentId = useRef(`register-form-${Math.random().toString(36).substring(7)}`).current;

//   // Add this near the top of the component, after the state declarations
//   useEffect(() => {
//     console.log(`[${componentId}] RegisterForm component mounted`);
//     return () => {
//       console.log(`[${componentId}] RegisterForm component unmounted`);
//     };
//   }, [componentId]);

//   // Reset toast flags when component unmounts
//   useEffect(() => {
//     return () => {
//       registrationToastShown.current = false;
//       errorToastShown.current = false;
//       signInAttempted.current = false;
//       isRedirecting.current = false;
//       verificationEmailSent.current = false;
//     };
//   }, []);

//   // Add more detailed logging to the form submission handler
//   const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     console.log(`[${componentId}] Register form submitted`);

//     // Client-side validation
//     if (password !== confirmPassword) {
//       toast.error("Passwords do not match");
//       return;
//     }

//     console.log(`[${componentId}] Form values before submission:`, {
//       email,
//       password,
//       confirmPassword
//     });

//     // Reset toast flags
//     registrationToastShown.current = false;
//     errorToastShown.current = false;
//     signInAttempted.current = false;
//     isRedirecting.current = false;
//     verificationEmailSent.current = false;
//     console.log(
//       `[${componentId}] Reset flags: registrationToastShown=${registrationToastShown.current}, errorToastShown=${errorToastShown.current}, signInAttempted=${signInAttempted.current}`
//     );

//     // Create FormData and append values
//     const formData = new FormData();
//     formData.append("name", email.split("@")[0]); // Use email username as name
//     formData.append("email", email);
//     formData.append("password", password);
//     formData.append("confirmPassword", confirmPassword || ""); // Ensure it's never null

//     console.log(`[${componentId}] FormData created with:`, {
//       name: email.split("@")[0],
//       email,
//       passwordLength: password ? password.length : 0,
//       confirmPasswordLength: confirmPassword ? confirmPassword.length : 0
//     });

//     // Wrap action call in startTransition
//     startTransition(() => {
//       console.log(`[${componentId}] Starting registration action transition`);
//       action(formData);
//     });
//   };

//   // Enhance the existing useEffect for state changes
//   useEffect(() => {
//     console.log(`[${componentId}] Register state effect triggered:`, {
//       state,
//       isLoggingIn,
//       registrationToastShown: registrationToastShown.current,
//       errorToastShown: errorToastShown.current,
//       signInAttempted: signInAttempted.current,
//       verificationEmailSent: verificationEmailSent.current
//     });

//     if (state?.success && !registrationToastShown.current) {
//       console.log(`[${componentId}] Registration successful!`, state);
//       registrationToastShown.current = true;
//       toast.success("Registration successful! Please verify your email.", { id: "registration-success" });

//       // Check if we have a userId from the registration response
//       if (state.userId) {
//         console.log(`[${componentId}] User ID from registration:`, state.userId);
//       } else {
//         console.warn(`[${componentId}] No user ID returned from registration`);
//       }

//       // We need to sign in first to get the currentUser
//       const handleSignInForVerification = async () => {
//         if (signInAttempted.current) {
//           console.log(`[${componentId}] Sign-in already attempted, skipping duplicate login attempt`);
//           return;
//         }

//         signInAttempted.current = true;
//         setIsLoggingIn(true);
//         try {
//           console.log(`[${componentId}] Waiting for Firebase to propagate the new account...`);
//           toast.info("Preparing your account...", { id: "account-preparation" });

//           // Increase the delay to allow Firebase to propagate the new account
//           const delayTime = 3000; // 3 seconds
//           console.log(`[${componentId}] Waiting ${delayTime / 1000} seconds before login attempt`);
//           await new Promise(resolve => setTimeout(resolve, delayTime));

//           console.log(`[${componentId}] Attempting sign-in to send verification email`);

//           // Create login form data
//           const loginFormData = new FormData();
//           loginFormData.append("email", email);
//           loginFormData.append("password", password);
//           loginFormData.append("isRegistration", "true");
//           loginFormData.append("skipSession", "true"); // Skip creating a session

//           // Add the role from the registration response
//           if (state.role) {
//             console.log(`[${componentId}] Adding role to login form data:`, state.role);
//             loginFormData.append("role", state.role);
//           }

//           // Add the user ID from the registration response
//           if (state.userId) {
//             console.log(`[${componentId}] Adding user ID to login form data:`, state.userId);
//             loginFormData.append("id", state.userId);
//           }

//           // Use the loginUser server action
//           const loginResult = await loginUser(null, loginFormData);

//           if (loginResult.success && loginResult.customToken) {
//             console.log(`[${componentId}] Custom token received, signing in to Firebase`);

//             // Sign in with the custom token
//             const userCredential = await signInWithCustomToken(auth, loginResult.customToken);
//             const user = userCredential.user;

//             if (user && !verificationEmailSent.current) {
//               verificationEmailSent.current = true;
//               console.log(`[${componentId}] Sending verification email to: ${email}`);

//               try {
//                 await sendEmailVerification(user, getVerificationSettings());
//                 console.log(`[${componentId}] Verification email sent successfully`);
//                 toast.info("Verification email sent. Check your inbox and spam folder.", {
//                   id: "verification-email-sent"
//                 });

//                 // Redirect to verification page
//                 setTimeout(() => {
//                   router.push("/verify-email");
//                 }, 1500);
//               } catch (error) {
//                 console.error(`[${componentId}] Error sending verification email:`, error);
//                 toast.error("Could not send verification email. Please try again later.", {
//                   id: "verification-error"
//                 });
//               }
//             } else {
//               console.error(`[${componentId}] No user found after sign-in or email already sent`);
//               if (!user) {
//                 toast.error("Something went wrong. Please try registering again.", {
//                   id: "no-user-error"
//                 });
//               }
//             }
//           } else {
//             console.error(`[${componentId}] Failed to sign in to send verification email:`, loginResult);
//             toast.error("Could not complete registration. Please try again.", {
//               id: "login-for-verification-error"
//             });
//           }
//         } catch (error) {
//           console.error(`[${componentId}] Error in verification flow:`, error);
//           setIsLoggingIn(false);
//           toast.error("Failed to complete registration. Please try again.", {
//             id: "verification-flow-error"
//           });
//         } finally {
//           setIsLoggingIn(false);
//         }
//       };

//       // Execute the verification flow
//       handleSignInForVerification();

//       // Return early to prevent the original sign-in flow
//       return;
//     } else if (state?.error && !errorToastShown.current) {
//       console.log(`[${componentId}] Registration error:`, state.error);
//       errorToastShown.current = true;
//       toast.error(state.error, { id: "registration-error" });
//     }
//   }, [state, router, email, password, isLoggingIn, componentId, loginAction]);

//   // Add effect for login state changes (this will only run for normal login, not verification)
//   useEffect(() => {
//     // Skip this effect if we're in the verification flow
//     if (verificationEmailSent.current) {
//       return;
//     }

//     console.log(`[${componentId}] Login state effect triggered:`, {
//       loginState,
//       isRedirecting: isRedirecting.current
//     });

//     if (loginState?.success && !isRedirecting.current) {
//       console.log(`[${componentId}] Login successful!`);
//       isRedirecting.current = true;

//       // Check if we have a custom token
//       if (loginState.customToken) {
//         console.log(`[${componentId}] Custom token received, exchanging for ID token`);

//         // Exchange the custom token for an ID token
//         signInWithCustomToken(auth, loginState.customToken)
//           .then(async userCredential => {
//             console.log(`[${componentId}] Custom token exchanged successfully`);

//             // Get the ID token
//             const idToken = await userCredential.user.getIdToken();
//             console.log(`[${componentId}] ID token obtained, signing in with NextAuth`);

//             // Sign in with NextAuth using the ID token
//             const signInResult = await signInWithFirebase(idToken);

//             if (!signInResult.success) {
//               throw new Error("Failed to sign in with NextAuth");
//             }

//             console.log(`[${componentId}] NextAuth sign-in successful`);
//             toast.success("You are now logged in!", { id: "login-success" });

//             // Update the session
//             await update();

//             // Redirect to home page
//             router.push("/");
//           })
//           .catch(error => {
//             console.error(`[${componentId}] Error exchanging custom token:`, error);
//             toast.error("An error occurred during login. Please try logging in manually.");
//             setIsLoggingIn(false);
//             isRedirecting.current = false;
//             setTimeout(() => {
//               router.push("/login");
//             }, 1500);
//           });
//       } else {
//         // Legacy flow without custom token
//         console.log(`[${componentId}] No custom token received, using legacy flow`);
//         toast.success("You are now logged in!", { id: "login-success" });

//         // Update the session client-side
//         update().then(() => {
//           console.log(`[${componentId}] Session updated, redirecting`);
//           // Redirect to home page after successful login
//           setTimeout(() => {
//             router.push("/");
//           }, 500);
//         });
//       }
//     } else if (loginState?.message && !loginState.success && !errorToastShown.current) {
//       console.log(`[${componentId}] Login failed:`, loginState.message);
//       errorToastShown.current = true;
//       toast.error(`Login failed: ${loginState.message}. Please try logging in manually.`, { id: "login-error" });
//       setIsLoggingIn(false);
//       setTimeout(() => {
//         router.push("/login");
//       }, 1500);
//     }
//   }, [loginState, router, update, componentId]);

//   return (
//     <Card className={className} {...props}>
//       <div className="relative">
//         {" "}
//         {/* Wrapper div with relative positioning */}
//         <CardHeader>
//           <div className="absolute right-2 top-2 z-10">
//             <CloseButton />
//           </div>
//           <CardTitle>register</CardTitle>
//           <CardDescription>Create an account</CardDescription>
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
//             <Input
//               id="email"
//               name="email"
//               type="email"
//               placeholder="Enter your email"
//               required
//               value={email}
//               onChange={e => setEmail(e.target.value)}
//             />
//           </div>

//           <div className="space-y-2">
//             <div className="flex items-center gap-1">
//               <Label htmlFor="password">Password</Label>
//               <TooltipProvider>
//                 <Tooltip>
//                   <TooltipTrigger asChild>
//                     <Button variant="ghost" size="icon" className="h-5 w-5 p-0 text-muted-foreground">
//                       <Info className="h-4 w-4" />
//                       <span className="sr-only">Password requirements</span>
//                     </Button>
//                   </TooltipTrigger>
//                   <TooltipContent className="max-w-xs p-4">
//                     <p className="text-sm">
//                       Password must be 8-72 characters long and contain at least one uppercase letter, one lowercase
//                       letter, one number, and one special character.
//                     </p>
//                   </TooltipContent>
//                 </Tooltip>
//               </TooltipProvider>
//             </div>
//             <div className="relative">
//               <Input
//                 id="password"
//                 name="password"
//                 type={showPassword ? "text" : "password"}
//                 placeholder="Enter your password"
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

//           <div className="space-y-2">
//             <Label htmlFor="confirmPassword">Confirm Password</Label>
//             <div className="relative">
//               <Input
//                 id="confirmPassword"
//                 name="confirmPassword"
//                 type={showConfirmPassword ? "text" : "password"}
//                 placeholder="Confirm your password"
//                 required
//                 value={confirmPassword}
//                 onChange={e => setConfirmPassword(e.target.value)}
//               />
//               <Button
//                 type="button"
//                 variant="ghost"
//                 size="sm"
//                 className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
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
//             {isPending ? (
//               <>
//                 <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
//                 Registering...
//               </>
//             ) : isLoggingIn || isLoginPending ? (
//               <>
//                 <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
//                 Preparing account...
//               </>
//             ) : isRedirecting.current ? (
//               <>
//                 <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
//                 Redirecting...
//               </>
//             ) : (
//               "Register"
//             )}
//           </Button>

//           {/* Google Sign In Section */}
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
//         <div className="text-sm text-muted-foreground">
//           Already have an account?{" "}
//           <Button variant="link" className="p-0 h-auto" asChild>
//             <Link href="/login">Sign in</Link>
//           </Button>
//         </div>
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { registerUser, loginUser } from "@/actions/auth";
import { useSession } from "next-auth/react";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { toast } from "sonner";
import { auth } from "@/firebase/client";
import { signInWithCustomToken, sendEmailVerification } from "firebase/auth";
import { signInWithFirebase } from "@/actions/auth/firebase-auth";

import { getVerificationSettings } from "@/firebase/client/auth";
import { CloseButton } from "@/components";

export function RegisterForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter();
  const { update } = useSession();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false); //

  // Store form values in state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Add a ref to track if registration toast has been shown
  const registrationToastShown = useRef(false);
  // Add a ref to track if error toast has been shown
  const errorToastShown = useRef(false);
  // Add a ref to track if sign-in has been attempted
  const signInAttempted = useRef(false);
  // Add a ref to track if redirecting
  const isRedirecting = useRef(false);
  // Add a ref to track if verification email has been sent
  const verificationEmailSent = useRef(false);

  // Set up useActionState for server-side validation and registration
  const [state, action, isPending] = useActionState<RegisterState, FormData>(registerUser, null);
  // Set up useActionState for login
  const [loginState, loginAction, isLoginPending] = useActionState(loginUser, null);

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
      isRedirecting.current = false;
      verificationEmailSent.current = false;
    };
  }, []);

  // Add more detailed logging to the form submission handler
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(`[${componentId}] Register form submitted`);

    // Client-side validation
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    console.log(`[${componentId}] Form values before submission:`, {
      email,
      password,
      confirmPassword
    });

    // Reset toast flags
    registrationToastShown.current = false;
    errorToastShown.current = false;
    signInAttempted.current = false;
    isRedirecting.current = false;
    verificationEmailSent.current = false;
    console.log(
      `[${componentId}] Reset flags: registrationToastShown=${registrationToastShown.current}, errorToastShown=${errorToastShown.current}, signInAttempted=${signInAttempted.current}`
    );

    // Create FormData and append values
    const formData = new FormData();
    formData.append("name", email.split("@")[0]); // Use email username as name
    formData.append("email", email);
    formData.append("password", password);
    formData.append("confirmPassword", confirmPassword || ""); // Ensure it's never null

    console.log(`[${componentId}] FormData created with:`, {
      name: email.split("@")[0],
      email,
      passwordLength: password ? password.length : 0,
      confirmPasswordLength: confirmPassword ? confirmPassword.length : 0
    });

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
      signInAttempted: signInAttempted.current,
      verificationEmailSent: verificationEmailSent.current
    });

    if (state?.success && !registrationToastShown.current) {
      console.log(`[${componentId}] Registration successful!`, state);
      registrationToastShown.current = true;
      toast.success("Registration successful! Please verify your email.", { id: "registration-success" });

      // Check if we have a userId from the registration response
      if (state.userId) {
        console.log(`[${componentId}] User ID from registration:`, state.userId);
      } else {
        console.warn(`[${componentId}] No user ID returned from registration`);
      }

      // We need to sign in first to get the currentUser
      const handleSignInForVerification = async () => {
        if (signInAttempted.current) {
          console.log(`[${componentId}] Sign-in already attempted, skipping duplicate login attempt`);
          return;
        }

        signInAttempted.current = true;
        setIsLoggingIn(true);
        try {
          console.log(`[${componentId}] Waiting for Firebase to propagate the new account...`);
          toast.info("Preparing your account...", { id: "account-preparation" });

          // Increase the delay to allow Firebase to propagate the new account
          const delayTime = 3000; // 3 seconds
          console.log(`[${componentId}] Waiting ${delayTime / 1000} seconds before login attempt`);
          await new Promise(resolve => setTimeout(resolve, delayTime));

          console.log(`[${componentId}] Attempting sign-in to send verification email`);

          // Create login form data
          const loginFormData = new FormData();
          loginFormData.append("email", email);
          loginFormData.append("password", password);
          loginFormData.append("isRegistration", "true");
          loginFormData.append("skipSession", "true"); // Skip creating a session

          // Add the role from the registration response
          if (state.role) {
            console.log(`[${componentId}] Adding role to login form data:`, state.role);
            loginFormData.append("role", state.role);
          }

          // Add the user ID from the registration response
          if (state.userId) {
            console.log(`[${componentId}] Adding user ID to login form data:`, state.userId);
            loginFormData.append("id", state.userId);
          }

          // Use the loginUser server action
          const loginResult = await loginUser(null, loginFormData);

          if (loginResult.success && loginResult.customToken) {
            console.log(`[${componentId}] Custom token received, signing in to Firebase`);

            // Sign in with the custom token
            const userCredential = await signInWithCustomToken(auth, loginResult.customToken);
            const user = userCredential.user;

            if (user && !verificationEmailSent.current) {
              verificationEmailSent.current = true;
              console.log(`[${componentId}] Sending verification email to: ${email}`);

              try {
                await sendEmailVerification(user, getVerificationSettings());
                console.log(`[${componentId}] Verification email sent successfully`);
                toast.info("Verification email sent. Check your inbox and spam folder.", {
                  id: "verification-email-sent"
                });

                // Log the verification email sent event
                try {
                  // Create a form data object to log the activity
                  const activityFormData = new FormData();
                  activityFormData.append("userId", user.uid);
                  activityFormData.append("type", "verification_email_sent");
                  activityFormData.append("description", "Verification email sent to user");
                  activityFormData.append("status", "success");

                  // You might need to create a server action for logging activities
                  // await logActivityAction(activityFormData);

                  console.log(`[${componentId}] Logged verification email activity`);
                } catch (activityError) {
                  console.error(`[${componentId}] Failed to log verification activity:`, activityError);
                }

                // Redirect to verification page
                setTimeout(() => {
                  router.push("/verify-email");
                }, 1500);
              } catch (error) {
                console.error(`[${componentId}] Error sending verification email:`, error);
                toast.error("Could not send verification email. Please try again later.", {
                  id: "verification-error"
                });
              }
            } else {
              console.error(`[${componentId}] No user found after sign-in or email already sent`);
              if (!user) {
                toast.error("Something went wrong. Please try registering again.", {
                  id: "no-user-error"
                });
              }
            }
          } else {
            console.error(`[${componentId}] Failed to sign in to send verification email:`, loginResult);
            toast.error("Could not complete registration. Please try again.", {
              id: "login-for-verification-error"
            });
          }
        } catch (error) {
          console.error(`[${componentId}] Error in verification flow:`, error);
          setIsLoggingIn(false);
          toast.error("Failed to complete registration. Please try again.", {
            id: "verification-flow-error"
          });
        } finally {
          setIsLoggingIn(false);
        }
      };

      // Execute the verification flow
      handleSignInForVerification();

      // Return early to prevent the original sign-in flow
      return;
    } else if (state?.error && !errorToastShown.current) {
      console.log(`[${componentId}] Registration error:`, state.error);
      errorToastShown.current = true;
      toast.error(state.error, { id: "registration-error" });
    }
  }, [state, router, email, password, isLoggingIn, componentId, loginAction]);

  // Add effect for login state changes (this will only run for normal login, not verification)
  useEffect(() => {
    // Skip this effect if we're in the verification flow
    if (verificationEmailSent.current) {
      return;
    }

    console.log(`[${componentId}] Login state effect triggered:`, {
      loginState,
      isRedirecting: isRedirecting.current
    });

    if (loginState?.success && !isRedirecting.current) {
      console.log(`[${componentId}] Login successful!`);
      isRedirecting.current = true;

      // Check if we have a custom token
      if (loginState.customToken) {
        console.log(`[${componentId}] Custom token received, exchanging for ID token`);

        // Exchange the custom token for an ID token
        signInWithCustomToken(auth, loginState.customToken)
          .then(async userCredential => {
            console.log(`[${componentId}] Custom token exchanged successfully`);

            // Get the ID token
            const idToken = await userCredential.user.getIdToken();
            console.log(`[${componentId}] ID token obtained, signing in with NextAuth`);

            // Sign in with NextAuth using the ID token
            const signInResult = await signInWithFirebase(idToken);

            if (!signInResult.success) {
              throw new Error("Failed to sign in with NextAuth");
            }

            console.log(`[${componentId}] NextAuth sign-in successful`);
            toast.success("You are now logged in!", { id: "login-success" });

            // Update the session
            await update();

            // Redirect to home page
            router.push("/");
          })
          .catch(error => {
            console.error(`[${componentId}] Error exchanging custom token:`, error);
            toast.error("An error occurred during login. Please try logging in manually.");
            setIsLoggingIn(false);
            isRedirecting.current = false;
            setTimeout(() => {
              router.push("/login");
            }, 1500);
          });
      } else {
        // Legacy flow without custom token
        console.log(`[${componentId}] No custom token received, using legacy flow`);
        toast.success("You are now logged in!", { id: "login-success" });

        // Update the session client-side
        update().then(() => {
          console.log(`[${componentId}] Session updated, redirecting`);
          // Redirect to home page after successful login
          setTimeout(() => {
            router.push("/");
          }, 500);
        });
      }
    } else if (loginState?.message && !loginState.success && !errorToastShown.current) {
      console.log(`[${componentId}] Login failed:`, loginState.message);
      errorToastShown.current = true;
      toast.error(`Login failed: ${loginState.message}. Please try logging in manually.`, { id: "login-error" });
      setIsLoggingIn(false);
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    }
  }, [loginState, router, update, componentId]);

  return (
    <Card className={className} {...props}>
      <div className="relative">
        {" "}
        {/* Wrapper div with relative positioning */}
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
            <div className="flex items-center gap-1">
              <Label htmlFor="password">Password</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-5 w-5 p-0 text-muted-foreground">
                      <Info className="h-4 w-4" />
                      <span className="sr-only">Password requirements</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs p-4">
                    <p className="text-sm">
                      Password must be 8-72 characters long and contain at least one uppercase letter, one lowercase
                      letter, one number, and one special character.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
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

          <Button
            type="submit"
            className="w-full"
            disabled={isPending || isLoggingIn || isLoginPending || isRedirecting.current || isGoogleSigningIn}>
            {isPending ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : isLoggingIn || isLoginPending ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Preparing account...
              </>
            ) : isRedirecting.current ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Redirecting...
              </>
            ) : (
              "Register"
            )}
          </Button>

          {/* Google Sign In Section */}
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
