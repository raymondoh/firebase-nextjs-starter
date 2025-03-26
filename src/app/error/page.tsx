import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
      <h1 className="text-2xl font-bold mb-2">Something went wrong error page</h1>
      <p className="text-muted-foreground mb-6">An unexpected error occurred. Please try again later.</p>
      <Button asChild>
        <Link href="/">Back to Homes</Link>
      </Button>
    </div>
  );
}
