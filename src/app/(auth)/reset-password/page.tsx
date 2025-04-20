import { ResetPasswordForm } from "@/components";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset Password Page"
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
