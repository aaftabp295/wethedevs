'use client';

import * as React from 'react';
import { BubbleMenu as TiptapBubbleMenu } from '@tiptap/react/menus';
import { type Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  Quote,
  Link2,
  Unlink,
  Code,
} from 'lucide-react';

interface BubbleMenuProps {
  editor: Editor | null;
  onOpenLinkPicker: () => void;
}

export function EditorBubbleMenu({ editor, onOpenLinkPicker }: BubbleMenuProps) {
  if (!editor) return null;

  const isLinkActive = editor.isActive('link');

  return (
    <TiptapBubbleMenu
      editor={editor}
      shouldShow={({ editor, from, to }) => {
        return from !== to && editor.isEditable && !editor.isActive('image');
      }}
      className="flex items-center gap-0.5 rounded-lg border border-border bg-popover/95 p-1 shadow-lg backdrop-blur-md"
    >
      {/* Bold */}
      <Button
        type="button"
        variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
        size="icon"
        className="h-7 w-7 text-xs"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleBold().run();
        }}
        title="Bold (Ctrl+B)"
      >
        <Bold className="h-3.5 w-3.5" />
      </Button>

      {/* Italic */}
      <Button
        type="button"
        variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
        size="icon"
        className="h-7 w-7 text-xs"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleItalic().run();
        }}
        title="Italic (Ctrl+I)"
      >
        <Italic className="h-3.5 w-3.5" />
      </Button>

      {/* Underline */}
      <Button
        type="button"
        variant={editor.isActive('underline') ? 'secondary' : 'ghost'}
        size="icon"
        className="h-7 w-7 text-xs"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleUnderline().run();
        }}
        title="Underline (Ctrl+U)"
      >
        <UnderlineIcon className="h-3.5 w-3.5" />
      </Button>

      {/* Code */}
      <Button
        type="button"
        variant={editor.isActive('code') ? 'secondary' : 'ghost'}
        size="icon"
        className="h-7 w-7 text-xs"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleCode().run();
        }}
        title="Inline Code"
      >
        <Code className="h-3.5 w-3.5" />
      </Button>

      <div className="mx-0.5 h-3.5 w-[1px] bg-border" />

      {/* Heading 2 */}
      <Button
        type="button"
        variant={editor.isActive('heading', { level: 2 }) ? 'secondary' : 'ghost'}
        size="icon"
        className="h-7 w-7 text-xs"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleHeading({ level: 2 }).run();
        }}
        title="Heading 2"
      >
        <Heading2 className="h-3.5 w-3.5" />
      </Button>

      {/* Heading 3 */}
      <Button
        type="button"
        variant={editor.isActive('heading', { level: 3 }) ? 'secondary' : 'ghost'}
        size="icon"
        className="h-7 w-7 text-xs"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleHeading({ level: 3 }).run();
        }}
        title="Heading 3"
      >
        <Heading3 className="h-3.5 w-3.5" />
      </Button>

      {/* Blockquote */}
      <Button
        type="button"
        variant={editor.isActive('blockquote') ? 'secondary' : 'ghost'}
        size="icon"
        className="h-7 w-7 text-xs"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleBlockquote().run();
        }}
        title="Quote"
      >
        <Quote className="h-3.5 w-3.5" />
      </Button>

      <div className="mx-0.5 h-3.5 w-[1px] bg-border" />

      {/* Insert / Edit Link */}
      <Button
        type="button"
        variant={isLinkActive ? 'secondary' : 'ghost'}
        size="icon"
        className={`h-7 w-7 text-xs ${isLinkActive ? 'text-primary font-bold bg-primary/10' : ''}`}
        onMouseDown={(e) => {
          e.preventDefault();
          onOpenLinkPicker();
        }}
        title={isLinkActive ? 'Edit Link' : 'Insert Link'}
      >
        <Link2 className="h-3.5 w-3.5" />
      </Button>

      {/* Quick Unlink button if text has an active link */}
      {isLinkActive && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-xs text-destructive hover:bg-destructive/10"
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
          }}
          title="Remove Link"
        >
          <Unlink className="h-3.5 w-3.5 text-destructive" />
        </Button>
      )}
    </TiptapBubbleMenu>
  );
}
