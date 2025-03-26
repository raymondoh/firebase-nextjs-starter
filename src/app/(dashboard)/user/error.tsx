"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function UserError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("User Layout Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center max-w-md space-y-4">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Something went wrong in your dashboard.</h2>
        <p className="text-muted-foreground">Please try again. If the issue persists, contact support.</p>
        <Button onClick={() => reset()}>Try Again</Button>
      </div>
    </div>
  );
}
