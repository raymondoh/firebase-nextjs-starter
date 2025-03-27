"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { db } from "@/firebase/client";
import { AlertCircle, CheckCircle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SystemAlert } from "@/types/dashboard";
import { parseDate } from "@/utils/date-client";
import { firebaseError, isFirebaseError } from "@/utils/firebase-error";

export function AdminSystemAlerts() {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const alertsQuery = query(
          collection(db, "systemAlerts"),
          where("resolved", "==", false),
          orderBy("timestamp", "desc"),
          limit(3)
        );

        const snapshot = await getDocs(alertsQuery);
        const alertsData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            description: data.description,
            severity: data.severity,
            timestamp: parseDate(data.timestamp),
            resolved: data.resolved
          };
        });

        setAlerts(alertsData);
      } catch (error) {
        if (isFirebaseError(error)) {
          console.error("Error fetching users:", firebaseError(error));
        } else {
          console.error("Error fetching users:", "An unexpected error occurred.");
        }

        setAlerts([
          {
            id: "sample1",
            title: "System Maintenance",
            description: "Scheduled maintenance on March 15, 2023 at 2:00 AM UTC",
            severity: "info",
            timestamp: new Date(),
            resolved: false
          }
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchAlerts();
  }, []);

  function getSeverityIcon(severity: SystemAlert["severity"]) {
    switch (severity) {
      case "error":
        return <AlertCircle className="h-4 w-4" />;
      case "warning":
        return <AlertCircle className="h-4 w-4" />;
      case "success":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  }

  function getSeverityClass(severity: SystemAlert["severity"]) {
    switch (severity) {
      case "error":
        return "bg-destructive/15 text-destructive";
      case "warning":
        return "bg-warning/15 text-warning";
      case "success":
        return "bg-success/15 text-success";
      default:
        return "bg-info/15 text-info";
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Alerts</CardTitle>
        <CardDescription>Important notifications about your system</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CheckCircle className="h-12 w-12 text-success mb-2" />
            <p className="text-muted-foreground">All systems operational</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map(alert => (
              <Alert key={alert.id} className={getSeverityClass(alert.severity)}>
                <div className="flex items-center gap-2">
                  {getSeverityIcon(alert.severity)}
                  <AlertTitle>{alert.title}</AlertTitle>
                </div>
                <AlertDescription>{alert.description}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href="/admin/alerts">View All Alerts</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
