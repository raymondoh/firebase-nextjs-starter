// "use client";

// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { z } from "zod";
// import { LoaderCircle } from "lucide-react";
// import { useSession } from "next-auth/react";
// import { Button } from "@/components/ui/button";
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
// import { registerUser, loginUser } from "@/actions/authActions";
// import { toast } from "sonner";

// const registerFormSchema = z
//   .object({
//     email: z.string().email({ message: "Please enter a valid email address" }),
//     password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
//     confirmPassword: z.string()
//   })
//   .refine(data => data.password === data.confirmPassword, {
//     message: "Passwords do not match",
//     path: ["confirmPassword"]
//   });

// type RegisterFormValues = z.infer<typeof registerFormSchema>;

// export function RegisterForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
//   const router = useRouter();
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const { update } = useSession();

//   const form = useForm<RegisterFormValues>({
//     resolver: zodResolver(registerFormSchema),
//     defaultValues: {
//       email: "",
//       password: "",
//       confirmPassword: ""
//     }
//   });

//   async function onSubmit(data: RegisterFormValues) {
//     setIsSubmitting(true);

//     try {
//       const formData = new FormData();
//       formData.append("email", data.email);
//       formData.append("password", data.password);
//       formData.append("confirmPassword", data.confirmPassword); // Add this line

//       const registerResult = await registerUser(formData);

//       if (registerResult.success) {
//         // If registration is successful, attempt to log in
//         const loginFormData = new FormData();
//         loginFormData.append("email", data.email);
//         loginFormData.append("password", data.password);

//         const loginResult = await loginUser(loginFormData);

//         if (loginResult.success) {
//           await update();

//           toast("Registration Successful");
//           router.push("/");
//         } else {
//           toast("Login Failed");
//         }
//       } else {
//         toast(registerResult.error || "Registration Failed");
//       }
//     } catch (error) {
//       console.error("Registration error:", error);

//       toast("An unexpected error occurred. Please try again later.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   }
//   return (
//     <Card className={className} {...props}>
//       <CardHeader>
//         <CardTitle>Register</CardTitle>
//         <CardDescription>Create a new account</CardDescription>
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
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="confirmPassword"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Confirm Password</FormLabel>
//                   <FormControl>
//                     <Input
//                       placeholder="Confirm your password"
//                       type="password"
//                       autoCapitalize="none"
//                       autoComplete="new-password"
//                       autoCorrect="off"
//                       disabled={isSubmitting}
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormDescription>Re-enter your password to confirm.</FormDescription>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <Button type="submit" className="w-full" disabled={isSubmitting}>
//               {isSubmitting ? (
//                 <>
//                   <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
//                   Registering...
//                 </>
//               ) : (
//                 "Register"
//               )}
//             </Button>
//           </form>
//         </Form>
//       </CardContent>
//       <CardFooter className="flex flex-col items-center gap-4">
//         <div className="text-sm text-muted-foreground">
//           Already have an account?{" "}
//           <Link href="/login" className="text-primary hover:underline">
//             Sign in
//           </Link>
//         </div>
//       </CardFooter>
//     </Card>
//   );
// }
"use client";

import type React from "react";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { LoaderCircle, Eye, EyeOff } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { registerUser } from "@/actions/authActions";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

const registerFormSchema = z
  .object({
    email: z
      .string()
      .email({ message: "Please enter a valid email address" })
      .max(255, { message: "Email must not exceed 255 characters" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .max(72, { message: "Password must not exceed 72 characters" })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      }),
    confirmPassword: z.string()
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export function RegisterForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { update } = useSession();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  async function onSubmit(data: RegisterFormValues) {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("confirmPassword", data.confirmPassword);

      const registerResult = await registerUser(formData);

      if (registerResult.success) {
        toast.success("Registration Successful");

        // Attempt to sign in
        const signInResult = await signIn("credentials", {
          redirect: false,
          email: data.email,
          password: data.password
        });

        if (signInResult?.ok) {
          await update();
          router.push("/");
        } else {
          toast.error("Login Failed: Please try logging in manually");
        }
      } else {
        toast.error(registerResult.error || "Registration Failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("An unexpected error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className={className} {...props}>
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription>Create a new account</CardDescription>
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
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} placeholder="Enter your password" {...field} />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Password must be 8-72 characters long and contain at least one uppercase letter, one lowercase
                    letter, one number, and one special character.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        {...field}
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
                  </FormControl>
                  <FormDescription>Re-enter your password to confirm.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col items-center gap-4">
        <div className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
