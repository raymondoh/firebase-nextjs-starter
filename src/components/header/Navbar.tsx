// "use client";

// import { useState, useEffect, useRef } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { usePathname, useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { ModeToggle } from "@/components/header/ModeToggle";
// import { LayoutDashboard, Menu, Rocket, LogIn, LogOut, UserPlus } from "lucide-react";
// import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
// import { useSession, signOut } from "next-auth/react";
// import { generalNavItems, adminNavItems, type NavItem } from "@/lib/navigation";
// import { Skeleton } from "@/components/ui/skeleton";
// import { toast } from "sonner";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuGroup,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger
// } from "@/components/ui/dropdown-menu";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// const useMediaQuery = (query: string) => {
//   const [matches, setMatches] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const media = window.matchMedia(query);
//     const listener = () => setMatches(media.matches);
//     setMatches(media.matches);
//     setIsLoading(false);
//     media.addListener(listener);
//     return () => media.removeListener(listener);
//   }, [query]);

//   return { matches, isLoading };
// };

// const NavLinks = ({ setOpen, isMobile }: { setOpen?: (open: boolean) => void; isMobile: boolean }) => {
//   const pathname = usePathname();

//   const renderNavItem = (item: NavItem) => (
//     <Link
//       key={item.href}
//       href={item.href}
//       className={`flex items-center ${
//         pathname === item.href ? "text-primary" : "text-muted-foreground"
//       } p-2 hover:bg-accent rounded-md`}
//       onClick={() => setOpen?.(false)}>
//       <item.icon className="mr-2 h-4 w-4" />
//       <span>{item.title}</span>
//     </Link>
//   );

//   return (
//     <div className={`flex ${isMobile ? "flex-col space-y-4" : "space-x-4"}`}>{generalNavItems.map(renderNavItem)}</div>
//   );
// };

// export const Navbar = () => {
//   const { matches: isMobile, isLoading } = useMediaQuery("(max-width: 768px)");
//   const [open, setOpen] = useState(false);
//   const { data: session, status } = useSession();

//   if (isLoading) {
//     return <NavbarSkeleton />;
//   }

//   return (
//     <nav className="max-w-full mx-auto flex items-center justify-between py-4 px-0">
//       <div className="flex items-center space-x-4">
//         {isMobile ? (
//           <>
//             <Sheet open={open} onOpenChange={setOpen}>
//               <SheetTrigger asChild>
//                 <Button variant="ghost" size="icon">
//                   <Menu />
//                 </Button>
//               </SheetTrigger>
//               <SheetContent side="left">
//                 <SheetHeader>
//                   <SheetTitle>Menu</SheetTitle>
//                   <SheetDescription>Navigate through our app</SheetDescription>
//                 </SheetHeader>
//                 <div className="py-4">
//                   <NavLinks setOpen={setOpen} isMobile={true} />
//                 </div>
//               </SheetContent>
//             </Sheet>
//             <Link href="/" className="flex items-center space-x-2">
//               <Rocket size={24} />
//             </Link>
//           </>
//         ) : (
//           <>
//             <Link href="/" className="flex items-center space-x-2">
//               <Rocket size={24} />
//               <span className="text-xl font-bold">AppName</span>
//             </Link>
//             <NavLinks isMobile={false} />
//           </>
//         )}
//       </div>
//       <div className="flex items-center space-x-4">
//         <ModeToggle />
//         <UserMenu />
//       </div>
//     </nav>
//   );
// };

// // Helper function to get initials from name
// const getInitials = (name: string | null | undefined): string => {
//   if (!name) return "U";

//   const parts = name.split(" ");
//   if (parts.length === 1) return name.charAt(0).toUpperCase();

//   return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
// };

// const UserMenu = () => {
//   const { data: session, status, update } = useSession();
//   const router = useRouter();
//   const [isSigningOut, setIsSigningOut] = useState(false);
//   const hasCheckedSession = useRef(false);
//   const pathname = usePathname();

