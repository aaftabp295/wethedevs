import { ThemeToggle } from '@/components/shared/theme-toggle';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { siteConfig } from '@/lib/site.config';

interface AdminTopbarProps {
  title?: string;
}

export function AdminTopbar({ title = 'Dashboard' }: AdminTopbarProps) {
  return (
    <header className="h-14 border-b border-border bg-background px-6 flex items-center justify-between sticky top-0 z-40">
      <h1 className="font-bold text-lg tracking-tight">{title}</h1>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="flex items-center gap-2 border-l border-border pl-3">
          <Avatar className="h-8 w-8">
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
