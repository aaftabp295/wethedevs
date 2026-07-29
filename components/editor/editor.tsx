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
import { marked } from 'marked';

import { EditorBubbleMenu } from './bubble-menu';
import { EditorFloatingMenu } from './floating-menu';
import { LinkPicker } from './link-picker';
import { ImagePicker } from './image-picker';
import { FAQBuilderModal, FAQItemData } from './faq-builder';
import { LinkSuggestions } from './link-suggestions';
import { PublishSidebar } from './publish-sidebar';
import { LivePreviewPane } from './live-preview-pane';
import { Button } from '@/components/ui/button';
import { useAutosave } from '@/hooks/use-autosave';
import { calculateReadingTime } from '@/lib/content/reading-time';
import { PublishSidebarState } from '@/types/editor';
import { ManifestEntry } from '@/types/content';
import { Send, Settings2, Clock, FileText, CheckCircle2, Maximize2, Minimize2, Image as ImageIcon, FileEdit, Eye, Columns, PenTool, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { mdxToEditorHtml, extractFaqsFromMdx } from '@/lib/publishing/serializer';

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
  const [imagePickerOpen, setImagePickerOpen] = React.useState(false);
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
    coverAlt: initialPublishState.coverAlt || '',
    metaTitle: initialPublishState.metaTitle || '',
    metaDescription: initialPublishState.metaDescription || '',
    canonical: initialPublishState.canonical || '',
    draft: initialPublishState.draft ?? false,
    featured: initialPublishState.featured ?? false,
  });

  const [stats, setStats] = React.useState({ words: 0, minutes: 1 });
  const [isDirty, setIsDirty] = React.useState(false);
  const [faqBuilderOpen, setFaqBuilderOpen] = React.useState(false);
  const [articleFaqs, setArticleFaqs] = React.useState<FAQItemData[]>(() => {
    return extractFaqsFromMdx(initialContent || '');
  });

  // Convert raw MDX string to Editor-friendly HTML
  const formattedInitialContent = React.useMemo(() => {
    if (!initialContent) return '';
    const htmlWithDetails = mdxToEditorHtml(initialContent);
    if (htmlWithDetails.includes('# ') || htmlWithDetails.includes('## ') || htmlWithDetails.includes('\n\n')) {
      try {
        return marked.parse(htmlWithDetails) as string;
      } catch {
        return htmlWithDetails;
      }
    }
    return htmlWithDetails;
  }, [initialContent]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        link: false,
        underline: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-primary underline cursor-pointer' },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-xl border border-border shadow-xs max-w-full h-auto my-6',
        },
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder: 'Tell your story... (Highlight text for formatting options)',
      }),
    ],
    content: formattedInitialContent,
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
    ({ url, openInNewTab, nofollow }: { url: string; openInNewTab?: boolean; nofollow?: boolean }) => {
      if (!editor) return;

      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to, ' ');

      const linkAttrs = {
        href: url,
        target: openInNewTab ? '_blank' : undefined,
        rel: nofollow ? 'nofollow' : undefined,
      };

      if (selectedText) {
        editor.chain().focus().extendMarkRange('link').setLink(linkAttrs).run();
      } else {
        const targetStr = openInNewTab ? ' target="_blank"' : '';
        const relStr = nofollow ? ' rel="nofollow"' : '';
        editor
          .chain()
          .focus()
          .insertContent(`<a href="${url}"${targetStr}${relStr}>${url}</a>`)
          .run();
      }
    },
    [editor]
  );

  const handleInsertArticle = React.useCallback(
    (article: ManifestEntry) => {
      const internalUrl = `/${article.contentType}/${article.slug}`;
      handleInsertLink({ url: internalUrl, openInNewTab: false, nofollow: false });
    },
    [handleInsertLink]
  );

  const handleRemoveLink = React.useCallback(() => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
  }, [editor]);

  const handleSaveFaqs = React.useCallback(
    (updatedFaqs: FAQItemData[]) => {
      setArticleFaqs(updatedFaqs);
      setIsDirty(true);

      if (!editor) return;

      const currentHtml = editor.getHTML();
      const cleanHtml = currentHtml
        .replace(/<details[^>]*>[\s\S]*?<\/details>/gi, '')
        .replace(/<h2[^>]*>[\s\S]*?(?:FAQ|Frequently Asked Questions)[\s\S]*?<\/h2>/gi, '')
        .trim();

      if (updatedFaqs.length === 0) {
        editor.commands.setContent(cleanHtml);
        return;
      }

      const faqHtmlList = updatedFaqs.map(
        (f) => `<details><summary>${f.question}</summary><p>${f.answer}</p></details>`
      );
      const faqSectionHtml = `<h2 id="frequently-asked-questions">Frequently asked questions</h2>${faqHtmlList.join('')}`;
      editor.commands.setContent(`${cleanHtml}\n\n${faqSectionHtml}`);
    },
    [editor]
  );

  const handleInsertImage = React.useCallback(
    ({ url, alt, title }: { url: string; alt: string; title?: string }) => {
      if (!editor) return;
      editor
        .chain()
        .focus()
        .setImage({ src: url, alt, title })
        .run();
    },
    [editor]
  );

  const handlePublish = async (asDraft?: boolean) => {
    const isDraft = typeof asDraft === 'boolean' ? asDraft : publishState.draft;

    if (!publishState.title || !publishState.slug || !publishState.description) {
      setPublishSidebarOpen(true);
      return;
    }

    setIsPublishing(true);

    try {
      const payload = {
        ...publishState,
        draft: isDraft,
        oldSlug: articleSlug || undefined,
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

      if (isDraft) {
        router.push('/admin/drafts');
      } else {
        router.push('/admin/articles');
      }
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Publish error';
      console.error('Publish error:', message);
      alert(`Publishing failed: ${message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const [viewMode, setViewMode] = React.useState<'edit' | 'split' | 'preview'>('edit');

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col h-screen w-screen overflow-hidden">
        {/* Pinned Top Action & Status Bar in Fullscreen Mode */}
        <div className="w-full border-b border-border bg-background/95 backdrop-blur-md px-6 sm:px-8 lg:px-10 py-3 flex flex-wrap items-center justify-between gap-4 shrink-0 z-30 shadow-2xs">
          {/* Left: Article Stats & View Mode Segmented Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 font-medium">
                <FileText className="h-3.5 w-3.5" /> {stats.words} words
              </span>
              <span className="flex items-center gap-1 font-medium">
                <Clock className="h-3.5 w-3.5" /> {stats.minutes} min read
              </span>
              {lastSaved && (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Saved {lastSaved}
                </span>
              )}
            </div>

            {/* View Mode Control: Write | Split | Preview */}
            <div className="flex items-center rounded-lg border border-border bg-muted/50 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('edit')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  viewMode === 'edit'
                    ? 'bg-background text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Writing Canvas Only"
              >
                <PenTool className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Write</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  viewMode === 'split'
                    ? 'bg-background text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Side-by-Side Split View"
              >
                <Columns className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Split</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  viewMode === 'preview'
                    ? 'bg-background text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Full Live Article Preview"
              >
                <Eye className="h-3.5 w-3.5 text-emerald-500" />
                <span className="hidden sm:inline">Preview</span>
              </button>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFaqBuilderOpen(true)}
              className="gap-1.5 text-xs font-medium border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
              title="Build & Manage Structured FAQs for Google Rich Snippets"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>FAQ Builder</span>
              {articleFaqs.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-[10px] font-bold">
                  {articleFaqs.length}
                </span>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setImagePickerOpen(true)}
              className="gap-1.5 text-xs font-medium"
              title="Insert Image with Alt Text"
            >
              <ImageIcon className="h-3.5 w-3.5" />
              <span>Add Image</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => setIsFullscreen(false)}
              title="Exit Fullscreen"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPublishSidebarOpen(true)}
              className="gap-1.5 text-xs font-medium"
            >
              <Settings2 className="h-3.5 w-3.5" />
              <span>Publish Settings</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePublish(true)}
              disabled={isPublishing}
              className="gap-1.5 text-xs font-medium"
              title="Save article as draft"
            >
              <FileEdit className="h-3.5 w-3.5" />
              <span>Save Draft</span>
            </Button>

            <Button
              size="sm"
              onClick={() => handlePublish(false)}
              disabled={isPublishing}
              className="gap-1.5 text-xs font-semibold"
              title="Publish article live to site"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isPublishing ? 'Publishing...' : 'Publish Live'}</span>
            </Button>
          </div>
        </div>

        {/* Scrollable Content Canvas in Fullscreen Mode */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10 space-y-6 max-w-7xl w-full mx-auto">
          {/* Article Title Input (Full Width) */}
          <div className="w-full pt-2">
            <input
              type="text"
              placeholder="Title"
              value={publishState.title}
              onChange={(e) => {
                setPublishState({ ...publishState, title: e.target.value });
                setIsDirty(true);
              }}
              className="editor-title-input text-3xl sm:text-4xl lg:text-5xl font-bold font-serif bg-transparent w-full placeholder:text-muted-foreground/40 tracking-tight leading-tight pb-2 transition-colors"
            />
          </div>

          {/* Main Grid Layout: Write | Split | Preview */}
          {viewMode === 'preview' ? (
            <div className="pt-2">
              <LivePreviewPane publishState={publishState} editorHtml={editor?.getHTML() || ''} />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 pt-2">
              {/* Editor Body */}
              <div className={viewMode === 'split' ? 'lg:col-span-6' : 'lg:col-span-8'}>
                <div className="relative min-h-[550px] rounded-xl border border-border/50 bg-card p-6 sm:p-10 shadow-xs transition-shadow hover:shadow-md">
                  <EditorBubbleMenu
                    editor={editor}
                    onOpenLinkPicker={() => setLinkPickerOpen(true)}
                  />

                  <EditorFloatingMenu
                    editor={editor}
                    onOpenImagePicker={() => setImagePickerOpen(true)}
                  />

                  <div className="prose prose-neutral dark:prose-invert max-w-none focus:outline-none leading-relaxed">
                    <EditorContent editor={editor} />
                  </div>
                </div>
              </div>

              {/* Right Column: Split Preview Pane OR Link Suggestions Sidebar */}
              <div className={
                viewMode === 'split'
                  ? 'lg:col-span-6 sticky top-4 self-start max-h-[calc(100vh-6rem)] overflow-hidden'
                  : 'lg:col-span-4 sticky top-4 self-start'
              }>
                {viewMode === 'split' ? (
                  <LivePreviewPane publishState={publishState} editorHtml={editor?.getHTML() || ''} />
                ) : (
                  <LinkSuggestions
                    topic={publishState.topic}
                    onInsertLink={handleInsertArticle}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modals & Sidebar */}
        <LinkPicker
          open={linkPickerOpen}
          onOpenChange={setLinkPickerOpen}
          onInsertLink={handleInsertLink}
          onRemoveLink={handleRemoveLink}
          initialUrl={editor?.getAttributes('link')?.href || ''}
          selectedText={
            editor
              ? editor.state.doc.textBetween(
                  editor.state.selection.from,
                  editor.state.selection.to,
                  ' '
                )
              : ''
          }
        />
        <ImagePicker
          open={imagePickerOpen}
          onOpenChange={setImagePickerOpen}
          onInsertImage={handleInsertImage}
        />
        <FAQBuilderModal
          open={faqBuilderOpen}
          onOpenChange={setFaqBuilderOpen}
          faqs={articleFaqs}
          onSaveFaqs={handleSaveFaqs}
        />
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

  return (
    <div className="space-y-6">
      {/* Top Action & Status Bar — Fixed/Sticky on Scroll in Normal Mode */}
      <div className="sticky top-[3.5rem] z-30 flex flex-wrap items-center justify-between gap-4 border-b border-border py-3 bg-background/95 backdrop-blur-md transition-all shadow-2xs -mx-6 px-6 sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10">
        {/* Left: Article Stats & View Mode Segmented Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 font-medium">
              <FileText className="h-3.5 w-3.5" /> {stats.words} words
            </span>
            <span className="flex items-center gap-1 font-medium">
              <Clock className="h-3.5 w-3.5" /> {stats.minutes} min read
            </span>
            {lastSaved && (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" /> Saved {lastSaved}
              </span>
            )}
          </div>

          {/* View Mode Control: Write | Split | Preview */}
          <div className="flex items-center rounded-lg border border-border bg-muted/50 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('edit')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'edit'
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Writing Canvas Only"
            >
              <PenTool className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Write</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'split'
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Side-by-Side Split View"
            >
              <Columns className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Split</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'preview'
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Full Live Article Preview"
            >
              <Eye className="h-3.5 w-3.5 text-emerald-500" />
              <span className="hidden sm:inline">Preview</span>
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setFaqBuilderOpen(true)}
            className="gap-1.5 text-xs font-medium border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
            title="Build & Manage Structured FAQs for Google Rich Snippets"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>FAQ Builder</span>
            {articleFaqs.length > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-[10px] font-bold">
                {articleFaqs.length}
              </span>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setImagePickerOpen(true)}
            className="gap-1.5 text-xs font-medium"
            title="Insert Image with Alt Text"
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>Add Image</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setIsFullscreen(true)}
            title="Fullscreen Mode"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPublishSidebarOpen(true)}
            className="gap-1.5 text-xs font-medium"
          >
            <Settings2 className="h-3.5 w-3.5" />
            <span>Publish Settings</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePublish(true)}
            disabled={isPublishing}
            className="gap-1.5 text-xs font-medium"
            title="Save article as draft"
          >
            <FileEdit className="h-3.5 w-3.5" />
            <span>Save Draft</span>
          </Button>

          <Button
            size="sm"
            onClick={() => handlePublish(false)}
            disabled={isPublishing}
            className="gap-1.5 text-xs font-semibold"
            title="Publish article live to site"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{isPublishing ? 'Publishing...' : 'Publish Live'}</span>
          </Button>
        </div>
      </div>

      {/* Article Title Input (Full Width) */}
      <div className="w-full pt-2">
        <input
          type="text"
          placeholder="Title"
          value={publishState.title}
          onChange={(e) => {
            setPublishState({ ...publishState, title: e.target.value });
            setIsDirty(true);
          }}
          className="editor-title-input text-3xl sm:text-4xl lg:text-5xl font-bold font-serif bg-transparent w-full placeholder:text-muted-foreground/40 tracking-tight leading-tight pb-2 transition-colors"
        />
      </div>

      {/* Main Grid Layout: Write | Split | Preview */}
      {viewMode === 'preview' ? (
        <div className="pt-2">
          <LivePreviewPane publishState={publishState} editorHtml={editor?.getHTML() || ''} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 pt-2">
          {/* Editor Body */}
          <div className={viewMode === 'split' ? 'lg:col-span-6' : 'lg:col-span-8'}>
            <div className="relative min-h-[550px] rounded-xl border border-border/50 bg-card p-6 sm:p-10 shadow-xs transition-shadow hover:shadow-md">
              <EditorBubbleMenu
                editor={editor}
                onOpenLinkPicker={() => setLinkPickerOpen(true)}
              />

              <EditorFloatingMenu
                editor={editor}
                onOpenImagePicker={() => setImagePickerOpen(true)}
              />

              <div className="prose prose-neutral dark:prose-invert max-w-none focus:outline-none leading-relaxed">
                <EditorContent editor={editor} />
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Split Preview Pane OR Link Suggestions Sidebar */}
          <div className={
            viewMode === 'split'
              ? 'lg:col-span-6 sticky top-[7.5rem] self-start max-h-[calc(100vh-8.5rem)] overflow-hidden'
              : 'lg:col-span-4 sticky top-[7.5rem] self-start'
          }>
            {viewMode === 'split' ? (
              <LivePreviewPane publishState={publishState} editorHtml={editor?.getHTML() || ''} />
            ) : (
              <LinkSuggestions
                topic={publishState.topic}
                onInsertLink={handleInsertArticle}
              />
            )}
          </div>
        </div>
      )}

      {/* Link Picker Modal */}
      <LinkPicker
        open={linkPickerOpen}
        onOpenChange={setLinkPickerOpen}
        onInsertLink={handleInsertLink}
        onRemoveLink={handleRemoveLink}
        initialUrl={editor?.getAttributes('link')?.href || ''}
        selectedText={
          editor
            ? editor.state.doc.textBetween(
                editor.state.selection.from,
                editor.state.selection.to,
                ' '
              )
            : ''
        }
      />

      {/* SEO Image Picker Modal */}
      <ImagePicker
        open={imagePickerOpen}
        onOpenChange={setImagePickerOpen}
        onInsertImage={handleInsertImage}
      />

      {/* Article FAQ Builder Modal */}
      <FAQBuilderModal
        open={faqBuilderOpen}
        onOpenChange={setFaqBuilderOpen}
        faqs={articleFaqs}
        onSaveFaqs={handleSaveFaqs}
      />

      {/* Publish Sidebar Settings Panel */}
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
