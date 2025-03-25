"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase/client";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { User } from "@/types/user";
import { formatDate } from "@/utils/date";

interface UserManagementPreviewProps {
  limit?: number;
}

export function UserManagementPreview({ limit: userLimit = 5 }: UserManagementPreviewProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(userLimit));

        const snapshot = await getDocs(usersQuery);
        const usersData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            email: data.email,
            role: data.role || "user",
            createdAt: data.createdAt?.toDate?.() || data.createdAt,
            lastLoginAt: data.lastLoginAt?.toDate?.() || data.lastLoginAt
          } as User;
        });

        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [userLimit]);

  function getInitials(name: string | undefined | null, email: string): string {
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
    <Card>
      <CardHeader>
        <CardTitle>Recent Users</CardTitle>
        <CardDescription>Newly registered users on the platform</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: userLimit }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-3 w-[100px]" />
                  </div>
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No users found</p>
        ) : (
          <div className="space-y-4">
            {users.map(user => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarFallback>{getInitials(user.name, user.email ?? "")}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium leading-none">
                      {user.name || user.email?.split("@")[0] || "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">{user.email || "No email"}</p>

                    <p className="text-xs text-muted-foreground">{formatDate(user.createdAt)}</p>
                  </div>
                </div>
                <Badge variant={user.role === "admin" ? "default" : "outline"}>{user.role}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href="/admin/users">Manage All Users</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
