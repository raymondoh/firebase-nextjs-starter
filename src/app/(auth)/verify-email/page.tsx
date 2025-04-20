import type { Metadata } from "next";
import { VerifyEmailForm } from "@/components";

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Verify your account"
};

export default function VerifyEmailPage() {
  return <VerifyEmailForm />;
}
