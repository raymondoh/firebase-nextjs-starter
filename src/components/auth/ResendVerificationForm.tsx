// "use client";

// import type React from "react";
// import { useState } from "react";
// import Link from "next/link";
// import { Mail } from "lucide-react";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { toast } from "sonner";
// import { auth } from "@/firebase/client/firebase-client-init";
// import { sendEmailVerification, signInWithEmailAndPassword } from "firebase/auth";
// import { isFirebaseError, firebaseError } from "@/utils/firebase-error";
// import { SubmitButton } from "@/components/shared/SubmitButton";
// import { logActivity } from "@/firebase/actions";

// export function ResendVerificationForm() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

//   const handleResendVerification = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!email || !password) {
//       toast.error("Please enter your email and password");
//       return;
//     }

//     setIsLoading(true);

//     try {
//       const userCredential = await signInWithEmailAndPassword(auth, email, password);
//       const user = userCredential.user;

//       if (user.emailVerified) {
//         toast.success("Your email is already verified. You can log in now.");
//         return;
//       }

//       await sendEmailVerification(user);
//       await logActivity({
//         userId: user.uid,
//         type: "email_verification_resent",
//         description: "User requested new verification email",
//         status: "success",
//         metadata: { email }
//       });

//       toast.success("Verification email sent! Please check your inbox and spam folder.");
//     } catch (error: unknown) {
//       console.error("[RESEND_VERIFICATION] Error:", error);

//       if (isFirebaseError(error)) {
//         switch (error.code) {
//           case "auth/wrong-password":
//           case "auth/user-not-found":
//             toast.error("Invalid email or password");
//             break;
//           case "auth/too-many-requests":
//             toast.error("Too many attempts. Please try again later.");
//             break;
//           default:
//             toast.error(firebaseError(error));
//             break;
//         }
//       } else {
//         toast.error("Unexpected error. Please try again later.");
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="container flex items-center justify-center min-h-screen py-12">
//       <Card className="max-w-md w-full">
//         <CardHeader className="space-y-1">
//           <div className="flex justify-center mb-4">
//             <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
//               <Mail className="h-10 w-10 text-primary" />
//             </div>
//           </div>
//           <CardTitle className="text-2xl text-center">Resend Verification Email</CardTitle>
//           <CardDescription className="text-center">
//             Enter your credentials to resend the verification email
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleResendVerification} className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 placeholder="Enter your email"
//                 value={email}
//                 onChange={e => setEmail(e.target.value)}
//                 required
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="password">Password</Label>
//               <Input
//                 id="password"
//                 type="password"
//                 placeholder="Enter your password"
//                 value={password}
//                 onChange={e => setPassword(e.target.value)}
//                 required
//               />
//             </div>

//             <SubmitButton isLoading={isLoading} loadingText="Sending..." className="w-full" variant="default">
//               Resend Verification Email
//             </SubmitButton>
//           </form>
//         </CardContent>
//         <CardFooter className="flex flex-col space-y-4">
//           <div className="text-sm text-center text-muted-foreground">
//             Already verified?{" "}
//             <Link href="/login" className="underline underline-offset-4 hover:text-primary">
//               Log in
//             </Link>
//           </div>
//         </CardFooter>
//       </Card>
//     </div>
//   );
// }
"use client";

import type React from "react";
import { useState, useRef } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { auth } from "@/firebase/client/firebase-client-init";
import { sendEmailVerification, signInWithEmailAndPassword } from "firebase/auth";
import { isFirebaseError, firebaseError } from "@/utils/firebase-error";
import { SubmitButton } from "@/components/shared/SubmitButton";
import { logActivity } from "@/firebase/actions";

export function ResendVerificationForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const emailInputRef = useRef<HTMLInputElement>(null);

  function resetForm() {
    setEmail("");
    setPassword("");
    emailInputRef.current?.focus(); // ✨ Focus back to email input
  }

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter your email and password");
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user.emailVerified) {
        toast.success("Your email is already verified. You can log in now.");
        resetForm();
        return;
      }

      await sendEmailVerification(user);
      await logActivity({
        userId: user.uid,
        type: "email_verification_resent",
        description: "User requested new verification email",
        status: "success",
        metadata: { email }
      });

      toast.success("Verification email sent! Please check your inbox and spam folder.");
      resetForm();
    } catch (error: unknown) {
      console.error("[RESEND_VERIFICATION] Error:", error);

      if (isFirebaseError(error)) {
        switch (error.code) {
          case "auth/wrong-password":
          case "auth/user-not-found":
            toast.error("Invalid email or password");
            break;
          case "auth/too-many-requests":
            toast.error("Too many attempts. Please try again later.");
            break;
          default:
            toast.error(firebaseError(error));
            break;
        }
      } else {
        toast.error("Unexpected error. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="max-w-md w-full">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Resend Verification Email</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to resend the verification email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResendVerification} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                ref={emailInputRef} // ✨ connect ref here
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <SubmitButton isLoading={isLoading} loadingText="Sending..." className="w-full" variant="default">
              Resend Verification Email
            </SubmitButton>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            Already verified?{" "}
            <Link href="/login" className="underline underline-offset-4 hover:text-primary">
              Log in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
