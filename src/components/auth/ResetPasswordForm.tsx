// "use client";

// import type React from "react";
// import { useState, useEffect } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import Link from "next/link";
// import { Eye, EyeOff, CheckCircle, XCircle, KeyRound } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { toast } from "sonner";
// import { auth } from "@/firebase/client/firebase-client-init";
// import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
// import { updatePasswordHash, getUserIdByEmail } from "@/actions/auth/reset-password";
// import { firebaseError, isFirebaseError } from "@/utils/firebase-error";
// import { SubmitButton } from "@/components/shared/SubmitButton";

// export function ResetPasswordForm() {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   const [status, setStatus] = useState<"verifying" | "ready" | "submitting" | "success" | "error">("verifying");
//   const [errorMessage, setErrorMessage] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [oobCode, setOobCode] = useState("");
//   const [userId, setUserId] = useState("");

//   function resetForm() {
//     setPassword("");
//     setConfirmPassword("");
//     setErrorMessage("");
//     setStatus("ready");
//   }

//   useEffect(() => {
//     const mode = searchParams.get("mode");
//     const code = searchParams.get("oobCode");

//     if (mode === "resetPassword" && code) {
//       setOobCode(code);

//       const verifyCode = async () => {
//         try {
//           const email = await verifyPasswordResetCode(auth, code);
//           setEmail(email);

//           const result = await getUserIdByEmail({ email });
//           if (result.success && result.userId) {
//             setUserId(result.userId);
//           }

//           setStatus("ready");
//         } catch (err) {
//           console.error("[RESET_PASSWORD][VERIFY_CODE]", err);
//           const msg = isFirebaseError(err) ? firebaseError(err) : "Invalid or expired password reset link";
//           setErrorMessage(msg);
//           setStatus("error");
//         }
//       };

