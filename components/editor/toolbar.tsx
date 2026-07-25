'use client';

import * as React from 'react';
import { type Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  Code,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Link2,
  Table as TableIcon,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface ToolbarProps {
  editor: Editor | null;
  onOpenLinkPicker: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export function Toolbar({
  editor,
  onOpenLinkPicker,
  isFullscreen,
  onToggleFullscreen,
}: ToolbarProps) {
  if (!editor) return null;

  return (
    <div className="sticky top-14 z-30 flex flex-wrap items-center gap-1 border-b border-border bg-background/95 p-2 backdrop-blur-sm">
      {/* Bold */}
      <Button
        type="button"
        variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold (Ctrl+B)"
      >
        <Bold className="h-4 w-4" />
      </Button>

      {/* Italic */}
      <Button
        type="button"
        variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic (Ctrl+I)"
      >
        <Italic className="h-4 w-4" />
      </Button>

      {/* Inline Code */}
      <Button
        type="button"
        variant={editor.isActive('code') ? 'secondary' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        onClick={() => editor.chain().focus().toggleCode().run()}
        title="Inline Code"
      >
        <Code className="h-4 w-4" />
      </Button>

      <div className="mx-1 h-4 w-[1px] bg-border" />

      {/* Heading 2 */}
      <Button
        type="button"
        variant={editor.isActive('heading', { level: 2 }) ? 'secondary' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </Button>

      {/* Heading 3 */}
      <Button
        type="button"
        variant={editor.isActive('heading', { level: 3 }) ? 'secondary' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        title="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </Button>

      <div className="mx-1 h-4 w-[1px] bg-border" />

      {/* Bullet List */}
      <Button
        type="button"
        variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>

      {/* Ordered List */}
      <Button
        type="button"
        variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      {/* Blockquote */}
      <Button
        type="button"
        variant={editor.isActive('blockquote') ? 'secondary' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        title="Blockquote"
      >
        <Quote className="h-4 w-4" />
      </Button>

      <div className="mx-1 h-4 w-[1px] bg-border" />

      {/* Internal Link Picker */}
      <Button
        type="button"
        variant={editor.isActive('link') ? 'secondary' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        onClick={onOpenLinkPicker}
        title="Insert Internal Link (Ctrl+K)"
      >
        <Link2 className="h-4 w-4" />
      </Button>

      {/* Table */}
      <Button
        type="button"
        variant={editor.isActive('table') ? 'secondary' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        onClick={() =>
          editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
        }
        title="Insert Table"
      >
        <TableIcon className="h-4 w-4" />
      </Button>

      <div className="ml-auto flex items-center gap-1">
        {/* Fullscreen Toggle */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Mode'}
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
