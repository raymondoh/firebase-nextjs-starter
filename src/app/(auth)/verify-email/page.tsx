import type { Metadata } from "next";
import { VerifyEmailForm } from "@/components";

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Verify your account"
};

export default function VerifyEmailPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <VerifyEmailForm />
    </div>
  );
}
