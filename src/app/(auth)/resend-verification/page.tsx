import { ResendVerificationForm } from "@/components";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resend Verification",
  description: "Resend Verification Page"
};

export default function ResetPasswordPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <ResendVerificationForm />
    </div>
  );
}
