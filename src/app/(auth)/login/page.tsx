import { LoginForm } from "@/components";

export default function LoginPage() {
  // Simulate a slow page load
  //await new Promise(resolve => setTimeout(resolve, 2000));
  return (
    <div className="container mx-auto max-w-md mt-10">
      <LoginForm />
    </div>
  );
}
