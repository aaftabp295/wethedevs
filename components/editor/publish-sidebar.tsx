'use client';

import * as React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { contentTypes } from '@/lib/content/content-types.config';
import { ContentTypeSlug } from '@/types/content';
import { PublishSidebarState } from '@/types/editor';
import { slugify } from '@/lib/utils';
import { Send, Image as ImageIcon, X } from 'lucide-react';

interface PublishSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  state: PublishSidebarState;
  onChange: (state: PublishSidebarState) => void;
  onPublish: () => void;
  isPublishing?: boolean;
}

export function PublishSidebar({
  open,
  onOpenChange,
  state,
  onChange,
  onPublish,
  isPublishing = false,
}: PublishSidebarProps) {
  const [tagInput, setTagInput] = React.useState('');

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const cleanTag = slugify(tagInput.trim());
    if (!state.tags.includes(cleanTag)) {
      onChange({ ...state, tags: [...state.tags, cleanTag] });
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange({
      ...state,
      tags: state.tags.filter((t) => t !== tagToRemove),
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto space-y-6">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold">Publishing Settings</SheetTitle>
          <SheetDescription>
            Configure frontmatter metadata, SEO overrides, and content taxonomy.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 text-xs">
          {/* Article Title */}
          <div className="space-y-1.5">
            <label className="font-semibold text-muted-foreground">Title</label>
            <Input
              value={state.title}
              onChange={(e) => {
                const newTitle = e.target.value;
                onChange({
                  ...state,
                  title: newTitle,
                  slug: state.slug || slugify(newTitle),
                });
              }}
              placeholder="Article title..."
            />
          </div>

          {/* URL Slug */}
          <div className="space-y-1.5">
            <label className="font-semibold text-muted-foreground">URL Slug</label>
            <Input
              value={state.slug}
              onChange={(e) =>
                onChange({
                  ...state,
                  slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                })
              }
              onBlur={() => {
                if (state.slug) {
                  onChange({ ...state, slug: slugify(state.slug) });
                }
              }}
              placeholder="kebab-case-slug"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="font-semibold text-muted-foreground">Description</label>
            <Textarea
              value={state.description}
              onChange={(e) => onChange({ ...state, description: e.target.value })}
              placeholder="Brief summary for listings and SEO..."
              rows={3}
            />
          </div>

          {/* Content Type */}
          <div className="space-y-1.5">
            <label className="font-semibold text-muted-foreground">Content Type</label>
            <Select
              value={state.contentType}
              onValueChange={(val) =>
                onChange({ ...state, contentType: val as ContentTypeSlug })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select content type" />
              </SelectTrigger>
              <SelectContent>
                {contentTypes.map((ct) => (
                  <SelectItem key={ct.slug} value={ct.slug}>
                    {ct.pluralLabel} (/{ct.slug})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Topic */}
          <div className="space-y-1.5">
            <label className="font-semibold text-muted-foreground">Topic</label>
            <Input
              value={state.topic}
              onChange={(e) => onChange({ ...state, topic: e.target.value })}
              placeholder="e.g. AI Coding, Infrastructure, Security"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="font-semibold text-muted-foreground">Tags</label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add tag and press Enter"
              />
              <Button type="button" variant="outline" size="sm" onClick={handleAddTag}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {state.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1 text-[10px]">
                  #{tag}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => handleRemoveTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Cover Image Path */}
          <div className="space-y-1.5">
            <label className="font-semibold text-muted-foreground">Cover Image Relative Path</label>
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                value={state.cover || ''}
                onChange={(e) => onChange({ ...state, cover: e.target.value })}
                placeholder="./cover.webp"
              />
            </div>
          </div>

          {/* SEO Overrides Header */}
          <div className="pt-4 border-t border-border space-y-3">
            <h4 className="font-bold text-sm text-foreground">SEO Overrides (Optional)</h4>

            <div className="space-y-1.5">
              <label className="font-semibold text-muted-foreground">Meta Title</label>
              <Input
                value={state.metaTitle || ''}
                onChange={(e) => onChange({ ...state, metaTitle: e.target.value })}
                placeholder="Override title tag..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-muted-foreground">Meta Description</label>
              <Textarea
                value={state.metaDescription || ''}
                onChange={(e) => onChange({ ...state, metaDescription: e.target.value })}
                placeholder="Override meta description..."
                rows={2}
              />
            </div>
          </div>

          {/* Draft Toggle */}
          <div className="pt-4 border-t border-border flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">Save as Draft</p>
              <p className="text-[11px] text-muted-foreground">Drafts are hidden from public listings.</p>
            </div>
            <input
              type="checkbox"
              checked={state.draft}
              onChange={(e) => onChange({ ...state, draft: e.target.checked })}
              className="h-4 w-4 rounded border-border"
            />
          </div>

          {/* Submit / Publish Action */}
          <div className="pt-6">
            <Button
              className="w-full gap-2"
              size="lg"
              onClick={onPublish}
              disabled={isPublishing}
            >
              <Send className="h-4 w-4" />
              <span>{isPublishing ? 'Publishing...' : state.draft ? 'Save Draft' : 'Publish Article'}</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
