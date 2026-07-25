import Link from 'next/link';
import { Search } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { Nav } from '@/components/layout/nav';
import { MobileNav } from '@/components/layout/mobile-nav';
import { ThemeToggle } from '@/components/shared/theme-toggle';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
      <Container className="relative flex h-14 items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight"
        >
          We The Devs
        </Link>

        {/* Desktop Navigation */}
        <Nav />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background transition-colors hover:bg-accent hover:text-accent-foreground"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Link>
          <ThemeToggle />
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