//   // Check for account deletion cookie
//   useEffect(() => {
//     const checkAccountDeleted = () => {
//       if (typeof document !== "undefined") {
//         const cookies = document.cookie.split(";");
//         const hasDeletedCookie = cookies.some(cookie => cookie.trim().startsWith("account-deleted="));

//         if (hasDeletedCookie) {
//           // Clear the cookie
//           document.cookie = "account-deleted=; Max-Age=-1; path=/;";

//           // Force refresh the page to ensure clean state
//           window.location.reload();
//         }
//       }
//     };

//     checkAccountDeleted();
//   }, []);

//   // Only check session once when component mounts or when pathname changes
//   useEffect(() => {
//     // Skip if we've already checked the session and we're not changing pages
//     if (hasCheckedSession.current) return;

//     const checkSession = async () => {
//       try {
//         // This will trigger a session refresh
//         await update();
//         hasCheckedSession.current = true;
//       } catch (error) {
//         console.error("Error refreshing session:", error);
//       }
//     };

//     checkSession();
//   }, [update, pathname]);

//   // Reset the check flag when pathname changes
//   useEffect(() => {
//     hasCheckedSession.current = false;
//   }, [pathname]);

//   // Listen for storage events to detect session changes across tabs
//   useEffect(() => {
//     const handleStorageChange = (event: StorageEvent) => {
//       if (event.key?.includes("session") || event.key?.includes("token")) {
//         // Force update the session
//         update();
//       }
//     };

//     window.addEventListener("storage", handleStorageChange);
//     return () => window.removeEventListener("storage", handleStorageChange);
//   }, [update]);

//   const handleSignOut = async () => {
//     if (isSigningOut) return; // Prevent double-clicks

//     setIsSigningOut(true);
//     try {
//       const result = await signOut({ redirect: false, callbackUrl: "/" });
//       router.push(result?.url || "/");
//       toast("You are now signed out.");
//     } catch (error) {
//       console.error("Error signing out:", error);
//       toast.error("An error occurred while signing out");
//     } finally {
//       setIsSigningOut(false);
//     }
//   };

//   const handleNavigation = (href: string) => {
//     router.push(href);
//   };

//   // Get user initials for the avatar fallback
//   const userInitials = getInitials(session?.user?.name);

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 p-0">
//           <Avatar>
//             {session?.user?.image ? (
//               <div className="relative aspect-square h-full w-full">
//                 <Image
//                   src={session.user.image || "/placeholder.svg"}
//                   alt={session.user.name || "User"}
//                   fill
//                   className="object-cover"
//                   priority
//                 />
//               </div>
//             ) : (
//               <AvatarFallback className="bg-primary text-primary-foreground">{userInitials}</AvatarFallback>
//             )}
//           </Avatar>
//         </Button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent align="end" className="w-56">
//         <DropdownMenuLabel className="flex items-center gap-2 p-4">
//           <Avatar className="h-8 w-8">
//             {session?.user?.image ? (
//               <div className="relative aspect-square h-full w-full">
//                 <Image
//                   src={session.user.image || "/placeholder.svg"}
//                   alt={session.user.name || "User"}
//                   fill
//                   className="object-cover"
//                 />
//               </div>
//             ) : (
//               <AvatarFallback className="bg-primary text-primary-foreground">{userInitials}</AvatarFallback>
//             )}
//           </Avatar>
//           <div className="flex flex-col">
//             <span className="font-medium">{session?.user?.name || session?.user?.email || "Guest"}</span>
//             {session?.user?.email && session?.user?.name && (
//               <span className="text-xs text-muted-foreground truncate max-w-[150px]">{session.user.email}</span>
//             )}
//           </div>
//         </DropdownMenuLabel>
//         <DropdownMenuSeparator />
//         {status === "loading" ? (
//           <DropdownMenuItem disabled>
//             <Skeleton className="h-4 w-full" />
//           </DropdownMenuItem>
//         ) : session?.user ? (
//           <>
//             <DropdownMenuGroup>
//               {session.user.role === "admin" ? (
//                 adminNavItems.map(item => (
//                   <DropdownMenuItem key={item.href} onClick={() => handleNavigation(item.href)}>
//                     <item.icon className="mr-2 h-4 w-4" />
//                     <span>{item.title}</span>
//                   </DropdownMenuItem>
//                 ))
//               ) : (
//                 <DropdownMenuItem onClick={() => handleNavigation("/user")}>
//                   <LayoutDashboard className="mr-2 h-4 w-4" />
//                   <span>Dashboard</span>
//                 </DropdownMenuItem>
//               )}
//             </DropdownMenuGroup>
//             <DropdownMenuSeparator />
//             <DropdownMenuItem onClick={handleSignOut} disabled={isSigningOut}>
//               <LogOut className="mr-2 h-4 w-4" />
//               <span>{isSigningOut ? "Signing out..." : "Log out"}</span>
//             </DropdownMenuItem>
//           </>
//         ) : (
//           <>
//             <DropdownMenuItem onClick={() => handleNavigation("/login")}>
//               <LogIn className="mr-2 h-4 w-4" />
//               <span>Log in</span>
//             </DropdownMenuItem>
//             <DropdownMenuItem onClick={() => handleNavigation("/register")}>
//               <UserPlus className="mr-2 h-4 w-4" />
//               <span>Register</span>
//             </DropdownMenuItem>
//           </>
//         )}
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// };

