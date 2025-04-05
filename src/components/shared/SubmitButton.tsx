// components/shared/SubmitButton.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  children?: React.ReactNode;
}

export function SubmitButton({
  isLoading = false,
  loadingText = "Saving...",
  children = "Submit",
  className,
  ...props
}: SubmitButtonProps) {
  return (
    <Button type="submit" disabled={isLoading} className={cn("min-w-[120px]", className)} {...props}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
