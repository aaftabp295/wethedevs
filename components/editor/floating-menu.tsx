'use client';

import * as React from 'react';
import { FloatingMenu as TiptapFloatingMenu } from '@tiptap/react/menus';
import { type Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import {
  Heading2,
  List,
  Quote,
  Table as TableIcon,
  Plus,
  Code2,
  Minus,
  Image as ImageIcon,
} from 'lucide-react';

interface FloatingMenuProps {
  editor: Editor | null;
  onOpenImagePicker?: () => void;
}

export function EditorFloatingMenu({ editor, onOpenImagePicker }: FloatingMenuProps) {
  const [open, setOpen] = React.useState(false);

  if (!editor) return null;

  return (
    <TiptapFloatingMenu
      editor={editor}
      className="flex items-center gap-1 -translate-x-10 -ml-2"
    >
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-7 w-7 rounded-full border-border bg-background shadow-xs hover:bg-accent text-muted-foreground transition-transform"
        onClick={() => setOpen(!open)}
        title="Add Block"
      >
        <Plus className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-45' : ''}`} />
      </Button>

      {open && (
        <div className="flex items-center gap-1 rounded-full border border-border bg-popover/95 p-1 shadow-md backdrop-blur-md animate-in fade-in slide-in-from-left-2">
          {/* H2 */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full"
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleHeading({ level: 2 }).run();
              setOpen(false);
            }}
            title="Heading 2"
          >
            <Heading2 className="h-3.5 w-3.5" />
          </Button>

          {/* List */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full"
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleBulletList().run();
              setOpen(false);
            }}
            title="Bullet List"
          >
            <List className="h-3.5 w-3.5" />
          </Button>

          {/* Quote */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full"
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleBlockquote().run();
              setOpen(false);
            }}
            title="Blockquote"
          >
            <Quote className="h-3.5 w-3.5" />
          </Button>

          {/* Image */}
          {onOpenImagePicker && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
              onMouseDown={(e) => {
                e.preventDefault();
                setOpen(false);
                onOpenImagePicker();
              }}
              title="Insert Image (SEO Alt Text)"
            >
              <ImageIcon className="h-3.5 w-3.5" />
            </Button>
          )}

          {/* Code Block */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full"
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleCodeBlock().run();
              setOpen(false);
            }}
            title="Code Block"
          >
            <Code2 className="h-3.5 w-3.5" />
          </Button>

          {/* Table */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full"
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
              setOpen(false);
            }}
            title="Insert Table"
          >
            <TableIcon className="h-3.5 w-3.5" />
          </Button>

          {/* Divider */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full"
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().setHorizontalRule().run();
              setOpen(false);
            }}
            title="Divider"
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </TiptapFloatingMenu>
  );
}
