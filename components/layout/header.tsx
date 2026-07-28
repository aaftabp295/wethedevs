import { Container } from '@/components/layout/container';
import { Nav } from '@/components/layout/nav';
import { MobileNav } from '@/components/layout/mobile-nav';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { SearchDialog } from '@/components/search/search-dialog';
import { Logo } from '@/components/shared/logo';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
      <Container className="relative flex h-14 items-center justify-between">
        {/* Logo */}
        <Logo />

        {/* Desktop Navigation */}
        <Nav />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <SearchDialog />
          <ThemeToggle />
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
