"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createUser } from "@/actions/user/admin";
import { firebaseError, isFirebaseError } from "@/utils/firebase-error";
import type { UserRole } from "@/types/user";

interface AddUserFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
  isAdmin?: boolean;
}

export function AddUserForm({ onSuccess, onClose }: AddUserFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user" as UserRole
  });

  const handleChange = (field: "name" | "email" | "password" | "role", value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email) {
      toast.error("Email is required");
      return;
    }

    setIsLoading(true);
    try {
      const result = await createUser(formData);
      if (result.success) {
        toast.success("User created successfully");
        setFormData({ name: "", email: "", password: "", role: "user" });
        onSuccess?.();
        onClose?.();
      } else {
        toast.error(result.error || "Failed to create user.");
      }
    } catch (error) {
      const message = isFirebaseError(error) ? firebaseError(error) : "An unexpected error occurred";
      console.error("Error creating user:", error);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">
          Name
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={e => handleChange("name", e.target.value)}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="email" className="text-right">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          required
          value={formData.email}
          onChange={e => handleChange("email", e.target.value)}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="password" className="text-right">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          required
          value={formData.password}
          onChange={e => handleChange("password", e.target.value)}
          className="col-span-3"
        />
      </div>
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
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create User"}
        </Button>
      </div>
    </form>
  );
}
