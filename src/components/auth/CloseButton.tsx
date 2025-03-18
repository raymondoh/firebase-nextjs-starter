"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function CloseButton() {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 p-0 rounded-full hover:bg-muted"
      onClick={() => router.push("/")}
      aria-label="Close">
      <X className="h-4 w-4" />
    </Button>
  );
}
