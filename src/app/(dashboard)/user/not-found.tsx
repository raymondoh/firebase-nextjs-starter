// import Link from "next/link";
// import { FileQuestion } from "lucide-react";
// import { Button } from "@/components/ui/button";

// export default function UserNotFound() {
//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-background">
//       <div className="text-center">
//         <FileQuestion className="mx-auto h-16 w-16 text-muted-foreground" />
//         <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
//           404 - User Page Not Found
//         </h1>
//         <p className="mt-4 text-base text-muted-foreground">
//           Sorry, we couldn't find the user page you're looking for.
//         </p>
//         <div className="mt-10">
//           <Button asChild>
//             <Link href="/user">Go to User Dashboard</Link>
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

export default function UserNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <ShieldAlert className="h-12 w-12 text-yellow-500 mb-4" />
      <h1 className="text-2xl font-bold">User Page Not Found</h1>
      <p className="text-muted-foreground">The page you were trying to access doesn’t exist or is unavailable.</p>
      <div className="mt-6 flex gap-4">
        <Button asChild variant="outline">
          <Link href="/">Return Home</Link>
        </Button>
        <Button asChild>
          <Link href="/login">Go to Login</Link>
        </Button>
      </div>
    </div>
  );
}
