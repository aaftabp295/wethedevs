'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 shrink-0 border-r border-border bg-card p-4 flex-col justify-between sticky top-0 h-screen">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border pb-4">
          <Link href="/admin" className="font-bold tracking-tight text-lg">
            Publisher Studio
          </Link>
        </div>

        {/* Navigation */}
        <nav className="space-y-1" aria-label="Admin Navigation">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
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

      {/* Footer / Actions */}
      <div className="space-y-2 pt-4 border-t border-border">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Globe className="h-3.5 w-3.5 shrink-0" />
          <span>View Live Website</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-3.5 w-3.5 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
