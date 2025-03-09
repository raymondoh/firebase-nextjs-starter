"use client";

import React, { useState, useEffect } from "react";
import { Download, FileJson, FileText, Clock, CheckCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useActionState } from "react";
import { exportUserData } from "@/actions";

export function DataExport() {
  const [lastExport, setLastExport] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [state, formAction, isPending] = useActionState(exportUserData, null);

  // Handle export result
  useEffect(() => {
    if (state) {
      if (state.success && state.downloadUrl) {
        setLastExport(new Date().toISOString());
        setDownloadUrl(state.downloadUrl);
        toast.success(state.message || "Data export successful", {
          description: "Click the download button to save your data",
          duration: 5000
        });
      } else if (state.error) {
        toast.error(state.error);
      }
    }
  }, [state]);

  const handleExport = (format: string) => {
    const formData = new FormData();
    formData.append("format", format);
    // Wrap in startTransition to fix the action context error
    React.startTransition(() => {
      formAction(formData);
    });
  };

  // Function to trigger download
  const downloadFile = () => {
    if (!downloadUrl) return;

    // Create a temporary link element
    const link = document.createElement("a");
    link.href = downloadUrl;

    // Extract filename from the URL or create a default one
    const urlParts = downloadUrl.split("/");
    const suggestedFilename = urlParts[urlParts.length - 1].split("?")[0]; // Get filename without query params
    const fileExtension = suggestedFilename.includes(".json") ? "json" : "csv";

    // Set a meaningful filename
    link.setAttribute("download", `user-data-export-${new Date().toISOString().split("T")[0]}.${fileExtension}`);

    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Download started");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Your Data</CardTitle>
        <CardDescription>Download a copy of your personal data in various formats</CardDescription>
      </CardHeader>
      <CardContent>
        {state?.success && downloadUrl && (
          <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <div className="flex flex-col space-y-2 w-full">
              <AlertDescription>Your data is ready for download!</AlertDescription>
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <Button onClick={downloadFile} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                  <Download className="mr-2 h-4 w-4" />
                  Download File
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-green-600 text-green-700"
                  onClick={() => window.open(downloadUrl, "_blank")}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open in Browser
                </Button>
              </div>
            </div>
          </Alert>
        )}

        <Tabs defaultValue="json" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="json" className="px-4">
              JSON
            </TabsTrigger>
            <TabsTrigger value="csv" className="px-4">
              CSV
            </TabsTrigger>
          </TabsList>

          <TabsContent value="json" className="space-y-4">
            <div className="flex items-center gap-4 rounded-lg border p-4">
              <div className="rounded-full bg-primary/10 p-2">
                <FileJson className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">JSON Format</h3>
                <p className="text-sm text-muted-foreground">
                  Export your data in JSON format, suitable for importing into other applications.
                </p>
              </div>
            </div>
            <Button onClick={() => handleExport("json")} disabled={isPending} className="gap-2">
              {isPending ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export as JSON
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="csv" className="space-y-4">
            <div className="flex items-center gap-4 rounded-lg border p-4">
              <div className="rounded-full bg-primary/10 p-2">
                <FileText className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">CSV Format</h3>
                <p className="text-sm text-muted-foreground">
                  Export your data in CSV format, suitable for spreadsheet applications.
                </p>
              </div>
            </div>
            <Button onClick={() => handleExport("csv")} disabled={isPending} className="gap-2">
              {isPending ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export as CSV
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
      {lastExport && (
        <CardFooter className="text-sm text-muted-foreground">
          Last export: {new Date(lastExport).toLocaleString()}
        </CardFooter>
      )}
    </Card>
  );
}
