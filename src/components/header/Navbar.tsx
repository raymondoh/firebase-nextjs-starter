// "use client";

// import { useState, useEffect, useRef } from "react";
// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { ModeToggle } from "@/components/header/ModeToggle";
// import { LayoutDashboard, Menu, LogIn, LogOut, UserPlus } from "lucide-react";
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
// import { Logo } from "./Logo";
// import { UserAvatar } from "../shared/UserAvatar";

// // Track if we've already checked the session
// let hasCheckedSession = false;
// let lastPathname = "";
// //const lastSessionCheck = 0;

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
//       {/* removed nav icons */}
//       {/* <item.icon className="mr-2 h-4 w-4" /> */}
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
//     <nav className="container max-w-8xl mx-auto flex items-center justify-between py-4 px-0">
//       <div className="flex items-center">
//         {isMobile ? (
//           <div className="flex items-center">
//             <Sheet open={open} onOpenChange={setOpen}>
//               <SheetTrigger asChild>
//                 {/*removed margin-right on the hamburger menu - mr-0 */}
//                 {/* <Button
//                   variant="ghost"
//                   className="h-12 w-12 p-0 rounded-full bg-muted hover:bg-muted/80 mr-0"
//                   aria-label="Open menu">
//                   <Menu className="h-6 w-6 text-foreground" />
//                 </Button> */}

//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   className="h-10 w-10 p-0 rounded-full hover:bg-muted bg-muted"
//                   aria-label="Open menu">
//                   <Menu className="h-6 w-6" />
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
//             <Link href="/" className="flex items-center ml-2 mr-0">
//               <Logo className="h-10 w-10" />

//               {/* <span className="ml-3 text-xl font-bold">Firestarter</span> */}
//             </Link>
//           </div>
//         ) : (
//           <div className="flex items-center">
//             <Link href="/" className="flex items-center mr-6">
//               <Logo className="h-9 w-9" />
//               <span className="ml-3 text-xl font-bold">Firestarter</span>
//             </Link>

//             <NavLinks isMobile={false} />
//           </div>
//         )}
//       </div>
//       <div className="flex items-center space-x-2">
//         <ModeToggle />
//         {!isMobile && status !== "loading" && !session?.user ? (
//           <div className="flex items-center gap-6">
//             <Link href="/login">
//               <Button variant="secondary" size="lg">
//                 Log in
//               </Button>
//             </Link>
//             <Link href="/register">
//               <Button variant="default" size="lg">
//                 Sign up
//               </Button>
//             </Link>
//           </div>
//         ) : isMobile || session?.user ? (
//           <UserMenu isMobile={isMobile} />
//         ) : null}
//       </div>
//     </nav>
//   );
// };

// const UserMenu = ({ isMobile }: { isMobile?: boolean }) => {
//   const { data: session, status, update } = useSession();
//   const router = useRouter();
//   const [isSigningOut, setIsSigningOut] = useState(false);
//   const pathname = usePathname();

//   // Use a ref to track if we've already checked the session for this component instance
//   const sessionCheckRef = useRef(false);

//   // Add a ref to track the last time we checked the session
//   const lastSessionCheckTimeRef = useRef(0);

//   // Add a ref to track if we're currently updating the session
//   const isUpdatingSessionRef = useRef(false);

//   // Add this to the UserMenu component
//   const componentId = useRef(`user-menu-${Math.random().toString(36).substring(7)}`).current;

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
//     console.log(`[${componentId}] UserMenu session check effect triggered`, {
//       pathname,
//       hasCheckedSession,
//       lastPathname,
//       sessionCheckRef: sessionCheckRef.current,
//       isUpdatingSession: isUpdatingSessionRef.current,
//       timeSinceLastCheck: Date.now() - lastSessionCheckTimeRef.current
//     });

//     // Skip if we're already updating the session
//     if (isUpdatingSessionRef.current) {
//       console.log(`[${componentId}] Skipping session check - already updating session`);
//       return;
//     }

//     // Skip if we've already checked the session for this pathname
//     if (pathname === lastPathname && hasCheckedSession) {
//       console.log(`[${componentId}] Skipping session check - already checked for this pathname`);
//       return;
//     }

//     // Throttle session checks to prevent too many in a short time (2 seconds)
//     const now = Date.now();
//     if (now - lastSessionCheckTimeRef.current < 2000) {
//       console.log(`[${componentId}] Throttling session check - too frequent`);
//       return;
//     }

//     // Only update if we haven't already checked for this component instance
//     if (!sessionCheckRef.current) {
//       sessionCheckRef.current = true;
//       lastPathname = pathname;
//       lastSessionCheckTimeRef.current = now;
//       hasCheckedSession = true;
//       isUpdatingSessionRef.current = true;

