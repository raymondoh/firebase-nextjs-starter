import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";
import { siteConfig } from "@/config/siteConfig";

export const metadata: Metadata = {
  title: `${siteConfig.name} - Main Value Proposition`,
  description: siteConfig.description,
  openGraph: {
    title: `${siteConfig.name} - Main Value Proposition`,
    description: siteConfig.description,
    type: "website"
  }
};

export default function HomePage() {
  return (
    <div className="text-foreground">
      {/* Hero Section - Adaptive gradient background */}
      <section className="py-20 border-b bg-gradient-to-b from-blue-50 to-background dark:from-blue-950/20 dark:to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Your App&apos;s <span className="text-primary">Main Value Proposition</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              A clear, concise description of what your app does and why users should care.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                Get Started
              </Link>
              <Link
                href="/demo"
                className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                See Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Dark mode responsive background */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover all the ways our app can help streamline your workflow and boost productivity.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              title="Feature One"
              description="A detailed explanation of this feature and how it benefits users in their daily tasks."
              icon="🚀"
            />
            <FeatureCard
              title="Feature Two"
              description="A detailed explanation of this feature and how it benefits users in their daily tasks."
              icon="⚡"
            />
            <FeatureCard
              title="Feature Three"
              description="A detailed explanation of this feature and how it benefits users in their daily tasks."
              icon="🔍"
            />
          </div>
        </div>
      </section>

      {/* Benefits Section - Dark mode responsive background */}
      <section className="py-20 bg-primary/5 dark:bg-primary/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose Us</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our app is designed with your needs in mind, providing benefits that matter.
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-x-12 gap-y-8">
            <BenefitItem title="Benefit One" description="How this specific benefit helps users achieve their goals." />
            <BenefitItem title="Benefit Two" description="How this specific benefit helps users achieve their goals." />
            <BenefitItem
              title="Benefit Three"
              description="How this specific benefit helps users achieve their goals."
            />
            <BenefitItem
              title="Benefit Four"
              description="How this specific benefit helps users achieve their goals."
            />
          </div>
        </div>
      </section>

      {/* CTA Section - Dark mode responsive background */}
      <section className="py-20 border-t bg-slate-50 dark:bg-slate-900/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of satisfied users and take your productivity to the next level.
            </p>
            <Link
              href="/signup"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
              Sign Up Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <Card className="border border-border hover:border-primary/20 transition-colors bg-white dark:bg-card">
      <CardHeader>
        <div className="flex flex-col items-center text-center">
          <span className="text-4xl mb-4">{icon}</span>
          <CardTitle className="text-xl text-primary">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-center">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}

function BenefitItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start gap-4">
      <CheckCircle className="h-6 w-6 text-primary shrink-0 mt-1" />
      <div>
        <h3 className="font-medium text-lg">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
