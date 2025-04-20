import { ResendVerificationForm } from "@/components";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resend Verification",
  description: "Resend Verification Page"
};

export default function ResetPasswordPage() {
  return <ResendVerificationForm />;
}