//       console.log(`[${componentId}] Performing session check/update`);
//       // This will trigger a session refresh
//       update()
//         .then(() => {
//           console.log(`[${componentId}] Session update completed`);
//           isUpdatingSessionRef.current = false;
//         })
//         .catch(error => {
//           console.error(`[${componentId}] Error refreshing session:`, error);
//           isUpdatingSessionRef.current = false;
//         });
//     }
//   }, [update, pathname, componentId]);

//   // Listen for storage events to detect session changes across tabs
//   useEffect(() => {
//     const handleStorageChange = (event: StorageEvent) => {
//       console.log(`[${componentId}] Storage event detected:`, event.key);
//       if (event.key?.includes("session") || event.key?.includes("token")) {
//         console.log(`[${componentId}] Session-related storage change, updating session`);
//         // Force update the session
//         update();
//       }
//     };

//     window.addEventListener("storage", handleStorageChange);
//     return () => window.removeEventListener("storage", handleStorageChange);
//   }, [update, componentId]);

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

//   const handleNavigation = (path: string) => {
//     console.log("Navigating to:", path);
//     router.push(path);
//   };

//   // Get user initials for the avatar fallback
//   //const userInitials = getInitials(session?.user?.name);
//   const user = session?.user;

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         {/* <Button
//           variant="ghost"
//           size="icon"
//           className="h-12 w-12 p-2 rounded-full hover:ring-offset-0 focus:ring-offset-0 hover:outline-offset-1">
//           <UserAvatar src={user?.image} name={user?.name} email={user?.email} className="h-8 w-8" />
//         </Button> */}
//         <Button
//           variant="ghost"
//           size="icon"
//           className="h-12 w-12 p-2 rounded-full bg-muted text-foreground hover:bg-muted-foreground/20 hover:ring-offset-0 focus:ring-offset-0 hover:outline-offset-1">
//           <UserAvatar src={user?.image} name={user?.name} email={user?.email} className="h-8 w-8" />
//         </Button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent align="end" className="w-64">
//         <DropdownMenuLabel className="flex items-center gap-3 p-4">
//           <div className="flex flex-col">
//             <span className="font-medium text-base">{session?.user?.name || session?.user?.email || "Guest"}</span>
//             {session?.user?.email && session?.user?.name && (
//               <span className="text-xs text-muted-foreground truncate max-w-[180px]">{session.user.email}</span>
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
//                   <DropdownMenuItem key={item.href} onClick={() => handleNavigation(item.href)} className="py-3">
//                     <item.icon className="mr-3 h-5 w-5" />
//                     <span className="text-base">{item.title}</span>
//                   </DropdownMenuItem>
//                 ))
//               ) : (
//                 <DropdownMenuItem onClick={() => handleNavigation("/user")} className="py-3">
//                   <LayoutDashboard className="mr-3 h-5 w-5" />
//                   <span className="text-base">Dashboard</span>
//                 </DropdownMenuItem>
//               )}
//             </DropdownMenuGroup>
//             <DropdownMenuSeparator />
//             <DropdownMenuItem onClick={handleSignOut} disabled={isSigningOut} className="py-3">
//               <LogOut className="mr-3 h-5 w-5" />
//               <span className="text-base">{isSigningOut ? "Signing out..." : "Log out"}</span>
//             </DropdownMenuItem>
//           </>
//         ) : (
//           <>
//             {/* Only show these in mobile view since desktop shows them in the header */}
//             {isMobile && (
//               <>
//                 <Link href="/login" passHref>
//                   <DropdownMenuItem className="py-3">
//                     <LogIn className="mr-3 h-5 w-5" />
//                     <span className="text-base">Log in</span>
//                   </DropdownMenuItem>
//                 </Link>
//                 <Link href="/register" passHref>
//                   <DropdownMenuItem className="py-3 font-medium">
//                     <UserPlus className="mr-3 h-5 w-5" />
//                     <span className="text-base">Sign up</span>
//                   </DropdownMenuItem>
//                 </Link>
//               </>
//             )}
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
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/header/ModeToggle";
import { LayoutDashboard, Menu, LogIn, LogOut, UserPlus } from "lucide-react";
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
import { Logo } from "./Logo";
import { UserAvatar } from "../shared/UserAvatar";
import { HeaderIconButton } from "./header-icon-button";

// Track if we've already checked the session
let hasCheckedSession = false;
let lastPathname = "";

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
    <nav className="container max-w-8xl mx-auto flex items-center justify-between py-4 px-0">
      <div className="flex items-center">
        {isMobile ? (
          <div className="flex items-center">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <HeaderIconButton aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </HeaderIconButton>
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
            <Link href="/" className="flex items-center ml-2 mr-0">
              <Logo className="h-8 w-8" />
            </Link>
          </div>
        ) : (
          <div className="flex items-center">
            <Link href="/" className="flex items-center mr-6">
              <Logo className="h-9 w-9" />
              <span className="ml-3 text-xl font-bold">Firestarter</span>
            </Link>

            <NavLinks isMobile={false} />
          </div>
        )}
      </div>
      <div className="flex items-center space-x-2 md:space-x-6">
        <ModeToggle />
        {!isMobile && status !== "loading" && !session?.user ? (
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="secondary" size="lg">
                Log in
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="default" size="lg">
                Sign up
              </Button>
            </Link>
          </div>
        ) : isMobile || session?.user ? (
          <UserMenu isMobile={isMobile} />
        ) : null}
      </div>
    </nav>
  );
};

