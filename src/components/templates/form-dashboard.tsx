import type React from "react";
import { DashboardHeader } from "@/components";
import { DashboardShell } from "@/components";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FormDashboardProps {
  title: string;
  description?: string;
  formTitle?: string;
  formDescription?: string;
  formId: string;
  submitButtonText?: string;
  cancelButtonText?: string;
  onCancel?: () => void;
  isSubmitting?: boolean;
  children: React.ReactNode;
}

export function FormDashboard({
  title,
  description,
  formTitle,
  formDescription,
  formId,
  submitButtonText = "Save changes",
  cancelButtonText = "Cancel",
  onCancel,
  isSubmitting = false,
  children
}: FormDashboardProps) {
  return (
    <DashboardShell>
      <DashboardHeader heading={title} text={description} />
      <Separator className="my-6" />
      <Card className="max-w-2xl mx-auto">
        {(formTitle || formDescription) && (
          <CardHeader>
            {formTitle && <CardTitle>{formTitle}</CardTitle>}
            {formDescription && <CardDescription>{formDescription}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>{children}</CardContent>
        <CardFooter className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              {cancelButtonText}
            </Button>
          )}
          <Button type="submit" form={formId} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : submitButtonText}
          </Button>
        </CardFooter>
      </Card>
    </DashboardShell>
  );
}
