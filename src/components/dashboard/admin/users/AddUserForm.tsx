// "use client";

// import type React from "react";
// import { useState, useRef } from "react";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { toast } from "sonner";
// import { createUser } from "@/actions/user/admin";
// import { firebaseError, isFirebaseError } from "@/utils/firebase-error";
// import type { UserRole } from "@/types/user";
// import { SubmitButton } from "@/components/shared/SubmitButton";

// interface AddUserFormProps {
//   onSuccess?: () => void;
//   onClose?: () => void;
//   isAdmin?: boolean;
// }

// export function AddUserForm({ onSuccess, onClose }: AddUserFormProps) {
//   const [isLoading, setIsLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     role: "user" as UserRole
//   });

//   const nameInputRef = useRef<HTMLInputElement>(null);

//   const handleChange = (field: "name" | "email" | "password" | "role", value: string) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
//   };

//   const resetForm = () => {
//     setFormData({ name: "", email: "", password: "", role: "user" });
//     nameInputRef.current?.focus();
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!formData.email) {
//       toast.error("Email is required");
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const result = await createUser(formData);
//       if (result.success) {
//         toast.success("User created successfully");
//         resetForm();
//         onSuccess?.();
//         onClose?.();
//       } else {
//         toast.error(result.error || "Failed to create user.");
//       }
//     } catch (error) {
//       const message = isFirebaseError(error) ? firebaseError(error) : "An unexpected error occurred";
//       console.error("Error creating user:", error);
//       toast.error(message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="grid gap-4 py-4">
//       <div className="grid grid-cols-4 items-center gap-4">
//         <Label htmlFor="name" className="text-right">
//           Name
//         </Label>
//         <Input
//           id="name"
//           ref={nameInputRef}
//           value={formData.name}
//           onChange={e => handleChange("name", e.target.value)}
//           className="col-span-3"
//         />
//       </div>
//       <div className="grid grid-cols-4 items-center gap-4">
//         <Label htmlFor="email" className="text-right">
//           Email
//         </Label>
//         <Input
//           id="email"
//           type="email"
//           required
//           value={formData.email}
//           onChange={e => handleChange("email", e.target.value)}
//           className="col-span-3"
//         />
//       </div>
//       <div className="grid grid-cols-4 items-center gap-4">
//         <Label htmlFor="password" className="text-right">
//           Password
//         </Label>
//         <Input
//           id="password"
//           type="password"
//           required
//           value={formData.password}
//           onChange={e => handleChange("password", e.target.value)}
//           className="col-span-3"
//         />
//       </div>
//       <div className="grid grid-cols-4 items-center gap-4">
//         <Label htmlFor="role" className="text-right">
//           Role
//         </Label>
//         <Select value={formData.role} onValueChange={value => handleChange("role", value as UserRole)}>
//           <SelectTrigger className="col-span-3">
//             <SelectValue placeholder="Select role" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="admin">Admin</SelectItem>
//             <SelectItem value="moderator">Moderator</SelectItem>
//             <SelectItem value="user">User</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>
//       <div className="flex justify-end">
//         <SubmitButton isLoading={isLoading} loadingText="Creating..." className="min-w-[140px]">
//           Create User
//         </SubmitButton>
//       </div>
//     </form>
//   );
// }
"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubmitButton } from "@/components/shared/SubmitButton";
import { toast } from "sonner";
import { createUser } from "@/actions/user/admin";
import { isFirebaseError, firebaseError } from "@/utils/firebase-error";
import type { UserRole } from "@/types/user";
import { Button } from "@/components/ui/button";

interface AddUserFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

export function AddUserForm({ onSuccess, onClose }: AddUserFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user" as UserRole
  });

  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", password: "", role: "user" });
    nameInputRef.current?.focus();
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!validateEmail(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const result = await createUser(formData);

      if (result.success) {
        toast.success(`User "${formData.name}" created successfully`);
        resetForm();
        onSuccess?.();
        onClose?.();
      } else {
        toast.error(result.error || "Failed to create user");
      }
    } catch (error) {
      const message = isFirebaseError(error)
        ? firebaseError(error)
        : error instanceof Error
        ? error.message
        : "An unexpected error occurred";

      console.error("[AddUserForm Error]:", error);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 py-4">
      {/* Name */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">
          Name
        </Label>
        <Input
          id="name"
          ref={nameInputRef}
          value={formData.name}
          onChange={e => handleChange("name", e.target.value)}
          placeholder="Enter full name"
          className="col-span-3"
          required
        />
      </div>

      {/* Email */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="email" className="text-right">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={e => handleChange("email", e.target.value)}
          placeholder="example@email.com"
          className="col-span-3"
          required
        />
      </div>

      {/* Password */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="password" className="text-right">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={e => handleChange("password", e.target.value)}
          placeholder="At least 6 characters"
          className="col-span-3"
          required
          minLength={6}
        />
      </div>

      {/* Role */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="role" className="text-right">
          Role
        </Label>
        <Select value={formData.role} onValueChange={value => handleChange("role", value as UserRole)}>
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="moderator">Moderator</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Buttons */}
      <div className="flex justify-end items-center gap-4 pt-2">
        {onClose && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              resetForm();
              onClose();
            }}
            disabled={isLoading}>
            Cancel
          </Button>
        )}
        <SubmitButton isLoading={isLoading} loadingText="Creating..." className="min-w-[140px]">
          Create User
        </SubmitButton>
      </div>
    </form>
  );
}