const UserMenu = ({ isMobile }: { isMobile?: boolean }) => {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const pathname = usePathname();
  const sessionCheckRef = useRef(false);
  const lastSessionCheckTimeRef = useRef(0);
  const isUpdatingSessionRef = useRef(false);
  const componentId = useRef(`user-menu-${Math.random().toString(36).substring(7)}`).current;

  // Check for account deletion cookie
  useEffect(() => {
    const checkAccountDeleted = () => {
      if (typeof document !== "undefined") {
        const cookies = document.cookie.split(";");
        const hasDeletedCookie = cookies.some(cookie => cookie.trim().startsWith("account-deleted="));

        if (hasDeletedCookie) {
          document.cookie = "account-deleted=; Max-Age=-1; path=/;";
          window.location.reload();
        }
      }
    };

    checkAccountDeleted();
  }, []);

  // Session check effect
  useEffect(() => {
    console.log(`[${componentId}] UserMenu session check effect triggered`, {
      pathname,
      hasCheckedSession,
      lastPathname,
      sessionCheckRef: sessionCheckRef.current,
      isUpdatingSession: isUpdatingSessionRef.current,
      timeSinceLastCheck: Date.now() - lastSessionCheckTimeRef.current
    });

    if (isUpdatingSessionRef.current) {
      console.log(`[${componentId}] Skipping session check - already updating session`);
      return;
    }

    if (pathname === lastPathname && hasCheckedSession) {
      console.log(`[${componentId}] Skipping session check - already checked for this pathname`);
      return;
    }

    const now = Date.now();
    if (now - lastSessionCheckTimeRef.current < 2000) {
      console.log(`[${componentId}] Throttling session check - too frequent`);
      return;
    }

    if (!sessionCheckRef.current) {
      sessionCheckRef.current = true;
      lastPathname = pathname;
      lastSessionCheckTimeRef.current = now;
      hasCheckedSession = true;
      isUpdatingSessionRef.current = true;

      console.log(`[${componentId}] Performing session check/update`);
      update()
        .then(() => {
          console.log(`[${componentId}] Session update completed`);
          isUpdatingSessionRef.current = false;
        })
        .catch(error => {
          console.error(`[${componentId}] Error refreshing session:`, error);
          isUpdatingSessionRef.current = false;
        });
    }
  }, [update, pathname, componentId]);

  // Storage event listener
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      console.log(`[${componentId}] Storage event detected:`, event.key);
      if (event.key?.includes("session") || event.key?.includes("token")) {
        console.log(`[${componentId}] Session-related storage change, updating session`);
        update();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [update, componentId]);

  const handleSignOut = async () => {
    if (isSigningOut) return;

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

  const handleNavigation = (path: string) => {
    console.log("Navigating to:", path);
    router.push(path);
  };

  const user = session?.user;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <HeaderIconButton>
          <UserAvatar src={user?.image} name={user?.name} email={user?.email} className="h-8 w-8" />
        </HeaderIconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-3 p-4">
          <div className="flex flex-col">
            <span className="font-medium text-base">{session?.user?.name || session?.user?.email || "Guest"}</span>
            {session?.user?.email && session?.user?.name && (
              <span className="text-xs text-muted-foreground truncate max-w-[180px]">{session.user.email}</span>
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
                  <DropdownMenuItem key={item.href} onClick={() => handleNavigation(item.href)} className="py-3">
                    <item.icon className="mr-3 h-5 w-5" />
                    <span className="text-base">{item.title}</span>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem onClick={() => handleNavigation("/user")} className="py-3">
                  <LayoutDashboard className="mr-3 h-5 w-5" />
                  <span className="text-base">Dashboard</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} disabled={isSigningOut} className="py-3">
              <LogOut className="mr-3 h-5 w-5" />
              <span className="text-base">{isSigningOut ? "Signing out..." : "Log out"}</span>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            {isMobile && (
              <>
                <Link href="/login" passHref>
                  <DropdownMenuItem className="py-3">
                    <LogIn className="mr-3 h-5 w-5" />
                    <span className="text-base">Log in</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/register" passHref>
                  <DropdownMenuItem className="py-3 font-medium">
                    <UserPlus className="mr-3 h-5 w-5" />
                    <span className="text-base">Sign up</span>
                  </DropdownMenuItem>
                </Link>
              </>
            )}
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
