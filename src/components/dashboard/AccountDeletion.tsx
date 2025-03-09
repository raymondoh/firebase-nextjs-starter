"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useActionState } from "react";
import { requestAccountDeletion } from "@/actions/dataPrivacyActions";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export function AccountDeletion() {
  const router = useRouter();
  const { update } = useSession();
  const [confirmText, setConfirmText] = useState("");
  const [immediateDelete, setImmediateDelete] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(requestAccountDeletion, null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Handle deletion result
  useEffect(() => {
    if (state?.success && !isRedirecting) {
      toast.success(state.message || "Account deletion request submitted");
      setDialogOpen(false);

      // Redirect to homepage if requested
      if (state.shouldRedirect) {
        setIsRedirecting(true);

        // Force sign out completely
        const handleCompleteSignOut = async () => {
          try {
            // Clear client-side storage
            if (typeof window !== "undefined") {
              // Clear all local storage items related to auth
              localStorage.removeItem("next-auth.session-token");
              localStorage.removeItem("next-auth.callback-url");
              localStorage.removeItem("next-auth.csrf-token");

              // Clear session storage items too
              sessionStorage.removeItem("next-auth.session-token");
              sessionStorage.removeItem("next-auth.callback-url");
              sessionStorage.removeItem("next-auth.csrf-token");

              // Set a cookie to indicate account deletion
              document.cookie = "account-deleted=true; path=/; max-age=60";

              // Trigger storage event to notify other tabs
              window.dispatchEvent(
                new StorageEvent("storage", {
                  key: "next-auth.session-token",
                  newValue: null
                })
              );
            }

            // Force sign out with next-auth
            await signOut({ redirect: false });

            // Force update the session
            await update();

            // Add a small delay before redirecting
            setTimeout(() => {
              // Use window.location for a full page refresh
              window.location.href = "/";
            }, 500);
          } catch (error) {
            console.error("Error during sign out process:", error);
            // If there's an error, still try to redirect
            window.location.href = "/";
          }
        };

        handleCompleteSignOut();
      }
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router, update, isRedirecting]);

  const handleDeleteRequest = () => {
    if (confirmText !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }

    const formData = new FormData();
    formData.append("immediateDelete", immediateDelete.toString());

    // Wrap in startTransition
    React.startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-red-600">Delete Account</CardTitle>
        <CardDescription>Permanently delete your account and all associated data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <div className="space-y-1">
            <p className="font-medium text-red-800">Warning: This action cannot be undone</p>
            <p className="text-sm text-red-700">
              Deleting your account will permanently remove all your data, including profile information, activity
              history, and preferences. You will not be able to recover this information later.
            </p>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Request Account Deletion
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your account and remove all your data from
                our servers.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  All your personal data, uploads, and activity history will be permanently deleted.
                </AlertDescription>
              </Alert>

              <div className="flex items-center space-x-2 py-2">
                <Checkbox
                  id="immediate-delete"
                  checked={immediateDelete}
                  onCheckedChange={checked => setImmediateDelete(checked === true)}
                />
                <Label
                  htmlFor="immediate-delete"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Delete my account immediately
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                {immediateDelete
                  ? "Your account will be deleted immediately and you will be logged out."
                  : "Your deletion request will be processed within 30 days."}
              </p>

              <div className="space-y-2 pt-2">
                <Label htmlFor="confirm">Type DELETE to confirm</Label>
                <Input
                  id="confirm"
                  value={confirmText}
                  onChange={e => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteRequest}
                disabled={confirmText !== "DELETE" || isPending || isRedirecting}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : isRedirecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redirecting...
                  </>
                ) : (
                  "Delete Account"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {state?.success && (
          <Alert className="mt-4 bg-yellow-50 text-yellow-800 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription>{state.message || "Your account deletion request has been submitted."}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
