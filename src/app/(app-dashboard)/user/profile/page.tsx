"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormDashboard } from "@/components/templates";
import { UserProfileForm } from "@/components";
import { toast } from "sonner";

export default function UserProfilePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = () => {
    // Check if form is dirty (has changes)
    const isDirty = document.getElementById("profile-form")?.querySelector("input:not([value=''])");

    if (isDirty && !window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
      return;
    }

    router.push("/user");
  };

  const handleSubmitStart = () => {
    setIsSubmitting(true);
  };

  const handleSubmitComplete = (success: boolean) => {
    setIsSubmitting(false);
    setIsSuccess(success);
    if (success) {
      setError(null);
      // Optionally navigate away or perform other actions on success
      // Maybe show a toast notification
      toast.success("Profile updated successfully.");
      // Or set a timeout to reset the success state
      setTimeout(() => setIsSuccess(false), 3000);
    } else {
      setError(errorMessage || "An error occurred while saving your profile.");
    }
  };

  return (
    <FormDashboard
      title="Profile"
      description="Manage your account settings and profile information."
      formTitle="Personal Information"
      formDescription="Update your personal details and profile picture."
      formId="profile-form"
      submitButtonText="Save changes"
      cancelButtonText="Cancel"
      onCancel={handleCancel}
      isCancelDisabled={isSubmitting}
      isSuccess={isSuccess}
      isSubmitting={isSubmitting}
      error={error}>
      <UserProfileForm id="profile-form" onSubmitStart={handleSubmitStart} onSubmitComplete={handleSubmitComplete} />
    </FormDashboard>
  );
}