// const NavbarSkeleton = () => (
//   <nav className="container mx-auto flex items-center justify-between p-4">
//     <Skeleton className="h-10 w-20" />
//     <div className="flex space-x-4">
//       <Skeleton className="h-10 w-10" />
//       <Skeleton className="h-10 w-10" />
//     </div>
//   </nav>
// );
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/header/ModeToggle";
import { LayoutDashboard, Menu, Rocket, LogIn, LogOut, UserPlus } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useSession, signOut } from "next-auth/react";
import { generalNavItems, adminNavItems, type NavItem } from "@/lib/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Track if we've already checked the session
let hasCheckedSession = false;
let lastPathname = "";
let lastSessionCheck = 0;

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    setMatches(media.matches);
    setIsLoading(false);
    media.addListener(listener);
    return () => media.removeListener(listener);
  }, [query]);

  return { matches, isLoading };
};

const NavLinks = ({ setOpen, isMobile }: { setOpen?: (open: boolean) => void; isMobile: boolean }) => {
  const pathname = usePathname();

  const renderNavItem = (item: NavItem) => (
    <Link
      key={item.href}
      href={item.href}
      className={`flex items-center ${
        pathname === item.href ? "text-primary" : "text-muted-foreground"
      } p-2 hover:bg-accent rounded-md`}
      onClick={() => setOpen?.(false)}>
      <item.icon className="mr-2 h-4 w-4" />
      <span>{item.title}</span>
    </Link>
  );

  return (
    <div className={`flex ${isMobile ? "flex-col space-y-4" : "space-x-4"}`}>{generalNavItems.map(renderNavItem)}</div>
  );
};

export const Navbar = () => {
  const { matches: isMobile, isLoading } = useMediaQuery("(max-width: 768px)");
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();

  if (isLoading) {
    return <NavbarSkeleton />;
  }

  return (
    <nav className="max-w-full mx-auto flex items-center justify-between py-4 px-0">
      <div className="flex items-center space-x-4">
        {isMobile ? (
          <>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                  <SheetDescription>Navigate through our app</SheetDescription>
                </SheetHeader>
                <div className="py-4">
                  <NavLinks setOpen={setOpen} isMobile={true} />
                </div>
              </SheetContent>
            </Sheet>
            <Link href="/" className="flex items-center space-x-2">
              <Rocket size={24} />
            </Link>
          </>
        ) : (
          <>
            <Link href="/" className="flex items-center space-x-2">
              <Rocket size={24} />
              <span className="text-xl font-bold">AppName</span>
            </Link>
            <NavLinks isMobile={false} />
          </>
        )}
      </div>
      <div className="flex items-center space-x-4">
        <ModeToggle />
        <UserMenu />
      </div>
    </nav>
  );
};

