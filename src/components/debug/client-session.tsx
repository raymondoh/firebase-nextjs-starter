// src/components/debug/client-session.tsx
"use client";

import { useSession } from "next-auth/react";

function ClientSessionDebugDevOnly() {
  const { data: session, status } = useSession();

  return (
    <div className="mt-8 border p-4 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Client-Side Session</h2>

      <div className="mb-4">
        <p>
          <strong>Status:</strong> {status}
        </p>
      </div>

      <pre className="bg-gray-100 text-black p-4 rounded overflow-auto max-h-96">
        {JSON.stringify(session, null, 2)}
      </pre>
    </div>
  );
}

export const ClientSessionDebug = process.env.NODE_ENV === "development" ? ClientSessionDebugDevOnly : () => null;
