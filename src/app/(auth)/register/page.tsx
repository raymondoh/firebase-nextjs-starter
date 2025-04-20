import type { Metadata } from "next";
import { RegisterForm } from "@/components";

export const metadata: Metadata = {
  title: "Register",
  description: "Register for an account"
};

export default function RegisterPage() {
  return <RegisterForm />;
}
