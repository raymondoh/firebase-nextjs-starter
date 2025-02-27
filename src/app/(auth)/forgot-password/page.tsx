import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your password"
};

export default function ForgotPasswordPage() {
  return (
    <div className="container mx-auto max-w-md mt-8">
      <ForgotPasswordForm />
    </div>
  );
}
