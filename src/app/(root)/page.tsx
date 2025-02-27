import type React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, Shield, Users, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Home | Your App Name",
  description: "Welcome to Your App - A secure and feature-rich application"
};

export default async function Home() {
  const session = await auth();

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{process.env.NEXT_PUBLIC_APP_NAME}</h1>
        <p className="text-xl text-muted-foreground mb-6">{process.env.NEXT_PUBLIC_APP_DESCRIPTION}</p>
        {session?.user ? (
          <div className="space-y-4">
            <p className="text-2xl font-semibold">Welcome back, {session.user.name}!</p>
            <Button asChild>
              <Link href="/user/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        ) : (
          <div className="space-x-4">
            <Button asChild>
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/register">Sign Up</Link>
            </Button>
          </div>
        )}
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <FeatureCard
          icon={<Rocket className="h-8 w-8 mb-4 text-primary" />}
          title="Quick Start"
          description="Get up and running with our intuitive onboarding process."
        />
        <FeatureCard
          icon={<Shield className="h-8 w-8 mb-4 text-primary" />}
          title="Secure"
          description="Built with top-notch security practices to keep your data safe."
        />
        <FeatureCard
          icon={<Users className="h-8 w-8 mb-4 text-primary" />}
          title="Collaborative"
          description="Work together seamlessly with robust user management."
        />
        <FeatureCard
          icon={<Zap className="h-8 w-8 mb-4 text-primary" />}
          title="Powerful"
          description="Access a wide range of features to boost your productivity."
        />
      </section>

      <section className="text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
        <p className="text-muted-foreground mb-6">
          Join thousands of satisfied users and take your project to the next level.
        </p>
        <Button asChild size="lg">
          <Link href={session?.user ? "/user/dashboard" : "/register"}>
            {session?.user ? "Go to Dashboard" : "Sign Up Now"}
          </Link>
        </Button>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-col items-center text-center">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-center">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
