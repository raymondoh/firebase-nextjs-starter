"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/header/ModeToggle";
import { Menu, User, Rocket, LogIn, LogOut, UserPlus } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { generalNavItems, userNavItems, adminNavItems, type NavItem } from "@/lib/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

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
  const { data: session } = useSession();

  if (isLoading) {
    return <NavbarSkeleton />;
  }

  return (
    <nav className="container mx-auto flex items-center justify-between p-4">
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

const UserMenu = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    const result = await signOut({ redirect: false, callbackUrl: "/" });
    router.push(result?.url || "/");
    setOpen(false);
    toast("You are now signed out.");
  };

  const handleNavigation = (href: string) => {
    router.push(href);
    setOpen(false);
  };

  const renderNavItem = (item: NavItem) => (
    <Button
      key={item.href}
      onClick={() => handleNavigation(item.href)}
      className="w-full flex items-center justify-start p-2 hover:bg-accent rounded-md"
      variant="ghost">
      <item.icon className="mr-2 h-4 w-4" />
      {item.title}
    </Button>
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <User />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{session?.user ? `Welcome, ${session.user.name || session.user.email}` : "User Menu"}</SheetTitle>
          <SheetDescription>
            {session?.user ? `Logged in as ${session.user.role}` : "Sign in to access your account"}
          </SheetDescription>
        </SheetHeader>
        <div className="py-4 space-y-4">
          {status === "loading" ? (
            <p>Loading...</p>
          ) : session?.user ? (
            <>
              {session.user.role === "admin" ? adminNavItems.map(renderNavItem) : userNavItems.map(renderNavItem)}
              <Button
                onClick={handleSignOut}
                className="w-full flex items-center justify-start p-2 hover:bg-accent rounded-md"
                variant="ghost">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => handleNavigation("/login")}
                className="w-full flex items-center justify-start p-2 hover:bg-accent rounded-md"
                variant="ghost">
                <LogIn className="mr-2 h-4 w-4" />
                Log in
              </Button>
              <Button
                onClick={() => handleNavigation("/register")}
                className="w-full flex items-center justify-start p-2 hover:bg-accent rounded-md"
                variant="ghost">
                <UserPlus className="mr-2 h-4 w-4" />
                Register
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
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
