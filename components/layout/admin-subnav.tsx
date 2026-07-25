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
  { label: 'Media', href: '/admin/media', icon: ImageIcon },
  { label: 'Topics', href: '/admin/topics', icon: Tags },
  { label: 'Types', href: '/admin/content-types', icon: FolderTree },
  { label: 'SEO', href: '/admin/seo', icon: Search },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminSubnav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-border overflow-x-auto">
      <nav className="flex items-center gap-1 min-w-max pb-2">
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
                'flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap',
                isActive
                  ? 'bg-secondary text-secondary-foreground font-semibold'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
