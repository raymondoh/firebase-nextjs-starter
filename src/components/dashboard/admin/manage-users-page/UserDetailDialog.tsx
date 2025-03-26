"use client";

import type React from "react";

import { useState } from "react";
import type { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { formatClientDate as formatDate } from "@/utils";

interface UserDetailDialogProps {
  user: User;
  onUpdate: (user: User) => Promise<void>;
  children: React.ReactNode;
}

export function UserDetailDialog({ user, onUpdate, children }: UserDetailDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<User>({ ...user });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onUpdate(formData);
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof User, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  function getInitials(name: string, email: string): string {
    if (name) {
      return name
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }
    return email.substring(0, 2).toUpperCase();
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>View and edit user information.</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="details">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {formData.profileImage && (
                  <AvatarImage src={formData.profileImage ?? ""} alt={formData.name ?? formData.email ?? "User"} />
                )}
                <AvatarFallback className="text-lg">
                  {getInitials(formData.name ?? "", formData.email ?? "")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-medium">{formData.name ?? formData.email?.split("@")[0]}</h3>
                <p className="text-sm text-muted-foreground">{formData.email ?? "No email"}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant={formData.role === "admin" ? "destructive" : "outline"}>
                    {formData.role || "user"}
                  </Badge>
                  <Badge variant={formData.status === "active" ? "outline" : "destructive"}>
                    {formData.status || "active"}
                  </Badge>
                </div>
              </div>
            </div>
            <Separator />
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name ?? ""}
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
                    value={formData.email ?? ""}
                    onChange={e => handleChange("email", e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Role
                  </Label>
                  <Select value={formData.role || "user"} onValueChange={value => handleChange("role", value)}>
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
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <Select
                    value={formData.status || "active"}
                    onValueChange={value => handleChange("status", value as "active" | "disabled" | "pending")}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
          <TabsContent value="security" className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Email Verification</h4>
                  <p className="text-sm text-muted-foreground">User&aposs email verification status</p>
                </div>
                <Switch
                  checked={formData.emailVerified}
                  onCheckedChange={checked => handleChange("emailVerified", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Password</h4>
                  <p className="text-sm text-muted-foreground">User has a password set</p>
                </div>
                <Badge variant={formData.hasPassword ? "outline" : "destructive"}>
                  {formData.hasPassword ? "Set" : "Not Set"}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-muted-foreground">Additional security layer</p>
                </div>
                <Switch checked={formData.has2FA} onCheckedChange={checked => handleChange("has2FA", checked)} />
              </div>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium">Security Actions</h4>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">
                    Reset Password
                  </Button>
                  <Button variant="outline" size="sm">
                    Force Sign Out
                  </Button>
                  <Button variant="destructive" size="sm">
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="activity" className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Created At</h4>
                  <p className="text-sm text-muted-foreground">{formatDate(formData.createdAt)}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Last Login</h4>
                  <p className="text-sm text-muted-foreground">{formatDate(formData.lastLoginAt)}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Last Updated</h4>
                  <p className="text-sm text-muted-foreground">{formatDate(formData.updatedAt)}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">IP Address</h4>
                  <p className="text-sm text-muted-foreground">Not available</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium">Recent Activity</h4>
                <p className="text-sm text-muted-foreground">Activity log not available in this preview</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
