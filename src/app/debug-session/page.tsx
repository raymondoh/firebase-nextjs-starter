import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { ClientSessionDebug } from "@/components/debug/client-session";

export default async function DebugSessionPage() {
  // Only show this in development
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }
  // Get session using your auth helper
  const session = await auth();

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Session Debug Page</h1>

      <div className="border p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Server Session Data</h2>
        <pre className="bg-gray-100 text-black p-4 rounded overflow-auto max-h-96">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
        <div className="p-4 rounded-lg border">
          {session ? (
            <div className="text-green-600">
              <p className="font-medium">✓ Authenticated</p>
              <p>Logged in as: {session.user?.email}</p>
              <p>Role: {session.user?.role || "Not specified"}</p>
              <p>User ID: {session.user?.id}</p>
            </div>
          ) : (
            <div className="text-red-600">
              <p className="font-medium">✗ Not authenticated</p>
              <p>You are not logged in.</p>
            </div>
          )}
        </div>
      </div>

      {process.env.NODE_ENV === "development" && <ClientSessionDebug />}
    </div>
  );
}
