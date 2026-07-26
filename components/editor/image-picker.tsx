'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Image as ImageIcon } from 'lucide-react';

interface ImagePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsertImage: (data: { url: string; alt: string; title?: string }) => void;
}

const SAMPLE_IMAGES = [
  {
    label: 'Code Editor',
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    alt: 'Developer writing code in a modern IDE',
  },
  {
    label: 'Developer Desk',
    url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    alt: 'Laptop showing web application design on a workspace desk',
  },
  {
    label: 'AI & Data Visual',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    alt: 'Matrix green code background representing AI models',
  },
];

export function ImagePicker({
  open,
  onOpenChange,
  onInsertImage,
}: ImagePickerProps) {
  const [url, setUrl] = React.useState('');
  const [alt, setAlt] = React.useState('');
  const [caption, setCaption] = React.useState('');
  const [previewStatus, setPreviewStatus] = React.useState<'idle' | 'loading' | 'valid' | 'invalid'>('idle');

  React.useEffect(() => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;

    let isMounted = true;
    const img = new Image();
    img.src = trimmedUrl;
    img.onload = () => {
      if (isMounted) setPreviewStatus('valid');
    };
    img.onerror = () => {
      if (isMounted) setPreviewStatus('invalid');
    };

    return () => {
      isMounted = false;
    };
  }, [url]);

  const handleInsert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    onInsertImage({
      url: url.trim(),
      alt: alt.trim() || 'Article illustration',
      title: caption.trim() || undefined,
    });

    setUrl('');
    setAlt('');
    setCaption('');
    setPreviewStatus('idle');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            <span>Insert Article Image</span>
          </DialogTitle>
          <DialogDescription>
            Provide a direct image URL with SEO-optimized alternative text.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleInsert} className="space-y-4 py-2">
          {/* Quick Preset Sample Images */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">
              Quick Unsplash Samples:
            </label>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_IMAGES.map((sample) => (
                <Badge
                  key={sample.label}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors text-xs py-1"
                  onClick={() => {
                    setUrl(sample.url);
                    setAlt(sample.alt);
                    setCaption(sample.label);
                  }}
                >
                  + {sample.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Image URL Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Direct Image URL <span className="text-destructive">*</span></span>
              {previewStatus === 'valid' && (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Valid Image URL
                </span>
              )}
            </label>
            <Input
              type="url"
              placeholder="https://images.unsplash.com/... (.jpg, .png, .webp)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="text-sm"
            />
          </div>

          {/* Validation Warning Alert */}
          {previewStatus === 'invalid' && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Invalid or Webpage URL</p>
                <p className="mt-0.5 text-[11px] opacity-90">
                  The URL provided does not point directly to an image file (it may be an HTML blog page). Make sure to right-click the image and select <strong>&quot;Copy Image Address&quot;</strong> (.jpg, .png, .webp).
                </p>
              </div>
            </div>
          )}

          {/* Live Preview Box */}
          {previewStatus === 'valid' && (
            <div className="rounded-lg border border-border bg-muted/20 p-2 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt="Preview"
                className="mx-auto max-h-40 rounded-md object-contain shadow-xs"
              />
            </div>
          )}

          {/* Alt Text (SEO Critical) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Alt Text (SEO Keyword)</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                Google SEO Best Practice
              </span>
            </label>
            <Input
              type="text"
              placeholder="Descriptive text explaining what is shown in the image..."
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              className="text-sm"
            />
            <p className="text-[11px] text-muted-foreground">
              Describe the image for search engines and screen readers.
            </p>
          </div>

          {/* Caption (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Caption (Optional)
            </label>
            <Input
              type="text"
              placeholder="Optional caption text shown under the image..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="text-sm"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!url.trim() || previewStatus === 'invalid'}>
              Insert Image
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