//       verifyCode();
//     } else if (mode === "verifyEmail") {
//       router.push(`/verify-email?${searchParams.toString()}`);
//     } else {
//       setErrorMessage("Invalid password reset link");
//       setStatus("error");
//     }
//   }, [searchParams, router]);

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     if (password !== confirmPassword) {
//       toast.error("Passwords do not match");
//       return;
//     }

//     if (password.length < 8) {
//       toast.error("Password must be at least 8 characters long");
//       return;
//     }

//     setStatus("submitting");

//     try {
//       await confirmPasswordReset(auth, oobCode, password);

//       const resolvedUserId = userId || (await getUserIdByEmail({ email })).userId;
//       if (resolvedUserId) {
//         await updatePasswordHash({ userId: resolvedUserId, newPassword: password });
//       }

//       setStatus("success");
//       toast.success("Password reset successful! You can now log in.");

//       setTimeout(() => router.push("/login"), 3000);
//     } catch (err) {
//       console.error("[RESET_PASSWORD][SUBMIT]", err);
//       const msg = isFirebaseError(err) ? firebaseError(err) : "Failed to reset password";
//       setErrorMessage(msg);
//       setStatus("error");
//       toast.error(msg);
//     }
//   };

//   if (status === "success") {
//     return (
//       <CenteredCard
//         icon={<CheckCircle className="h-10 w-10 text-green-600" />}
//         title="Password Reset Successful!"
//         description="Your password has been reset successfully."
//         footer={
//           <Button asChild>
//             <Link href="/login">Continue to Login</Link>
//           </Button>
//         }
//       />
//     );
//   }

//   if (status === "error") {
//     return (
//       <CenteredCard
//         icon={<XCircle className="h-10 w-10 text-red-600" />}
//         title="Reset Link Invalid"
//         description={errorMessage}
//         footer={
//           <Button asChild>
//             <Link href="/forgot-password">Request New Reset Link</Link>
//           </Button>
//         }
//       />
//     );
//   }

//   return (
//     <div className="container flex items-center justify-center min-h-screen py-12">
//       <Card className="max-w-md w-full">
//         <CardHeader className="space-y-1">
//           <div className="flex justify-center mb-4">
//             <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
//               <KeyRound className="h-10 w-10 text-primary" />
//             </div>
//           </div>
//           <CardTitle className="text-2xl text-center">Reset Your Password</CardTitle>
//           <CardDescription className="text-center">Create a new password for {email}</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <PasswordInput
//               id="password"
//               label="New Password"
//               value={password}
//               onChange={setPassword}
//               show={showPassword}
//               toggleShow={() => setShowPassword(prev => !prev)}
//             />
//             <PasswordInput
//               id="confirmPassword"
//               label="Confirm New Password"
//               value={confirmPassword}
//               onChange={setConfirmPassword}
//               show={showConfirmPassword}
//               toggleShow={() => setShowConfirmPassword(prev => !prev)}
//             />
//             <SubmitButton
//               isLoading={status === "submitting"}
//               loadingText="Resetting..."
//               className="w-full"
//               variant="default">
//               Reset Password
//             </SubmitButton>
//           </form>
//         </CardContent>
//         <CardFooter className="flex justify-center">
//           <div className="text-sm text-muted-foreground">
//             Remember your password?{" "}
//             <Button variant="link" className="p-0 h-auto" asChild>
//               <Link href="/login">Back to login</Link>
//             </Button>
//           </div>
//         </CardFooter>
//       </Card>
//     </div>
//   );
// }

// function CenteredCard({
//   icon,
//   title,
//   description,
//   footer
// }: {
//   icon: React.ReactNode;
//   title: string;
//   description: string;
//   footer?: React.ReactNode;
// }) {
//   return (
//     <div className="container flex items-center justify-center min-h-screen py-12">
//       <Card className="max-w-md w-full">
//         <CardHeader className="space-y-1">
//           <div className="flex justify-center mb-4">
//             <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">{icon}</div>
//           </div>
//           <CardTitle className="text-2xl text-center">{title}</CardTitle>
//           <CardDescription className="text-center">{description}</CardDescription>
//         </CardHeader>
//         <CardContent className="text-center space-y-4" />
//         {footer && <CardFooter className="flex justify-center">{footer}</CardFooter>}
//       </Card>
//     </div>
//   );
// }

// function PasswordInput({
//   id,
//   label,
//   value,
//   onChange,
//   show,
//   toggleShow
// }: {
//   id: string;
//   label: string;
//   value: string;
//   onChange: (val: string) => void;
//   show: boolean;
//   toggleShow: () => void;
// }) {
//   return (
//     <div className="space-y-2">
//       <Label htmlFor={id}>{label}</Label>
//       <div className="relative">
//         <Input
//           id={id}
//           type={show ? "text" : "password"}
//           placeholder={label}
//           value={value}
//           onChange={e => onChange(e.target.value)}
//           required
//         />
//         <Button
//           type="button"
//           variant="ghost"
//           size="sm"
//           className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
//           onClick={toggleShow}>
//           {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//         </Button>
//       </div>
//     </div>
//   );
// }
"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle, XCircle, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { auth } from "@/firebase/client/firebase-client-init";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { updatePasswordHash, getUserIdByEmail } from "@/actions/auth/reset-password";
import { firebaseError, isFirebaseError } from "@/utils/firebase-error";
import { SubmitButton } from "@/components/shared/SubmitButton";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<"verifying" | "ready" | "submitting" | "success" | "error">("verifying");
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [oobCode, setOobCode] = useState("");
  const [userId, setUserId] = useState("");

  function resetForm() {
    setPassword("");
    setConfirmPassword("");
    setErrorMessage("");
    setStatus("ready");
  }

  useEffect(() => {
    const mode = searchParams.get("mode");
    const code = searchParams.get("oobCode");

    if (mode === "resetPassword" && code) {
      setOobCode(code);

      const verifyCode = async () => {
        try {
          const email = await verifyPasswordResetCode(auth, code);
          setEmail(email);

          const result = await getUserIdByEmail({ email });
          if (result.success && result.userId) {
            setUserId(result.userId);
          }

          setStatus("ready");
        } catch (err) {
          console.error("[RESET_PASSWORD][VERIFY_CODE]", err);
          const msg = isFirebaseError(err) ? firebaseError(err) : "Invalid or expired password reset link";
          setErrorMessage(msg);
          setStatus("error");
        }
      };

      verifyCode();
    } else if (mode === "verifyEmail") {
      router.push(`/verify-email?${searchParams.toString()}`);
    } else {
      setErrorMessage("Invalid password reset link");
      setStatus("error");
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setStatus("submitting");

    try {
      await confirmPasswordReset(auth, oobCode, password);

      const resolvedUserId = userId || (await getUserIdByEmail({ email })).userId;
      if (resolvedUserId) {
        await updatePasswordHash({ userId: resolvedUserId, newPassword: password });
      }

      setStatus("success");
      toast.success("Password reset successful! You can now log in.");

      setTimeout(() => router.push("/login"), 3000);
    } catch (err) {
      console.error("[RESET_PASSWORD][SUBMIT]", err);
      const msg = isFirebaseError(err) ? firebaseError(err) : "Failed to reset password";
      setErrorMessage(msg);
      setStatus("error");
      toast.error(msg);
    }
  };

  if (status === "success") {
    return (
      <CenteredCard
        icon={<CheckCircle className="h-10 w-10 text-green-600" />}
        title="Password Reset Successful!"
        description="Your password has been reset successfully."
        footer={
          <Button asChild>
            <Link href="/login">Continue to Login</Link>
          </Button>
        }
      />
    );
  }

  if (status === "error") {
    return (
      <CenteredCard
        icon={<XCircle className="h-10 w-10 text-red-600" />}
        title="Reset Link Invalid"
        description={errorMessage}
        footer={
          <Button
            variant="default"
            onClick={() => {
              resetForm();
              router.push("/forgot-password");
            }}>
            Request New Reset Link
          </Button>
        }
      />
    );
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="max-w-md w-full">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <KeyRound className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Reset Your Password</CardTitle>
          <CardDescription className="text-center">Create a new password for {email}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <PasswordInput
              id="password"
              label="New Password"
              value={password}
              onChange={setPassword}
              show={showPassword}
              toggleShow={() => setShowPassword(prev => !prev)}
            />
            <PasswordInput
              id="confirmPassword"
              label="Confirm New Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              show={showConfirmPassword}
              toggleShow={() => setShowConfirmPassword(prev => !prev)}
            />
            <SubmitButton
              isLoading={status === "submitting"}
              loadingText="Resetting..."
              className="w-full"
              variant="default">
              Reset Password
            </SubmitButton>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-muted-foreground">
            Remember your password?{" "}
            <Button variant="link" className="p-0 h-auto" asChild>
              <Link href="/login">Back to login</Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

function CenteredCard({
  icon,
  title,
  description,
  footer
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  footer?: React.ReactNode;
}) {
  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="max-w-md w-full">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">{icon}</div>
          </div>
          <CardTitle className="text-2xl text-center">{title}</CardTitle>
          <CardDescription className="text-center">{description}</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4" />
        {footer && <CardFooter className="flex justify-center">{footer}</CardFooter>}
      </Card>
    </div>
  );
}

function PasswordInput({
  id,
  label,
  value,
  onChange,
  show,
  toggleShow
}: {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  show: boolean;
  toggleShow: () => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          placeholder={label}
          value={value}
          onChange={e => onChange(e.target.value)}
          required
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={toggleShow}>
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
