import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

export default function NotAuthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="flex flex-col items-center max-w-md text-center space-y-4">
        <div className="bg-red-100 p-3 rounded-full">
          <ShieldAlert className="h-12 w-12 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">
          You don't have permission to access this page. Please contact an administrator if you believe this is an
          error.
        </p>
        <div className="flex gap-4 mt-4">
          <Button asChild variant="outline">
            <Link href="/">Return Home</Link>
          </Button>
          <Button asChild>
            <Link href="/login">Sign In with Different Account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
