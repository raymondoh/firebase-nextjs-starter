import { auth } from "@/auth";

export default async function SessionChecker() {
  const session = await auth();

  // This will log to the server console
  console.log("Server-side session:", JSON.stringify(session, null, 2));

  return (
    <div>
      <h2>Session Checker</h2>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  );
}
