"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { updateProfile, getProfile } from "@/actions/userActions";
import Image from "next/image";

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  picture: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export default function UserProfile() {
  const { data: session, update } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const result = await getProfile();
        if (result.success && result.user) {
          setProfile(result.user as UserProfile);
        } else {
          toast.error(result.error || "Failed to load profile");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;

    const formData = new FormData(e.currentTarget);

    // Remove empty strings for optional fields
    if (formData.get("picture") === "") {
      formData.delete("picture");
    }

    try {
      const result = await updateProfile(formData);

      if (result.success) {
        setProfile(result.user as UserProfile);
        toast.success("Profile updated successfully!");
        setIsEditing(false);
        // Update the session to reflect the changes
        await update();
      } else {
        toast.error(result.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return <div>Failed to load profile</div>;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl sm:text-3xl">User Profile</CardTitle>
        <CardDescription>Manage your profile information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={profile.name || ""} disabled={!isEditing} />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" value={profile.email || ""} disabled={true} />
            </div>
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="picture">Profile Picture URL</Label>
            <Input id="picture" name="picture" defaultValue={profile.picture || ""} disabled={!isEditing} />
          </div>
          {profile.picture && (
            <div className="flex justify-center sm:justify-start">
              <Image
                src={profile.picture || "/placeholder.svg"}
                alt="Profile Picture"
                width={100}
                height={100}
                className="rounded-full"
              />
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="role">Role</Label>
              <Input id="role" name="role" value={profile.role} disabled={true} />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label>Account Created</Label>
              <Input value={new Date(profile.createdAt).toLocaleString()} disabled={true} />
            </div>
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label>Last Updated</Label>
            <Input value={new Date(profile.updatedAt).toLocaleString()} disabled={true} />
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between mt-4 space-y-2 sm:space-y-0">
        {isEditing ? (
          <>
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleSubmit}>
              Save Changes
            </Button>
          </>
        ) : (
          <Button onClick={() => setIsEditing(true)} className="w-full sm:w-auto">
            Edit Profile
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

function ProfileSkeleton() {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-28" />
      </CardFooter>
    </Card>
  );
}
