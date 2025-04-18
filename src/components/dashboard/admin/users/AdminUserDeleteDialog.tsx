"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteUserAsAdmin } from "@/actions/auth/delete";
import { toast } from "sonner";
import type { SerializedUser } from "@/types/user";
import { useSession } from "next-auth/react";
import { SubmitButton } from "@/components/shared/SubmitButton";

interface AdminUserDeleteDialogProps {
  user: SerializedUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AdminUserDeleteDialog({ user, open, onOpenChange, onSuccess }: AdminUserDeleteDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  console.log("!!!SESSION", session);

  const handleDelete = async () => {
    if (!session?.user) {
      toast.error("You must be logged in to delete users.");
      return;
    }

    setLoading(true);
    try {
      const result = await deleteUserAsAdmin({
        userId: user.id,
        adminId: session.user.id
      });

      if (result.success) {
        toast.success(`User ${user.name || user.email} deleted successfully.`);
        onOpenChange(false);
        onSuccess?.();
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete user.");
      }
    } catch (err) {
      toast.error("Unexpected error occurred while deleting user.");
      console.error("Delete user error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete <strong>{user.name || user.email}</strong>? This action cannot be undone.
        </p>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <SubmitButton onClick={handleDelete} isLoading={loading} loadingText="Deleting..." variant="destructive">
            Delete
          </SubmitButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
