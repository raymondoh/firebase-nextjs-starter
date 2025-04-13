//src/(auth)/login.tsx
import { LoginForm } from "@/components";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account"
};

export default function LoginPage() {
  return (
    <div className="container mx-auto max-w-md mt-10">
      <LoginForm />
    </div>
  );
}
