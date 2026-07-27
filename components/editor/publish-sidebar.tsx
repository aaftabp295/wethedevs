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
import { Send, Image as ImageIcon, X, FileEdit, Upload, Loader2, CheckCircle2 } from 'lucide-react';

interface PublishSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  state: PublishSidebarState;
  onChange: (state: PublishSidebarState) => void;
  onPublish: (asDraft?: boolean) => void;
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
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadSuccess, setUploadSuccess] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

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

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('slug', state.slug || 'article');

      const res = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload image');
      }

      // Update cover image URL in state
      onChange({
        ...state,
        cover: data.url,
      });

      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Image upload failed';
      setUploadError(msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
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

          {/* Cover Image Upload & URL */}
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-muted-foreground">Cover Image</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif,image/svg+xml"
                onChange={handleImageFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="h-7 text-[11px] gap-1.5"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-3 w-3" />
                    <span>Upload Image File</span>
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                value={state.cover || ''}
                onChange={(e) => onChange({ ...state, cover: e.target.value })}
                placeholder="/images/covers/hero.png or https://..."
              />
            </div>

            {uploadSuccess && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="h-3 w-3" />
                Image committed to repo & saved to cover!
              </p>
            )}

            {uploadError && (
              <p className="text-[11px] text-destructive font-medium">
                ❌ {uploadError}
              </p>
            )}

            <p className="text-[11px] text-muted-foreground">
              Upload a local PNG/JPG file to self-host in your GitHub repo under `/images/covers/`, or paste a URL.
            </p>
          </div>

          {/* Cover Image Alt Text */}
          <div className="space-y-1.5">
            <label className="font-semibold text-muted-foreground">Cover Image Alt Text (SEO)</label>
            <Input
              value={state.coverAlt || ''}
              onChange={(e) => onChange({ ...state, coverAlt: e.target.value })}
              placeholder="Descriptive alt text for Google Image SEO..."
            />
            <p className="text-[11px] text-muted-foreground">
              Accessibility and image search keyword optimization (defaults to title).
            </p>
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

          {/* Dual Action Buttons */}
          <div className="pt-6 grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => onPublish(true)}
              disabled={isPublishing || isUploading}
              className="gap-1.5 text-xs font-semibold"
            >
              <FileEdit className="h-4 w-4" />
              <span>Save as Draft</span>
            </Button>

            <Button
              type="button"
              size="lg"
              onClick={() => onPublish(false)}
              disabled={isPublishing || isUploading}
              className="gap-1.5 text-xs font-semibold"
            >
              <Send className="h-4 w-4" />
              <span>{isPublishing ? 'Publishing...' : 'Publish Live'}</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
