import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { auth } from "@/auth";

export default async function UserLayout({ children }: { children: ReactNode }) {
  try {
    const session = await auth();

    console.log("User layout - Session data:", {
      exists: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userRole: session?.user?.role
    });

    if (!session) {
      console.log("User layout - No session, redirecting to login");
      redirect("/login");
    }

    if (session.user?.role === "admin") {
      redirect("/admin");
    }
    if (!["admin", "user"].includes(session.user?.role)) {
      console.error(`Unknown role "${session.user?.role}"`);
      redirect("/not-authorized");
    }

    console.log("User layout - Access granted - rendering user layout");

    return (
      <SidebarInset className="w-full max-w-8xl">
        <header className="flex h-16 items-center gap-2 border-b px-4 sticky top-0 bg-background z-10 w-full">
          <SidebarTrigger className="-ml-1" />
          <h1 className="font-semibold">User Dashboard</h1>
        </header>
        <div className="w-full mx-auto  px-6 py-4">{children}</div>
      </SidebarInset>
    );
  } catch (error) {
    console.error("Error in UserLayout:", error);
    redirect("/error");
  }
}
