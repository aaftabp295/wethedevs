import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  href?: string;
}

export function Logo({ className, href = '/' }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group inline-flex items-center gap-2.5 select-none transition-opacity hover:opacity-90',
        className
      )}
    >
      {/* Sleek Logo Monogram Symbol */}
      <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-background font-mono text-[0.7rem] font-black tracking-tighter shadow-xs transition-transform duration-200 group-hover:scale-105">
        &lt;/&gt;
      </span>

      {/* Editorial Typography Brandmark */}
      <span className="text-lg sm:text-xl font-bold font-serif tracking-tight text-foreground flex items-baseline">
        <span>We</span>
        <span className="font-serif italic font-normal text-foreground/80 mx-1 text-base sm:text-lg">
          the
        </span>
        <span className="tracking-tight">Devs</span>
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary ml-1 transform translate-y-[-2px]" />
      </span>
    </Link>
  );
}
