"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";

// Schema
const FormSchema = z.object({
  marketing_emails: z.boolean().default(false).optional(),
  security_emails: z.boolean()
});

// Type alias for form values
type NotificationFormValues = z.infer<typeof FormSchema>;

export function NotificationForm() {
  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      security_emails: true
    }
  });

  function onSubmit(data: NotificationFormValues) {
    toast.success("Notification preferences updated", {
      description: (
        <pre className="mt-2 w-full max-w-xs rounded-md bg-slate-950 p-4 overflow-auto">
          <code className="text-white text-xs">{JSON.stringify(data, null, 2)}</code>
        </pre>
      )
    });
  }

  //   return (
  //     <Form {...form}>
  //       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" style={{ border: "none" }}>
  //         <div className="space-y-4">
  //           <FormField
  //             control={form.control}
  //             name="marketing_emails"
  //             render={({ field }) => (
  //               <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
  //                 <div className="space-y-0.5">
  //                   <FormLabel className="text-base">Marketing emails</FormLabel>
  //                   <FormDescription>Receive emails about new products, features, and more.</FormDescription>
  //                 </div>
  //                 <FormControl>
  //                   <Switch checked={field.value} onCheckedChange={field.onChange} />
  //                 </FormControl>
  //               </FormItem>
  //             )}
  //           />
  //           <FormField
  //             control={form.control}
  //             name="security_emails"
  //             render={({ field }) => (
  //               <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
  //                 <div className="space-y-0.5">
  //                   <FormLabel className="text-base">Security emails</FormLabel>
  //                   <FormDescription>Receive emails about your account security.</FormDescription>
  //                 </div>
  //                 <FormControl>
  //                   <Switch checked={field.value} onCheckedChange={field.onChange} disabled aria-readonly />
  //                 </FormControl>
  //               </FormItem>
  //             )}
  //           />
  //         </div>
  //         <Button type="submit">Save Preferences</Button>
  //       </form>
  //     </Form>
  //   );
  // }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full" style={{ border: "none" }}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="marketing_emails"
            render={({ field }) => (
              <FormItem className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border p-4 shadow-sm gap-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Marketing emails</FormLabel>
                  <FormDescription>Receive emails about new products, features, and more.</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="security_emails"
            render={({ field }) => (
              <FormItem className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border p-4 shadow-sm gap-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Security emails</FormLabel>
                  <FormDescription>Receive emails about your account security.</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} disabled aria-readonly />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        {/* Made button full width on mobile */}
        <Button type="submit" className="w-full sm:w-auto">
          Save Preferences
        </Button>
      </form>
    </Form>
  );
}
