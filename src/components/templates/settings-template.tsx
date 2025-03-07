import type React from "react";
import { DashboardHeader } from "@/components";
import { DashboardShell } from "@/components";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SettingsTemplateProps {
  title: string;
  description?: string;
  defaultTab?: string;
  tabs: {
    id: string;
    label: string;
    content: React.ReactNode;
  }[];
}

export function SettingsTemplate({ title, description, defaultTab, tabs }: SettingsTemplateProps) {
  return (
    <DashboardShell>
      <DashboardHeader heading={title} text={description} />
      <Separator className="my-6" />
      <Tabs defaultValue={defaultTab || tabs[0].id} className="space-y-6">
        <TabsList>
          {tabs.map(tab => (
            <TabsTrigger key={tab.id} value={tab.id}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map(tab => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-6">
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </DashboardShell>
  );
}
