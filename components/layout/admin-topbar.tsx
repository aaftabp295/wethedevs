'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { siteConfig } from '@/lib/site.config';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  FileEdit,
  FolderTree,
  Tags,
  Search,
  Settings,
  Image as ImageIcon,
  LogOut,
  PenSquare,
  Globe,
  Menu,
  ChevronRight,
} from 'lucide-react';
import { signOut } from 'next-auth/react';

const adminNavItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Articles', href: '/admin/articles', icon: FileText },
  { label: 'Drafts', href: '/admin/drafts', icon: FileEdit },
  { label: 'New Article', href: '/admin/editor', icon: PenSquare },
  { label: 'Media Library', href: '/admin/media', icon: ImageIcon },
  { label: 'Topics', href: '/admin/topics', icon: Tags },
  { label: 'Content Types', href: '/admin/content-types', icon: FolderTree },
  { label: 'SEO Dashboard', href: '/admin/seo', icon: Search },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminTopbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Determine route title/breadcrumb label
  const activeItem = adminNavItems.find(
    (item) => item.href !== '/admin' && pathname.startsWith(item.href)
  ) || adminNavItems[0];

  return (
    <header className="h-14 border-b border-border bg-background/95 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
      {/* Left: Mobile Menu Trigger + Breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Mobile Sidebar Sheet Trigger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8">
              <Menu className="h-4 w-4" />
              <span className="sr-only">Toggle Admin Navigation</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-4 flex flex-col justify-between">
            <div className="space-y-6">
              <SheetHeader>
                <SheetTitle className="font-bold tracking-tight text-lg text-left">
                  Publisher Studio
                </SheetTitle>
              </SheetHeader>
              <nav className="space-y-1">
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/admin' && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="space-y-2 pt-4 border-t border-border">
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <Globe className="h-3.5 w-3.5 shrink-0" />
                <span>View Live Website</span>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/admin/login' })}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-3.5 w-3.5 shrink-0" />
                <span>Sign Out</span>
              </button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Dynamic Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Link href="/admin" className="hover:text-foreground transition-colors">
            Studio
          </Link>
          {pathname !== '/admin' && (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-foreground font-semibold">{activeItem.label}</span>
            </>
          )}
        </div>
      </div>

      {/* Right: Theme Toggle + User Profile */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="flex items-center gap-2 border-l border-border pl-3">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs">
              A
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-medium hidden sm:inline-block">
            {siteConfig.author.name}
          </span>
        </div>
      </div>
    </header>
  );
}
