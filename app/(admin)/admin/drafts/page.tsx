import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/content/empty-state';
import { PenSquare } from 'lucide-react';

export default function AdminDraftsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Drafts</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Work in progress articles saved locally or auto-saved.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/admin/editor">
            <PenSquare className="h-4 w-4" />
            <span>New Draft</span>
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Saved Drafts</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="No active drafts"
            description="You don't have any saved drafts. Start a new article in the Tiptap editor."
            actionLabel="Open Editor"
            actionHref="/admin/editor"
          />
        </CardContent>
      </Card>
    </div>
  );
}
