// "use client";

// import { ResetPasswordForm } from "@/components";

// export default function ResetPasswordPage() {
//   return (
//     <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
//       <ResetPasswordForm />
//     </div>
//   );
// }
"use client";

import { useSearchParams } from "next/navigation";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const oobCode = searchParams.get("oobCode");

  if (!mode || !oobCode) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <p>Invalid password reset link.</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <ResetPasswordForm />
    </div>
  );
}
