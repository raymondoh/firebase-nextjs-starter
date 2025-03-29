"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeftCircle } from "lucide-react";

export default function NotFoundCatchAllPage() {
  const { data: session, status } = useSession();
  const role = session?.user?.role;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 space-y-8">
      <div className="flex flex-col items-center space-y-2">
        <AlertTriangle className="h-12 w-12 text-yellow-500" />
        <h1 className="text-3xl font-bold">Page Not Found</h1>
        <p className="text-muted-foreground max-w-md">
          The page you were looking for doesn&apos;t exist or has been moved.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        <Button asChild variant="default">
          <Link href="/">
            <ArrowLeftCircle className="mr-2 h-4 w-4" />
            Go Home
          </Link>
        </Button>

        {status === "loading" ? (
          <>
            <div className="h-10 w-48 animate-pulse rounded-md bg-muted" />
            <div className="h-10 w-48 animate-pulse rounded-md bg-muted/60" />
          </>
        ) : (
          <>
            {role === "admin" && (
              <Button asChild variant="outline">
                <Link href="/admin">
                  <ArrowLeftCircle className="mr-2 h-4 w-4" />
                  Go to Admin Dashboard
                </Link>
              </Button>
            )}

            {role === "user" && (
              <Button asChild variant="ghost">
                <Link href="/user">
                  <ArrowLeftCircle className="mr-2 h-4 w-4" />
                  Go to User Dashboard
                </Link>
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
