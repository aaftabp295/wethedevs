'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  FileEdit,
  PenSquare,
  ImageIcon,
  Tags,
  FolderTree,
  Search,
  Settings,
} from 'lucide-react';

const subNavItems = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Articles', href: '/admin/articles', icon: FileText },
  { label: 'Drafts', href: '/admin/drafts', icon: FileEdit },
  { label: 'New Article', href: '/admin/editor', icon: PenSquare },
  { label: 'Media Library', href: '/admin/media', icon: ImageIcon },
  { label: 'Topics', href: '/admin/topics', icon: Tags },
  { label: 'Content Types', href: '/admin/content-types', icon: FolderTree },
  { label: 'SEO Dashboard', href: '/admin/seo', icon: Search },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminSubnav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-border overflow-x-auto no-scrollbar">
      <nav className="flex items-center gap-1.5 min-w-max pb-3">
        {subNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 whitespace-nowrap',
                isActive
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
