//src/(auth)/login.tsx
import { LoginForm } from "@/components";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account"
};

export default function LoginPage() {
  return <LoginForm />;
}
