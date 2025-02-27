"use client";

import { useSession } from "next-auth/react";

export function SessionInfo() {
  const { data: session, status } = useSession();

  console.log("Client-side session:", session); // Add this line for debugging

  if (status === "loading") {
    return <div>Loading session...</div>;
  }

  if (!session) {
    return <div>No active session</div>;
  }

  return (
    <div>
      <h2>Session Information</h2>
      <p>Status: {status}</p>
      <p>User ID: {session.user?.id || "Not available"}</p>
      <p>Name: {session.user?.name || "Not available"}</p>
      <p>Email: {session.user?.email || "Not available"}</p>
      <p>Expires: {session.expires}</p>
      <h3>Full Session Object:</h3>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  );
}
