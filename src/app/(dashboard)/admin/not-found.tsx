// import Link from "next/link";
// import { FileQuestion } from "lucide-react";
// import { Button } from "@/components/ui/button";

// export default function AdminNotFound() {
//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-background">
//       <div className="text-center">
//         <FileQuestion className="mx-auto h-16 w-16 text-muted-foreground" />
//         <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">404 - Page Not Found</h1>
//         <p className="mt-4 text-base text-muted-foreground">Sorry, we couldn't find the page you're looking for.</p>
//         <div className="mt-10">
//           <Button asChild>
//             <Link href="/admin">Go back home admin</Link>
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }
// src/app/(dashboard)/admin/not-found.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <ShieldAlert className="h-12 w-12 text-red-500 mb-4" />
      <h1 className="text-2xl font-bold">Admin Page Not Found</h1>
      <p className="text-muted-foreground">The admin page you are looking for doesn't exist.</p>
      <div className="mt-6 flex gap-4">
        <Button asChild variant="outline">
          <Link href="/">Return Home</Link>
        </Button>
        <Button asChild>
          <Link href="/login">Login</Link>
        </Button>
      </div>
    </div>
  );
}
