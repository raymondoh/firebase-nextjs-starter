// components/auth/AuthModal.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export function AuthModal({ children }: { children: React.ReactNode }) {
  const overlay = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        router.back(); // This is the recommended way to close the modal
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  const handleClick = (e: React.MouseEvent) => {
    if (e.target === overlay.current) {
      router.back(); // This is the recommended way to close the modal
    }
  };

  return (
    <div
      ref={overlay}
      onClick={handleClick}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <div className="max-w-md w-full mx-auto animate-in fade-in zoom-in duration-300">{children}</div>
    </div>
  );
}
