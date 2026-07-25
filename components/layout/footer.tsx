import Link from 'next/link';
import { Container } from '@/components/layout/container';
import { contentTypes } from '@/lib/content/content-types.config';
import { siteConfig } from '@/lib/site.config';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-background">
      <Container className="py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <Link href="/" className="text-lg font-bold tracking-tight">
              {siteConfig.name}
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {siteConfig.description}
            </p>
          </div>

          {/* Content */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Content</h3>
            <nav className="flex flex-col gap-2">
              {contentTypes.map((ct) => (
                <Link
                  key={ct.slug}
                  href={`/${ct.slug}`}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {ct.pluralLabel}
                </Link>
              ))}
            </nav>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Company</h3>
            <nav className="flex flex-col gap-2">
              <Link
                href="/about"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                About
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Privacy Policy
              </Link>
            </nav>
          </div>

          {/* Search */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Discover</h3>
            <nav className="flex flex-col gap-2">
              <Link
                href="/search"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Search
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {currentYear} {siteConfig.name}. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Built for developers, by developers.
          </p>
        </div>
      </Container>
    </footer>
  );
}