// Helper function to get initials from name
const getInitials = (name: string | null | undefined): string => {
  if (!name) return "U";

  const parts = name.split(" ");
  if (parts.length === 1) return name.charAt(0).toUpperCase();

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const UserMenu = () => {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const pathname = usePathname();
  const sessionCheckRef = useRef(false);

  // Check for account deletion cookie
  useEffect(() => {
    const checkAccountDeleted = () => {
      if (typeof document !== "undefined") {
        const cookies = document.cookie.split(";");
        const hasDeletedCookie = cookies.some(cookie => cookie.trim().startsWith("account-deleted="));

        if (hasDeletedCookie) {
          // Clear the cookie
          document.cookie = "account-deleted=; Max-Age=-1; path=/;";

          // Force refresh the page to ensure clean state
          window.location.reload();
        }
      }
    };

    checkAccountDeleted();
  }, []);

  // Only check session once when component mounts or when pathname changes
  useEffect(() => {
    // Skip if we've already checked the session for this pathname
    if (pathname === lastPathname && hasCheckedSession) {
      return;
    }

    // Throttle session checks to prevent too many in a short time
    const now = Date.now();
    if (now - lastSessionCheck < 1000) {
      // 1 second throttle
      return;
    }

    // Only update if we haven't already checked for this component instance
    if (!sessionCheckRef.current) {
      sessionCheckRef.current = true;
      lastPathname = pathname;
      lastSessionCheck = now;
      hasCheckedSession = true;

      // This will trigger a session refresh
      update().catch(error => {
        console.error("Error refreshing session:", error);
      });
    }
  }, [update, pathname]);

  // Listen for storage events to detect session changes across tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key?.includes("session") || event.key?.includes("token")) {
        // Force update the session
        update();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [update]);

  const handleSignOut = async () => {
    if (isSigningOut) return; // Prevent double-clicks

    setIsSigningOut(true);
    try {
      const result = await signOut({ redirect: false, callbackUrl: "/" });
      router.push(result?.url || "/");
      toast("You are now signed out.");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("An error occurred while signing out");
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  // Get user initials for the avatar fallback
  const userInitials = getInitials(session?.user?.name);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 p-0">
          <Avatar>
            {session?.user?.image ? (
              <div className="relative aspect-square h-full w-full">
                <Image
                  src={session.user.image || "/placeholder.svg"}
                  alt={session.user.name || "User"}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            ) : (
              <AvatarFallback className="bg-primary text-primary-foreground">{userInitials}</AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2 p-4">
          <Avatar className="h-8 w-8">
            {session?.user?.image ? (
              <div className="relative aspect-square h-full w-full">
                <Image
                  src={session.user.image || "/placeholder.svg"}
                  alt={session.user.name || "User"}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <AvatarFallback className="bg-primary text-primary-foreground">{userInitials}</AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{session?.user?.name || session?.user?.email || "Guest"}</span>
            {session?.user?.email && session?.user?.name && (
              <span className="text-xs text-muted-foreground truncate max-w-[150px]">{session.user.email}</span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {status === "loading" ? (
          <DropdownMenuItem disabled>
            <Skeleton className="h-4 w-full" />
          </DropdownMenuItem>
        ) : session?.user ? (
          <>
            <DropdownMenuGroup>
              {session.user.role === "admin" ? (
                adminNavItems.map(item => (
                  <DropdownMenuItem key={item.href} onClick={() => handleNavigation(item.href)}>
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{item.title}</span>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem onClick={() => handleNavigation("/user")}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} disabled={isSigningOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>{isSigningOut ? "Signing out..." : "Log out"}</span>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem onClick={() => handleNavigation("/login")}>
              <LogIn className="mr-2 h-4 w-4" />
              <span>Log in</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNavigation("/register")}>
              <UserPlus className="mr-2 h-4 w-4" />
              <span>Register</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const NavbarSkeleton = () => (
  <nav className="container mx-auto flex items-center justify-between p-4">
    <Skeleton className="h-10 w-20" />
    <div className="flex space-x-4">
      <Skeleton className="h-10 w-10" />
      <Skeleton className="h-10 w-10" />
    </div>
  </nav>
);
