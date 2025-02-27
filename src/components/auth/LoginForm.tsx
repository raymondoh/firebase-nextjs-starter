// "use client";

// import { useState, useEffect } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { z } from "zod";
// import { LoaderCircle, GiftIcon } from "lucide-react";
// import { signIn, useSession } from "next-auth/react";
// import { Button } from "@/components/ui/button";
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
// import { toast } from "sonner";
// import { loginUser } from "@/actions/authActions";
// //import { getSession } from "next-auth/react";

// const loginSchema = z.object({
//   email: z.string().email({ message: "Please enter a valid email address" }),
//   password: z.string().min(6, { message: "Password must be at least 6 characters long" })
// });

// type LoginFormValues = z.infer<typeof loginSchema>;

// export const LoginForm = ({ className, ...props }: React.ComponentPropsWithoutRef<"div">) => {
//   const router = useRouter();
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const { data: session, status, update } = useSession();

//   const form = useForm<LoginFormValues>({
//     resolver: zodResolver(loginSchema),
//     defaultValues: {
//       email: "",
//       password: ""
//     }
//   });

//   async function onSubmit(data: LoginFormValues) {
//     setIsSubmitting(true);

//     try {
//       const formData = new FormData();
//       formData.append("email", data.email);
//       formData.append("password", data.password);

//       const result = await loginUser(formData);

//       if (!result.success) {
//         toast("Login Failed.");
//       } else {
//         await update();
//         console.log("Session after login:", session);

//         toast("Redirecting to home page...");
//         router.push("/");
//       }
//     } catch (error) {
//       console.error("Login error:", error);

//       toast("An unexpected error occurred. Please try again later.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   }

//   const handleGoogleSignIn = async () => {
//     try {
//       const result = await signIn("google", { callbackUrl: "/" });
//       if (result?.error) {
//         toast("Failed to sign in with Google. Please try again");
//       }
//     } catch (error) {
//       console.error("Google sign-in error:", error);

//       toast("An unexpected error occurred during GitHub sign-in. Please try again later..");
//     }
//   };
//   useEffect(() => {
//     console.log("Current session:", session);
//     console.log("Session status:", status);
//   }, [session, status]);

//   useEffect(() => {
//     if (session) {
//       router.push("/");
//     }
//   }, [session, router]);

//   if (status === "loading") {
//     return <div>Loading...</div>;
//   }

//   return (
//     <Card className={className} {...props}>
//       <CardHeader>
//         <CardTitle>Login</CardTitle>
//         <CardDescription>Enter your email and password to login</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
//             <FormField
//               control={form.control}
//               name="email"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Email</FormLabel>
//                   <FormControl>
//                     <Input placeholder="Enter your email" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="password"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Password</FormLabel>
//                   <FormControl>
//                     <Input type="password" placeholder="Enter your password" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                   <FormDescription>
//                     <Link href="/forgot-password" className="text-sm text-muted-foreground hover:underline">
//                       Forgot password?
//                     </Link>
//                   </FormDescription>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <Button type="submit" className="w-full" disabled={isSubmitting}>
//               {isSubmitting ? (
//                 <>
//                   <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
//                   Logging in...
//                 </>
//               ) : (
//                 "Login"
//               )}
//             </Button>
//           </form>
//         </Form>
//         <div className="mt-6">
//           <div className="relative">
//             <div className="absolute inset-0 flex items-center">
//               <span className="w-full border-t" />
//             </div>
//             <div className="relative flex justify-center text-xs uppercase">
//               <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
//             </div>
//           </div>
//           <Button variant="outline" type="button" className="w-full mt-4" onClick={handleGoogleSignIn}>
//             {/* <GiftIcon className="mr-2 h-4 w-4" /> */}
//             Google Sign In
//           </Button>
//         </div>
//       </CardContent>
//       <CardFooter className="flex flex-col items-center gap-4">
//         <div className="text-sm text-muted-foreground ">
//           Don&apos;t have an account?{" "}
//           <Link href="/register" className="text-primary hover:underline">
//             Sign up
//           </Link>
//         </div>
//       </CardFooter>
//     </Card>
//   );
// };
"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { LoaderCircle } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" })
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginForm = ({ className, ...props }: React.ComponentPropsWithoutRef<"div">) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session, status, update } = useSession();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  async function onSubmit(data: LoginFormValues) {
    setIsSubmitting(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password
      });

      if (result?.error) {
        toast.error(result.error);
      } else {
        await update();
        toast.success("Login successful");
        router.push("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An unexpected error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const result = await signIn("google", { callbackUrl: "/" });
      if (result?.error) {
        toast.error("Failed to sign in with Google. Please try again");
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error("An unexpected error occurred during Google sign-in. Please try again later.");
    }
  };

  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <Card className={className} {...props}>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Enter your email and password to login</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter your password" {...field} />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>
                    <Link href="/forgot-password" className="text-sm text-muted-foreground hover:underline">
                      Forgot password?
                    </Link>
                  </FormDescription>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </Form>
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <Button variant="outline" type="button" className="w-full mt-4" onClick={handleGoogleSignIn}>
            Google Sign In
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-center gap-4">
        <div className="text-sm text-muted-foreground ">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};
