import type { Metadata } from "next";
import { RegisterForm } from "@/components";

export const metadata: Metadata = {
  title: "Register",
  description: "Register for an account"
};

export default function RegisterPage() {
  return (
    <div className="container mx-auto max-w-md mt-10">
      <RegisterForm />
    </div>
  );
}
