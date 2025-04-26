import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface HeaderIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export const HeaderIconButton = forwardRef<HTMLButtonElement, HeaderIconButtonProps>(
  ({ className, children, active = false, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "h-10 w-10 rounded-full",
          "flex items-center justify-center",
          "bg-muted text-foreground",
          "transition-colors duration-200",
          "hover:bg-muted-foreground/20",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          active && "bg-muted-foreground/20",
          className
        )}
        {...props}>
        {children}
      </button>
    );
  }
);

HeaderIconButton.displayName = "HeaderIconButton";
