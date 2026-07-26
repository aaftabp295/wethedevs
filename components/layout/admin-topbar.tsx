'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { siteConfig } from '@/lib/site.config';
import { ChevronRight, Globe, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

const adminNavItems = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Articles', href: '/admin/articles' },
  { label: 'Drafts', href: '/admin/drafts' },
  { label: 'New Article', href: '/admin/editor' },
  { label: 'Media Library', href: '/admin/media' },
  { label: 'Topics', href: '/admin/topics' },
  { label: 'Content Types', href: '/admin/content-types' },
  { label: 'SEO Dashboard', href: '/admin/seo' },
  { label: 'Settings', href: '/admin/settings' },
];

export function AdminTopbar() {
  const pathname = usePathname();

  // Determine route title/breadcrumb label
  const activeItem = adminNavItems.find(
    (item) => item.href !== '/admin' && pathname.startsWith(item.href)
  ) || adminNavItems[0];

  return (
    <header className="h-14 border-b border-border bg-background/95 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
      {/* Left: Studio Brand Logo + Dynamic Breadcrumb */}
      <div className="flex items-center gap-4">
        <Link href="/admin" className="font-bold tracking-tight text-base sm:text-lg flex items-center gap-2">
          <span>Publisher Studio</span>
        </Link>

        {pathname !== '/admin' && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-muted-foreground border-l border-border pl-3">
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-semibold">{activeItem.label}</span>
          </div>
        )}
      </div>

      {/* Right: Actions + Theme Toggle + User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/"
          target="_blank"
          className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
        >
          <Globe className="h-3.5 w-3.5" />
          <span>Live Site</span>
        </Link>

        <ThemeToggle />

        <div className="flex items-center gap-2 border-l border-border pl-2 sm:pl-3">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs">
              A
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-medium hidden md:inline-block">
            {siteConfig.author.name}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            title="Sign Out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
