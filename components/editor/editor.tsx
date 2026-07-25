'use client';

import * as React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Underline } from '@tiptap/extension-underline';

import { Toolbar } from './toolbar';
import { LinkPicker } from './link-picker';
import { LinkSuggestions } from './link-suggestions';
import { PublishSidebar } from './publish-sidebar';
import { Button } from '@/components/ui/button';
import { useAutosave } from '@/hooks/use-autosave';
import { calculateReadingTime } from '@/lib/content/reading-time';
import { PublishSidebarState } from '@/types/editor';
import { ManifestEntry } from '@/types/content';
import { Send, Settings2, Clock, FileText, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EditorComponentProps {
  initialContent?: string;
  initialPublishState?: Partial<PublishSidebarState>;
  articleSlug?: string;
}

export function EditorComponent({
  initialContent = '',
  initialPublishState = {},
  articleSlug,
}: EditorComponentProps) {
  const router = useRouter();
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [linkPickerOpen, setLinkPickerOpen] = React.useState(false);
  const [publishSidebarOpen, setPublishSidebarOpen] = React.useState(false);
  const [isPublishing, setIsPublishing] = React.useState(false);

  const [publishState, setPublishState] = React.useState<PublishSidebarState>({
    title: initialPublishState.title || '',
    slug: initialPublishState.slug || articleSlug || '',
    description: initialPublishState.description || '',
    contentType: initialPublishState.contentType || 'alternatives',
    topic: initialPublishState.topic || 'AI Coding',
    tags: initialPublishState.tags || [],
    cover: initialPublishState.cover || '',
    metaTitle: initialPublishState.metaTitle || '',
    metaDescription: initialPublishState.metaDescription || '',
    canonical: initialPublishState.canonical || '',
    draft: initialPublishState.draft ?? true,
    featured: initialPublishState.featured ?? false,
  });

  const [stats, setStats] = React.useState({ words: 0, minutes: 1 });
  const [isDirty, setIsDirty] = React.useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-primary underline' },
      }),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder: 'Write your article here... (Use markdown headings, lists, tables)',
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      setIsDirty(true);
      const text = editor.getText();
      const calculated = calculateReadingTime(text);
      setStats(calculated);
    },
  });

  const editorState = React.useMemo(
    () => ({
      slug: articleSlug,
      contentHtml: editor?.getHTML() || '',
      publishState,
      isDirty,
      wordCount: stats.words,
      readingTime: stats.minutes,
    }),
    [articleSlug, editor, publishState, isDirty, stats]
  );

  const { lastSaved, saveToLocal } = useAutosave(
    articleSlug || 'new',
    editorState
  );

  const handleInsertLink = React.useCallback(
    (article: ManifestEntry) => {
      if (!editor) return;

      const linkUrl = `/${article.contentType}/${article.slug}`;
      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to, ' ');

      if (selectedText) {
        editor.chain().focus().setLink({ href: linkUrl }).run();
      } else {
        editor
          .chain()
          .focus()
          .insertContent(`<a href="${linkUrl}">${article.title}</a>`)
          .run();
      }
    },
    [editor]
  );

  const handlePublish = async () => {
    if (!publishState.title || !publishState.slug || !publishState.description) {
      setPublishSidebarOpen(true);
      return;
    }

    setIsPublishing(true);

    try {
      const payload = {
        ...publishState,
        contentHtml: editor?.getHTML() || '',
      };

      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const detailMsg = Array.isArray(data.details)
          ? data.details.join(', ')
          : data.details || data.error || 'Failed to publish article';
        throw new Error(detailMsg);
      }

      saveToLocal({ ...editorState, isDirty: false });
      setIsDirty(false);
      router.push('/admin/articles');
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Publish error';
      console.error('Publish error:', message);
      alert(`Publishing failed: ${message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-background p-6 overflow-y-auto' : ''}`}>
      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Article Title..."
            value={publishState.title}
            onChange={(e) => {
              setPublishState({ ...publishState, title: e.target.value });
              setIsDirty(true);
            }}
            className="text-2xl font-bold font-serif bg-transparent border-none outline-none focus:ring-0 w-full max-w-xl"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground border-r border-border pr-3">
            <span className="flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" /> {stats.words} words
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {stats.minutes} min read
            </span>
            {lastSaved && (
              <span className="flex items-center gap-1 text-success">
                <CheckCircle2 className="h-3.5 w-3.5" /> Saved {lastSaved}
              </span>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPublishSidebarOpen(true)}
            className="gap-1.5"
          >
            <Settings2 className="h-4 w-4" />
            <span>Publish Settings</span>
          </Button>

          <Button size="sm" onClick={handlePublish} disabled={isPublishing} className="gap-1.5">
            <Send className="h-4 w-4" />
            <span>Publish</span>
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <Toolbar
        editor={editor}
        onOpenLinkPicker={() => setLinkPickerOpen(true)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
      />

      {/* Main Grid: Editor Body + Link Suggestions Sidebar */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 pt-2">
        <div className="lg:col-span-8 space-y-4">
          <div className="min-h-[450px] rounded-lg border border-border bg-card p-6 shadow-xs prose prose-neutral dark:prose-invert max-w-none">
            <EditorContent editor={editor} />
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <LinkSuggestions
            topic={publishState.topic}
            onInsertLink={handleInsertLink}
          />
        </div>
      </div>

      {/* Link Picker Modal */}
      <LinkPicker
        open={linkPickerOpen}
        onOpenChange={setLinkPickerOpen}
        onSelectArticle={handleInsertLink}
      />

      {/* Publish Sidebar Panel */}
      <PublishSidebar
        open={publishSidebarOpen}
        onOpenChange={setPublishSidebarOpen}
        state={publishState}
        onChange={(newState) => {
          setPublishState(newState);
          setIsDirty(true);
        }}
        onPublish={handlePublish}
        isPublishing={isPublishing}
      />
    </div>
  );
}
