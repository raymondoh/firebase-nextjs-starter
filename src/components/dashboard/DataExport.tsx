"use client";

import { useState } from "react";
import { Download, FileJson, FileText, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export function DataExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [lastExport, setLastExport] = useState<string | null>(null);

  const handleExport = (format: string) => {
    setIsExporting(true);

    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      setLastExport(new Date().toISOString());
      toast.success(`Your data has been exported in ${format.toUpperCase()} format`, {
        description: "You'll receive an email with the download link shortly."
      });
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Your Data</CardTitle>
        <CardDescription>Download a copy of your personal data in various formats</CardDescription>
      </CardHeader>
      <CardContent>
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
            <Button onClick={() => handleExport("json")} disabled={isExporting} className="gap-2">
              {isExporting ? (
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
            <Button onClick={() => handleExport("csv")} disabled={isExporting} className="gap-2">
              {isExporting ? (
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
