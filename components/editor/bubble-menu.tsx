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
  List,
  ListOrdered,
} from 'lucide-react';

interface BubbleMenuProps {
  editor: Editor | null;
  onOpenLinkPicker: () => void;
}

export function EditorBubbleMenu({ editor, onOpenLinkPicker }: BubbleMenuProps) {
  if (!editor) return null;

  const isLinkActive = editor.isActive('link');
  
  // Check if current block or text selection has a numbered list prefix like "1. ", "2. "
  const parentNode = editor.state.selection.$from.parent;
  const parentText = parentNode ? parentNode.textContent : '';
  const hasNumberPrefix = /^\d+\.\s+/.test(parentText.trim());

  const isOrderedListActive = editor.isActive('orderedList') || hasNumberPrefix;
  const isBulletListActive = editor.isActive('bulletList');

  // Toggle Numbered List on both Paragraphs and Headings (H2/H3)
  const handleToggleOrderedList = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!editor) return;

    const isHeading = editor.isActive('heading');

    if (isHeading) {
      // If it's a heading, toggle "1. " prefix on heading text
      if (hasNumberPrefix) {
        // Strip number prefix: "1. Lovable" -> "Lovable"
        const cleanText = parentText.replace(/^\d+\.\s+/, '');
        editor.chain().focus().command(({ tr, dispatch }) => {
          if (dispatch) {
            const pos = editor.state.selection.$from.start();
            const endPos = pos + parentText.length;
            tr.insertText(cleanText, pos, endPos);
          }
          return true;
        }).run();
      } else {
        // Count existing numbered headings in document to get current index
        let count = 1;
        editor.state.doc.descendants((node) => {
          if (node.isBlock && /^\d+\.\s+/.test(node.textContent)) {
            count++;
          }
        });
        const numberedText = `${count}. ${parentText}`;
        editor.chain().focus().command(({ tr, dispatch }) => {
          if (dispatch) {
            const pos = editor.state.selection.$from.start();
            const endPos = pos + parentText.length;
            tr.insertText(numberedText, pos, endPos);
          }
          return true;
        }).run();
      }
    } else {
      // If it's a regular paragraph or list item, use standard TipTap toggleOrderedList
      editor.chain().focus().toggleOrderedList().run();
    }
  };

  // Toggle H2 on both standard text and Numbered Lists
  const handleToggleH2 = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!editor) return;

    if (editor.isActive('orderedList')) {
      // Lift from list and convert to H2 with number prefix preserved
      editor.chain().focus().liftListItem('listItem').toggleHeading({ level: 2 }).run();
    } else if (editor.isActive('heading', { level: 2 })) {
      if (hasNumberPrefix) {
        // Keep H2, just strip number prefix
        const cleanText = parentText.replace(/^\d+\.\s+/, '');
        editor.chain().focus().command(({ tr, dispatch }) => {
          if (dispatch) {
            const pos = editor.state.selection.$from.start();
            const endPos = pos + parentText.length;
            tr.insertText(cleanText, pos, endPos);
          }
          return true;
        }).run();
      } else {
        editor.chain().focus().toggleHeading({ level: 2 }).run();
      }
    } else {
      editor.chain().focus().toggleHeading({ level: 2 }).run();
    }
  };

  // Toggle H3 on both standard text and Numbered Lists
  const handleToggleH3 = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!editor) return;

    if (editor.isActive('orderedList')) {
      editor.chain().focus().liftListItem('listItem').toggleHeading({ level: 3 }).run();
    } else if (editor.isActive('heading', { level: 3 })) {
      if (hasNumberPrefix) {
        const cleanText = parentText.replace(/^\d+\.\s+/, '');
        editor.chain().focus().command(({ tr, dispatch }) => {
          if (dispatch) {
            const pos = editor.state.selection.$from.start();
            const endPos = pos + parentText.length;
            tr.insertText(cleanText, pos, endPos);
          }
          return true;
        }).run();
      } else {
        editor.chain().focus().toggleHeading({ level: 3 }).run();
      }
    } else {
      editor.chain().focus().toggleHeading({ level: 3 }).run();
    }
  };

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
        onMouseDown={handleToggleH2}
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
        onMouseDown={handleToggleH3}
        title="Heading 3"
      >
        <Heading3 className="h-3.5 w-3.5" />
      </Button>

      {/* Bullet List */}
      <Button
        type="button"
        variant={isBulletListActive ? 'secondary' : 'ghost'}
        size="icon"
        className="h-7 w-7 text-xs"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleBulletList().run();
        }}
        title="Bullet List"
      >
        <List className="h-3.5 w-3.5" />
      </Button>

      {/* Numbered (Ordered) List */}
      <Button
        type="button"
        variant={isOrderedListActive ? 'secondary' : 'ghost'}
        size="icon"
        className="h-7 w-7 text-xs"
        onMouseDown={handleToggleOrderedList}
        title="Numbered List"
      >
        <ListOrdered className="h-3.5 w-3.5" />
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
