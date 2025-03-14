// "use client";
// import { Moon, Sun } from "lucide-react";
// import { useTheme } from "next-themes";

// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger
// } from "@/components/ui/dropdown-menu";

// export function ModeToggle() {
//   const { setTheme } = useTheme();

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button
//           variant="ghost"
//           size="icon"
//           className="border-0 hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0">
//           <Sun className="h-[2.5rem] w-[2.5rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
//           <Moon className="absolute h-[2.5rem] w-[2.5rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
//           <span className="sr-only">Toggle theme</span>
//         </Button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent align="end">
//         <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
//         <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
//         <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// }
"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="!h-14 !w-14 !p-0 !min-w-14 !min-h-14 border-0 hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0">
          <Sun className="!h-8 !w-8 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute !h-8 !w-8 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="text-base">
        <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer py-2">
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer py-2">
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer py-2">
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
