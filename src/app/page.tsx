import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";

export default function Page() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="py-20 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Your App's <span className="text-primary">Main Value Proposition</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              A clear, concise description of what your app does and why users should care.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/signup">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/demo">
                  See Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
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

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
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

      {/* CTA Section */}
      <section className="py-20 border-t">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of satisfied users and take your productivity to the next level.
            </p>
            <Button asChild size="lg" className="px-8">
              <Link href="/signup">Sign Up Now</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <Card className="border border-border hover:border-primary/20 transition-colors">
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
