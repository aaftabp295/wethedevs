import Link from 'next/link';
import { Eye, ArrowLeft, X } from 'lucide-react';

interface DraftBannerProps {
  contentType: string;
  slug: string;
}

export function DraftBanner({ contentType, slug }: DraftBannerProps) {
  return (
    <div className="bg-zinc-950 text-zinc-100 border-b border-zinc-800 py-2.5 px-4 sm:px-6 text-xs font-medium select-none flex items-center justify-between sticky top-0 z-50 shadow-sm backdrop-blur-md">
      <div className="flex items-center gap-2.5">
        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        <Eye className="h-4 w-4 text-emerald-400 shrink-0" />
        <span className="font-semibold text-zinc-100 tracking-tight">
          Draft Preview Mode Active
        </span>
        <span className="hidden sm:inline text-zinc-400 font-normal">
          — Viewing real-time CMS edits
        </span>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <Link
          href={`/admin/editor/${slug}`}
          className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors font-medium text-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Back to Editor</span>
        </Link>
        <Link
          href={`/api/draft/disable?redirect=/${contentType}/${slug}`}
          className="inline-flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-2.5 py-1 rounded-md transition-colors font-semibold text-xs border border-zinc-700"
        >
          <X className="h-3.5 w-3.5" />
          <span>Exit Preview</span>
        </Link>
      </div>
    </div>
  );
}
