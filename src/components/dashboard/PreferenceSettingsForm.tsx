"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface PreferenceSettingsFormProps {
  id: string;
  onSubmitStart?: () => void;
  onSubmitComplete?: (success: boolean) => void;
}

export function PreferenceSettingsForm({ id, onSubmitStart, onSubmitComplete }: PreferenceSettingsFormProps) {
  const [theme, setTheme] = useState("system");
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("utc");
  const [enableAnimations, setEnableAnimations] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    onSubmitStart?.();
    setIsSubmitting(true);

    try {
      // Get form data
      const formTheme = formData.get("theme") as string;
      const formLanguage = formData.get("language") as string;
      const formTimezone = formData.get("timezone") as string;
      const formAnimations = formData.get("animations") === "on";

      // Update state
      setTheme(formTheme);
      setLanguage(formLanguage);
      setTimezone(formTimezone);
      setEnableAnimations(formAnimations);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success("Preferences updated", {
        description: "Your preferences have been updated successfully."
      });

      onSubmitComplete?.(true);
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast.error("Error", {
        description: "Failed to update preferences. Please try again."
      });

      onSubmitComplete?.(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form id={id} action={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="theme">Theme</Label>
          <Select name="theme" defaultValue={theme} onValueChange={setTheme}>
            <SelectTrigger id="theme">
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">Choose how the application appears to you.</p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="language">Language</Label>
          <Select name="language" defaultValue={language} onValueChange={setLanguage}>
            <SelectTrigger id="language">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="de">German</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Select name="timezone" defaultValue={timezone} onValueChange={setTimezone}>
            <SelectTrigger id="timezone">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="utc">UTC</SelectItem>
              <SelectItem value="est">Eastern Time (ET)</SelectItem>
              <SelectItem value="cst">Central Time (CT)</SelectItem>
              <SelectItem value="pst">Pacific Time (PT)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="animations">Animations</Label>
            <p className="text-sm text-muted-foreground">Enable or disable UI animations.</p>
          </div>
          <Switch id="animations" name="animations" checked={enableAnimations} onCheckedChange={setEnableAnimations} />
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save preferences"}
      </Button>
    </form>
  );
}
