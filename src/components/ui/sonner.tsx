// "use client"

// import { useTheme } from "next-themes"
// import { Toaster as Sonner } from "sonner"

// type ToasterProps = React.ComponentProps<typeof Sonner>

// const Toaster = ({ ...props }: ToasterProps) => {
//   const { theme = "system" } = useTheme()

//   return (
//     <Sonner
//       theme={theme as ToasterProps["theme"]}
//       className="toaster group"
//       toastOptions={{
//         classNames: {
//           toast:
//             "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
//           description: "group-[.toast]:text-muted-foreground",
//           actionButton:
//             "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
//           cancelButton:
//             "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
//         },
//       }}
//       {...props}
//     />
//   )
// }

// export { Toaster }
"use client";

import type React from "react";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:text-base max-sm:group-[.toaster]:w-[calc(100vw-32px)] sm:group-[.toaster]:max-w-[380px]",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-sm",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:text-sm group-[.toast]:px-3 group-[.toast]:py-2",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:text-sm group-[.toast]:px-3 group-[.toast]:py-2"
        },
        style: {
          fontSize: "1.125rem",
          padding: "16px",
          borderRadius: "8px"
          // Removed fixed width to allow responsive classes to control width
        }
      }}
      {...props}
    />
  );
};

export { Toaster };
