"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { User } from "@/types/user/common";
import { toast } from "sonner";
import { updateUser } from "@/actions/user/admin";
import { deleteUserAsAdmin } from "@/actions/auth";
import { isFirebaseError, firebaseError } from "@/utils/firebase-error";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
// import from server version (which supports AdminTimestamp)
import { formatDate as formatServerDate } from "@/utils/date-server";

export interface AdminUserDetailCardProps {
  user: User;
}
// click view in the view coloumn on the manage users page
export function AdminUserDetailCard({ user }: AdminUserDetailCardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<User>({ ...user });
  const { data: session } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await updateUser(user.id, formData);
      if (result.success) {
        toast.success("User updated successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update user");
      }
    } catch (err) {
      const message = isFirebaseError(err) ? firebaseError(err) : "An unexpected error occurred";
      toast.error(message);
      console.error("Update error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    setIsLoading(true);
    try {
      if (!session?.user?.id) {
        toast.error("You must be signed in to perform this action");
        return;
      }

      const result = await deleteUserAsAdmin(user.id, session.user.id);
      if (result.success) {
        toast.success("User deleted successfully");
        router.push("/admin/users");
      } else {
        toast.error(result.error || "Failed to delete user");
      }
    } catch (err) {
      const message = isFirebaseError(err) ? firebaseError(err) : "An unexpected error occurred";
      toast.error(message);
      console.error("Delete error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof User, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getInitials = (name?: string | null, email?: string | null): string =>
    name
      ? name
          .split(" ")
          .map(n => n[0])
          .join("")
          .toUpperCase()
          .substring(0, 2)
      : (email ?? "UN").substring(0, 2).toUpperCase();

  //   return (
  //     <div className="space-y-6">
  //       <Card>
  //         <CardHeader>
  //           <CardTitle>User Profile</CardTitle>
  //           <CardDescription>View and edit user information.</CardDescription>
  //         </CardHeader>
  //         <CardContent>
  //           <Tabs defaultValue="details">
  //             <TabsList className="grid w-full grid-cols-3">
  //               <TabsTrigger value="details">Details</TabsTrigger>
  //               <TabsTrigger value="security">Security</TabsTrigger>
  //               <TabsTrigger value="activity">Activity</TabsTrigger>
  //             </TabsList>

  //             {/* Details Tab */}
  //             <TabsContent value="details" className="space-y-4 py-4">
  //               <div className="flex items-center gap-4">
  //                 <Avatar className="h-16 w-16">
  //                   {formData.image && <AvatarImage src={formData.image} alt={formData.name || formData.email || ""} />}
  //                   <AvatarFallback className="text-lg">{getInitials(formData.name, formData.email)}</AvatarFallback>
  //                 </Avatar>
  //                 <div>
  //                   <h3 className="text-lg font-medium">{formData.name || formData.email?.split("@")[0]}</h3>
  //                   <p className="text-sm text-muted-foreground">{formData.email}</p>
  //                   <div className="mt-1 flex items-center gap-2">
  //                     <Badge variant={formData.role === "admin" ? "destructive" : "outline"}>{formData.role}</Badge>
  //                     <Badge variant={formData.status === "active" ? "default" : "destructive"}>{formData.status}</Badge>
  //                   </div>
  //                 </div>
  //               </div>
  //               <Separator />

  //               {/* Edit Form */}
  //               <form onSubmit={handleSubmit}>
  //                 <div className="grid gap-4 py-4">
  //                   {/* Name */}
  //                   <div className="grid grid-cols-4 items-center gap-4">
  //                     <Label htmlFor="name" className="text-right">
  //                       Name
  //                     </Label>
  //                     <Input
  //                       id="name"
  //                       value={formData.name || ""}
  //                       onChange={e => handleChange("name", e.target.value)}
  //                       className="col-span-3"
  //                     />
  //                   </div>
  //                   {/* Email */}
  //                   <div className="grid grid-cols-4 items-center gap-4">
  //                     <Label htmlFor="email" className="text-right">
  //                       Email
  //                     </Label>
  //                     <Input
  //                       id="email"
  //                       value={formData.email || ""}
  //                       onChange={e => handleChange("email", e.target.value)}
  //                       className="col-span-3"
  //                     />
  //                   </div>
  //                   {/* Role */}
  //                   <div className="grid grid-cols-4 items-center gap-4">
  //                     <Label htmlFor="role" className="text-right">
  //                       Role
  //                     </Label>
  //                     <Select value={formData.role || "user"} onValueChange={value => handleChange("role", value)}>
  //                       <SelectTrigger className="col-span-3">
  //                         <SelectValue placeholder="Select role" />
  //                       </SelectTrigger>
  //                       <SelectContent>
  //                         <SelectItem value="admin">Admin</SelectItem>
  //                         <SelectItem value="moderator">Moderator</SelectItem>
  //                         <SelectItem value="user">User</SelectItem>
  //                       </SelectContent>
  //                     </Select>
  //                   </div>
  //                   {/* Status */}
  //                   <div className="grid grid-cols-4 items-center gap-4">
  //                     <Label htmlFor="status" className="text-right">
  //                       Status
  //                     </Label>
  //                     <Select value={formData.status || "active"} onValueChange={value => handleChange("status", value)}>
  //                       <SelectTrigger className="col-span-3">
  //                         <SelectValue placeholder="Select status" />
  //                       </SelectTrigger>
  //                       <SelectContent>
  //                         <SelectItem value="active">Active</SelectItem>
  //                         <SelectItem value="disabled">Disabled</SelectItem>
  //                         <SelectItem value="pending">Pending</SelectItem>
  //                       </SelectContent>
  //                     </Select>
  //                   </div>
  //                 </div>

  //                 <div className="flex justify-end">
  //                   <Button type="submit" disabled={isLoading}>
  //                     {isLoading ? "Saving..." : "Save changes"}
  //                   </Button>
  //                 </div>
  //               </form>
  //             </TabsContent>

  //             {/* Security Tab */}
  //             <TabsContent value="security" className="space-y-4 py-4">
  //               <div className="space-y-4">
  //                 <div className="flex items-center justify-between">
  //                   <div>
  //                     <h4 className="font-medium">Email Verification</h4>
  //                     <p className="text-sm text-muted-foreground">User&aposs email verification status</p>
  //                   </div>
  //                   <Switch
  //                     checked={formData.emailVerified}
  //                     onCheckedChange={checked => handleChange("emailVerified", checked)}
  //                   />
  //                 </div>
  //                 <Separator />
  //                 <div className="flex items-center justify-between">
  //                   <div>
  //                     <h4 className="font-medium">Password</h4>
  //                     <p className="text-sm text-muted-foreground">User has a password set</p>
  //                   </div>
  //                   <Badge variant={formData.hasPassword ? "outline" : "destructive"}>
  //                     {formData.hasPassword ? "Set" : "Not Set"}
  //                   </Badge>
  //                 </div>
  //                 <Separator />
  //                 <div className="flex items-center justify-between">
  //                   <div>
  //                     <h4 className="font-medium">Two-Factor Authentication</h4>
  //                     <p className="text-sm text-muted-foreground">Additional security layer</p>
  //                   </div>
  //                   <Switch checked={formData.has2FA} onCheckedChange={checked => handleChange("has2FA", checked)} />
  //                 </div>
  //                 <Separator />
  //                 <div className="space-y-2">
  //                   <h4 className="font-medium">Security Actions</h4>
  //                   <div className="flex flex-wrap gap-2">
  //                     <Button variant="outline" size="sm">
  //                       Reset Password
  //                     </Button>
  //                     <Button variant="outline" size="sm">
  //                       Force Sign Out
  //                     </Button>
  //                     <AlertDialog>
  //                       <AlertDialogTrigger asChild>
  //                         <Button variant="destructive" size="sm">
  //                           Delete Account
  //                         </Button>
  //                       </AlertDialogTrigger>
  //                       <AlertDialogContent>
  //                         <AlertDialogHeader>
  //                           <AlertDialogTitle>Are you sure?</AlertDialogTitle>
  //                           <AlertDialogDescription>
  //                             This action will permanently delete the user account.
  //                           </AlertDialogDescription>
  //                         </AlertDialogHeader>
  //                         <AlertDialogFooter>
  //                           <AlertDialogCancel>Cancel</AlertDialogCancel>
  //                           <AlertDialogAction onClick={handleDeleteUser} disabled={isLoading}>
  //                             {isLoading ? "Deleting..." : "Delete"}
  //                           </AlertDialogAction>
  //                         </AlertDialogFooter>
  //                       </AlertDialogContent>
  //                     </AlertDialog>
  //                   </div>
  //                 </div>
  //               </div>
  //             </TabsContent>

  //             {/* Activity Tab */}
  //             <TabsContent value="activity" className="space-y-4 py-4">
  //               <div className="grid grid-cols-2 gap-4">
  //                 <div>
  //                   <h4 className="text-sm font-medium">Created At</h4>
  //                   <p className="text-sm text-muted-foreground">{formatServerDate(formData.createdAt)}</p>
  //                 </div>
  //                 <div>
  //                   <h4 className="text-sm font-medium">Last Login</h4>
  //                   <p className="text-sm text-muted-foreground">{formatServerDate(formData.lastLoginAt)}</p>
  //                 </div>
  //                 <div>
  //                   <h4 className="text-sm font-medium">Last Updated</h4>
  //                   <p className="text-sm text-muted-foreground">{formatServerDate(formData.updatedAt)}</p>
  //                 </div>
  //                 <div>
  //                   <h4 className="text-sm font-medium">IP Address</h4>
  //                   <p className="text-sm text-muted-foreground">Not available</p>
  //                 </div>
  //               </div>
  //               <Separator />
  //               <div className="space-y-2">
  //                 <h4 className="font-medium">Recent Activity</h4>
  //                 <p className="text-sm text-muted-foreground">Activity log not available in this preview</p>
  //               </div>
  //             </TabsContent>
  //           </Tabs>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   );
  // }
  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      <Card className="w-full overflow-hidden">
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>View and edit user information.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-4 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <Avatar className="h-16 w-16">
                  {formData.image && <AvatarImage src={formData.image} alt={formData.name || formData.email || ""} />}
                  <AvatarFallback className="text-lg">{getInitials(formData.name, formData.email)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium">{formData.name || formData.email?.split("@")[0]}</h3>
                  <p className="text-sm text-muted-foreground break-words">{formData.email}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge variant={formData.role === "admin" ? "destructive" : "outline"}>{formData.role}</Badge>
                    <Badge variant={formData.status === "active" ? "default" : "destructive"}>{formData.status}</Badge>
                  </div>
                </div>
              </div>
              <Separator />

              {/* Edit Form */}
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  {/* Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                    <Label htmlFor="name" className="sm:text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={formData.name || ""}
                      onChange={e => handleChange("name", e.target.value)}
                      className="col-span-1 sm:col-span-3"
                    />
                  </div>
                  {/* Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                    <Label htmlFor="email" className="sm:text-right">
                      Email
                    </Label>
                    <Input
                      id="email"
                      value={formData.email || ""}
                      onChange={e => handleChange("email", e.target.value)}
                      className="col-span-1 sm:col-span-3"
                    />
                  </div>
                  {/* Role */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                    <Label htmlFor="role" className="sm:text-right">
                      Role
                    </Label>
                    <Select value={formData.role || "user"} onValueChange={value => handleChange("role", value)}>
                      <SelectTrigger className="col-span-1 sm:col-span-3">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                    <Label htmlFor="status" className="sm:text-right">
                      Status
                    </Label>
                    <Select value={formData.status || "active"} onValueChange={value => handleChange("status", value)}>
                      <SelectTrigger className="col-span-1 sm:col-span-3">
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

                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-4 py-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Verification</h4>
                    <p className="text-sm text-muted-foreground">User&apos;s email verification status</p>
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
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          Delete Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action will permanently delete the user account.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteUser} disabled={isLoading}>
                            {isLoading ? "Deleting..." : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium">Created At</h4>
                  <p className="text-sm text-muted-foreground">{formatServerDate(formData.createdAt)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Last Login</h4>
                  <p className="text-sm text-muted-foreground">{formatServerDate(formData.lastLoginAt)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Last Updated</h4>
                  <p className="text-sm text-muted-foreground">{formatServerDate(formData.updatedAt)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">IP Address</h4>
                  <p className="text-sm text-muted-foreground">Not available</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium">Recent Activity</h4>
                <p className="text-sm text-muted-foreground">Activity log not available in this preview</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
