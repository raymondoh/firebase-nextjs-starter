import { Separator } from "@/components/ui/separator";
import { DashboardShell, DashboardHeader } from "@/components";
import { UserDetail } from "@/components/dashboard/admin";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { adminDb } from "@/firebase/admin";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

// Helper function to ensure all data is properly serialized
function serializeData(data: any) {
  // Convert Firestore timestamps to ISO strings
  const serialized = JSON.parse(
    JSON.stringify(data, (key, value) => {
      // Check if the value is a Firestore timestamp
      if (value && typeof value === "object" && value.seconds !== undefined && value.nanoseconds !== undefined) {
        // Convert to Date and then to ISO string
        return new Date(value.seconds * 1000 + value.nanoseconds / 1000000).toISOString();
      }
      // Check if it's already a Date object
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    })
  );

  return serialized;
}

export default async function UserDetailPage({ params }: { params: { id: string } }) {
  // Get the user ID from params
  const userId = params.id;

  // Get the session server-side
  const session = await auth();

  // Redirect if not authenticated
  if (!session?.user) {
    redirect("/login");
  }

  // Check if user has admin role
  const currentUserId = session.user.id;
  let isAdmin = false;

  try {
    // Fetch the user document from Firestore to check admin status
    const userDoc = await adminDb.collection("users").doc(currentUserId).get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      isAdmin = userData?.role === "admin";
    }

    // Redirect if not an admin
    if (!isAdmin) {
      redirect("/user/dashboard");
    }
  } catch (error) {
    console.error("Error checking admin status:", error);
    redirect("/user/dashboard");
  }

  // Fetch the user data
  const userDoc = await adminDb.collection("users").doc(userId).get();

  if (!userDoc.exists) {
    // User not found
    redirect("/admin/users");
  }

  const userData = userDoc.data();

  // Helper function to convert Firestore timestamp to Date
  const convertTimestamp = (timestamp: any) => {
    if (!timestamp) return null;
    if (timestamp.toDate && typeof timestamp.toDate === "function") {
      return timestamp.toDate();
    }
    return timestamp;
  };

  const user = {
    id: userDoc.id,
    name: userData?.name,
    email: userData?.email,
    role: userData?.role || "user",
    emailVerified: userData?.emailVerified || false,
    status: userData?.status || "active",
    createdAt: convertTimestamp(userData?.createdAt),
    lastLoginAt: convertTimestamp(userData?.lastLoginAt),
    updatedAt: convertTimestamp(userData?.updatedAt),
    image: userData?.image || userData?.picture,
    has2FA: userData?.has2FA || false,
    hasPassword: userData?.hasPassword || false
  };

  // Serialize the data for client components
  const serializedUser = serializeData(user);

  return (
    <DashboardShell>
      <div className="flex items-center">
        <Button variant="ghost" size="sm" className="mr-4" asChild>
          <Link href="/admin/users">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Link>
        </Button>
        <DashboardHeader
          heading={`User: ${user.name || user.email || "Unknown"}`}
          text="View and manage user details."
        />
      </div>
      <Separator className="mb-8" />

      <UserDetail user={serializedUser} />
    </DashboardShell>
  );
}
