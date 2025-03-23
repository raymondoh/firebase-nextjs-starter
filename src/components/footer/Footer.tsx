import Link from "next/link";
import { CableCarIcon, Navigation2Icon, SaladIcon } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t z-30 w-full bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Top row: Navigation and Social Links */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-6">
          {/* Navigation Links */}
          <nav className="flex gap-6">
            <Link href="/about" className="text-sm font-medium hover:underline underline-offset-4">
              About
            </Link>
            <Link href="/blog" className="text-sm font-medium hover:underline underline-offset-4">
              Blog
            </Link>
            <Link href="/contact" className="text-sm font-medium hover:underline underline-offset-4">
              Contact
            </Link>
          </nav>

          {/* Social Media Links */}
          <div className="flex items-center gap-4">
            <Link
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground">
              <CableCarIcon className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
            <Link
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground">
              <Navigation2Icon className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground">
              <SaladIcon className="h-5 w-5" />
              <span className="sr-only">Instagram</span>
            </Link>
          </div>
        </div>

        {/* Bottom row: Copyright */}
        <div className="text-center border-t pt-6">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Your Company. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
