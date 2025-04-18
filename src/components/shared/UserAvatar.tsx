// src/components/shared/UserAvatar.tsx

"use client";

import Image from "next/image";
import { cn } from "@/lib/utils"; // if you're using shadcn
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/utils/get-initials";
import { User } from "lucide-react";
interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  email?: string | null;
  className?: string;
}

export function UserAvatar({ src, name, email, className }: UserAvatarProps) {
  return (
    <Avatar className={cn("h-10 w-10", className)}>
      {src ? (
        <div className="relative h-full w-full rounded-full overflow-hidden">
          <Image
            src={src || "/placeholder.svg"}
            alt={name || email || "User"}
            fill
            className="object-cover"
            sizes="40px"
          />
        </div>
      ) : (
        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
          {name || email ? getInitials(name, email) : <User className="h-4 w-4 text-muted-foreground" />}
        </AvatarFallback>
      )}
    </Avatar>
  );
}
