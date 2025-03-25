// "use client";

// import type React from "react";
// import { useState, useEffect } from "react";
// import { Loader2, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { useActionState } from "react";
// import { updatePassword } from "@/actions"; // Updated function name
// import { toast } from "sonner";
// import type { UpdatePasswordState } from "@/types"; // Updated type name

// export function ChangePasswordForm() {
//   const [currentPassword, setCurrentPassword] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");

//   const [showCurrentPassword, setShowCurrentPassword] = useState(false);
//   const [showNewPassword, setShowNewPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   // Initialize with a valid state object instead of null
//   const [state, action, isPending] = useActionState<UpdatePasswordState, FormData>(updatePassword, {
//     success: false
//   });
//   const [showSuccess, setShowSuccess] = useState(false);

//   // Handle form submission result
//   useEffect(() => {
//     if (state) {
//       if (state.success) {
//         setShowSuccess(true);
//         toast.success("Password updated successfully");

//         // Reset form after success
//         setCurrentPassword("");
//         setNewPassword("");
//         setConfirmPassword("");

//         // Hide success message after a delay
//         setTimeout(() => {
//           setShowSuccess(false);
//         }, 5000);
//       } else if (state.error) {
//         toast.error(state.error);
//       }
//     }
//   }, [state]);

//   // Client-side validation
//   const validateForm = () => {
//     if (newPassword !== confirmPassword) {
//       toast.error("New passwords do not match");
//       return false;
//     }

//     if (newPassword.length < 8) {
//       toast.error("Password must be at least 8 characters long");
//       return false;
//     }

//     return true;
//   };

//   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//     if (!validateForm()) {
//       e.preventDefault();
//     }
//   };

//   return (
//     <div style={{ border: "none" }}>
//       {state?.error && (
//         <Alert variant="destructive" className="mb-4">
//           <AlertCircle className="h-4 w-4" />
//           <AlertDescription>{state.error}</AlertDescription>
//         </Alert>
//       )}

//       {showSuccess && (
//         <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
//           <CheckCircle className="h-4 w-4 text-green-600" />
//           <AlertDescription>Your password has been updated successfully.</AlertDescription>
//         </Alert>
//       )}

//       <form action={action} onSubmit={handleSubmit} className="space-y-4" style={{ border: "none" }}>
//         <div className="space-y-2" style={{ border: "none" }}>
//           <Label htmlFor="currentPassword">Current Password</Label>
//           <div className="relative" style={{ border: "none" }}>
//             <Input
//               id="currentPassword"
//               name="currentPassword"
//               type={showCurrentPassword ? "text" : "password"}
//               placeholder="Enter your current password"
//               required
//               value={currentPassword}
//               onChange={e => setCurrentPassword(e.target.value)}
//             />
//             <Button
//               type="button"
//               variant="ghost"
//               size="sm"
//               className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
//               onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
//               {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//             </Button>
//           </div>
//         </div>

//         <div className="space-y-2" style={{ border: "none" }}>
//           <Label htmlFor="newPassword">New Password</Label>
//           <div className="relative" style={{ border: "none" }}>
//             <Input
//               id="newPassword"
//               name="newPassword"
//               type={showNewPassword ? "text" : "password"}
//               placeholder="Enter your new password"
//               required
//               value={newPassword}
//               onChange={e => setNewPassword(e.target.value)}
//             />
//             <Button
//               type="button"
//               variant="ghost"
//               size="sm"
//               className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
//               onClick={() => setShowNewPassword(!showNewPassword)}>
//               {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//             </Button>
//           </div>
//           <p className="text-sm text-muted-foreground">
//             Password must be 8-72 characters long and contain at least one uppercase letter, one lowercase letter, one
//             number, and one special character.
//           </p>
//         </div>

//         <div className="space-y-2" style={{ border: "none" }}>
//           <Label htmlFor="confirmPassword">Confirm New Password</Label>
//           <div className="relative" style={{ border: "none" }}>
//             <Input
//               id="confirmPassword"
//               name="confirmPassword"
//               type={showConfirmPassword ? "text" : "password"}
//               placeholder="Confirm your new password"
//               required
//               value={confirmPassword}
//               onChange={e => setConfirmPassword(e.target.value)}
//             />
//             <Button
//               type="button"
//               variant="ghost"
//               size="sm"
//               className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
//               onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
//               {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//             </Button>
//           </div>
//         </div>

//         <Button type="submit" disabled={isPending}>
//           {isPending ? (
//             <>
//               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//               Updating Password...
//             </>
//           ) : (
//             "Update Password"
//           )}
//         </Button>
//       </form>
//     </div>
//   );
// }
"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Loader2, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useActionState } from "react";
import { updatePassword } from "@/actions";
import { toast } from "sonner";
import type { UpdatePasswordState } from "@/types";
import { firebaseError, isFirebaseError } from "@/utils/firebase-error";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [state, action, isPending] = useActionState<UpdatePasswordState, FormData>(updatePassword, {
    success: false
  });

  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (state) {
      if (state.success) {
        setShowSuccess(true);
        toast.success("Password updated successfully");

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        setTimeout(() => setShowSuccess(false), 5000);
      } else if (state.error) {
        const errorMessage = isFirebaseError(state.error)
          ? firebaseError(state.error)
          : typeof state.error === "string"
          ? state.error
          : "An unexpected error occurred.";

        toast.error(errorMessage);
      }
    }
  }, [state]);

  const validateForm = () => {
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return false;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!validateForm()) {
      e.preventDefault();
    }
  };

  return (
    <div>
      {state?.error && typeof state.error === "string" && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {showSuccess && (
        <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>Your password has been updated successfully.</AlertDescription>
        </Alert>
      )}

      <form action={action} onSubmit={handleSubmit} className="space-y-4">
        <PasswordInput
          id="currentPassword"
          label="Current Password"
          value={currentPassword}
          onChange={setCurrentPassword}
          show={showCurrentPassword}
          setShow={setShowCurrentPassword}
        />

        <PasswordInput
          id="newPassword"
          label="New Password"
          value={newPassword}
          onChange={setNewPassword}
          show={showNewPassword}
          setShow={setShowNewPassword}
        />
        <p className="text-sm text-muted-foreground -mt-2">
          Password must be 8-72 characters long and contain at least one uppercase letter, one lowercase letter, one
          number, and one special character.
        </p>

        <PasswordInput
          id="confirmPassword"
          label="Confirm New Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          show={showConfirmPassword}
          setShow={setShowConfirmPassword}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating Password...
            </>
          ) : (
            "Update Password"
          )}
        </Button>
      </form>
    </div>
  );
}

function PasswordInput({
  id,
  label,
  value,
  onChange,
  show,
  setShow
}: {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  show: boolean;
  setShow: (val: boolean) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          name={id}
          type={show ? "text" : "password"}
          placeholder={label}
          required
          value={value}
          onChange={e => onChange(e.target.value)}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShow(!show)}>
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
