import { ResetPasswordForm } from "@/components";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset Password Page"
};

export default function ResetPasswordPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <ResetPasswordForm />
    </div>
  );
}
