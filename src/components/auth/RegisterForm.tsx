// "use client";

// import type React from "react";
// import type { RegisterState } from "@/types/auth";

// import { useState, useEffect } from "react";
// import { useActionState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { LoaderCircle, Eye, EyeOff, AlertCircle } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { registerUser } from "@/actions/authActions"; // Fix the import path
// import { signIn } from "next-auth/react";
// import { toast } from "sonner";

// export function RegisterForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
//   const router = useRouter();
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   // Store form values in state
//   const [name, setName] = useState(""); // Add name state
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");

//   // Set up useActionState for server-side validation and registration
//   const [state, action, isPending] = useActionState<RegisterState, FormData>(registerUser, null);

//   // Handle form submission
//   const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
//     event.preventDefault();

//     // Client-side validation
//     if (password !== confirmPassword) {
//       toast.error("Passwords do not match");
//       return;
//     }

//     // Create FormData and append values
//     const formData = new FormData();
//     formData.append("name", name);
//     formData.append("email", email);
//     formData.append("password", password);

//     // Call the action
//     action(formData);
//   };

//   // Handle successful registration
//   useEffect(() => {
//     if (state?.success) {
//       toast.success("Registration successful!");

//       // Attempt to sign in after successful registration
//       const handleSignIn = async () => {
//         try {
//           if (!email || !password) {
//             console.error("Email or password is missing for automatic sign-in");
//             // Add a delay before redirecting
//             setTimeout(() => {
//               toast.info("Please log in with your new credentials");
//               window.location.href = "/login"; // Use direct window location change
//             }, 500);
//             return;
//           }

//           console.log("Attempting automatic sign-in with:", { email });

//           const signInResult = await signIn("credentials", {
//             redirect: false,
//             email,
//             password,
//             isRegistration: "true" // Add the isRegistration flag
//           });

//           if (signInResult?.ok) {
//             toast.success("You are now logged in!");
//             // Add a delay before redirecting
//             setTimeout(() => {
//               window.location.href = "/"; // Use direct window location change
//             }, 500);
//           } else {
//             console.error("Automatic sign-in failed:", signInResult?.error);
//             toast.error("Automatic sign-in failed. Please try logging in manually.");
//             // Add a delay before redirecting
//             setTimeout(() => {
//               window.location.href = "/login"; // Use direct window location change
//             }, 500);
//           }
//         } catch (error) {
//           console.error("Sign-in error:", error);
//           toast.error("Automatic sign-in failed. Please try logging in manually.");
//           // Add a delay before redirecting
//           setTimeout(() => {
//             window.location.href = "/login"; // Use direct window location change
//           }, 500);
//         }
//       };

//       handleSignIn();
//     } else if (state?.error) {
//       toast.error(state.error);
//     }
//   }, [state, router, email, password]);

//   return (
//     <Card className={className} {...props}>
//       <CardHeader>
//         <CardTitle>Register</CardTitle>
//         <CardDescription>Create a new account</CardDescription>
//       </CardHeader>
//       <CardContent>
//         {state?.error && (
//           <Alert variant="destructive" className="mb-6">
//             <AlertCircle className="h-4 w-4" />
//             <AlertDescription>{state.error}</AlertDescription>
//           </Alert>
//         )}

//         <form id="register-form" onSubmit={handleSubmit} className="space-y-8">
//           {/* Add name field */}
//           <div className="space-y-2">
//             <Label htmlFor="name">Name</Label>
//             <Input
//               id="name"
//               name="name"
//               type="text"
//               placeholder="Enter your name"
//               required
//               value={name}
//               onChange={e => setName(e.target.value)}
//             />
//           </div>

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
//             <Label htmlFor="password">Password</Label>
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
//             <p className="text-sm text-muted-foreground">
//               Password must be 8-72 characters long and contain at least one uppercase letter, one lowercase letter, one
//               number, and one special character.
//             </p>
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

//           <Button type="submit" className="w-full" disabled={isPending}>
//             {isPending ? (
//               <>
//                 <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
//                 Registering...
//               </>
//             ) : (
//               "Register"
//             )}
//           </Button>
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
import { registerUser } from "@/actions/authActions";
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

  // Set up useActionState for server-side validation and registration
  const [state, action, isPending] = useActionState<RegisterState, FormData>(registerUser, null);

  // Handle form submission
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Client-side validation
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Create FormData and append values
    const formData = new FormData();
    formData.append("name", name || email.split("@")[0]); // Use email username as fallback
    formData.append("email", email);
    formData.append("password", password);

    // Wrap action call in startTransition
    startTransition(() => {
      action(formData);
    });
  };

  // Handle successful registration
  useEffect(() => {
    if (state?.success) {
      toast.success("Registration successful!");

      // Attempt to sign in after successful registration
      const handleSignIn = async () => {
        if (isLoggingIn) return; // Prevent duplicate login attempts

        setIsLoggingIn(true);
        try {
          toast.info("Logging you in...");

          const signInResult = await signIn("credentials", {
            redirect: false,
            email,
            password
          });

          if (signInResult?.ok) {
            toast.success("You are now logged in!");
            // Add a delay before redirecting
            setTimeout(() => {
              router.push("/");
            }, 500);
          } else {
            console.error("Automatic sign-in failed:", signInResult?.error);
            toast.error("Automatic sign-in failed. Please try logging in manually.");
            // Add a delay before redirecting
            setTimeout(() => {
              router.push("/login");
            }, 1500);
          }
        } catch (error) {
          console.error("Sign-in error:", error);
          toast.error("Automatic sign-in failed. Please try logging in manually.");
          // Add a delay before redirecting
          setTimeout(() => {
            router.push("/login");
          }, 1500);
        } finally {
          setIsLoggingIn(false);
        }
      };

      handleSignIn();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router, email, password, isLoggingIn]);

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
