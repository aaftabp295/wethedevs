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
import {
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  CloudUpload,
} from 'lucide-react';

interface ImagePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsertImage: (data: { url: string; alt: string; title?: string }) => void;
  articleSlug?: string;
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
  articleSlug = 'article',
}: ImagePickerProps) {
  const [activeTab, setActiveTab] = React.useState<'upload' | 'url'>('upload');
  const [file, setFile] = React.useState<File | null>(null);
  const [filePreview, setFilePreview] = React.useState<string | null>(null);
  const [url, setUrl] = React.useState('');
  const [alt, setAlt] = React.useState('');
  const [caption, setCaption] = React.useState('');
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = React.useState(false);
  const [previewStatus, setPreviewStatus] = React.useState<'idle' | 'valid' | 'invalid'>('idle');

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Reset state on open
  React.useEffect(() => {
    if (open) {
      setFile(null);
      setFilePreview(null);
      setUrl('');
      setAlt('');
      setCaption('');
      setIsUploading(false);
      setUploadError(null);
      setUploadSuccess(false);
      setPreviewStatus('idle');
    }
  }, [open]);

  // Handle direct URL preview validation
  React.useEffect(() => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setPreviewStatus('idle');
      return;
    }

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

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setUploadError(null);
    setUploadSuccess(false);

    // Auto-generate Alt text from filename if empty
    if (!alt.trim()) {
      const cleanName = selectedFile.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .trim();
      setAlt(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    // Create thumbnail preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  // Upload file to Supabase Storage via /api/media
  const handleUploadToSupabase = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('slug', articleSlug);

      const res = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.details || 'Failed to upload image');
      }

      setUrl(data.url);
      setUploadSuccess(true);
      setPreviewStatus('valid');

      // Auto-insert image into article body upon successful Supabase upload
      onInsertImage({
        url: data.url,
        alt: alt.trim() || 'Article illustration',
        title: caption.trim() || undefined,
      });

      onOpenChange(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setUploadError(message);
    } finally {
      setIsUploading(false);
    }
  };

  // Insert URL image
  const handleInsertUrlImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    onInsertImage({
      url: url.trim(),
      alt: alt.trim() || 'Article illustration',
      title: caption.trim() || undefined,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg w-full p-6 space-y-4 overflow-hidden rounded-xl border border-border bg-background shadow-xl">
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <ImageIcon className="h-5 w-5 text-primary" />
            <span>Add Article Image</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Upload an image to your Supabase Storage bucket or insert a direct web image URL.
          </DialogDescription>
        </DialogHeader>

        {/* Tab Selection: Upload to Supabase vs Direct URL */}
        <div className="grid grid-cols-2 rounded-lg border border-border bg-muted/50 p-1 gap-1 w-full">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-medium rounded-md transition-all ${
              activeTab === 'upload'
                ? 'bg-background text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <CloudUpload className="h-3.5 w-3.5" />
            <span>Upload to Supabase</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-medium rounded-md transition-all ${
              activeTab === 'url'
                ? 'bg-background text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LinkIcon className="h-3.5 w-3.5" />
            <span>Direct Image URL</span>
          </button>
        </div>

        {/* Tab 1: Upload to Supabase Storage */}
        {activeTab === 'upload' && (
          <div className="space-y-4 pt-1">
            {/* File Drag & Drop Box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-primary/60 bg-muted/20 hover:bg-muted/40 rounded-xl p-6 text-center cursor-pointer transition-colors space-y-2 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml"
                onChange={handleFileChange}
                className="hidden"
              />

              {filePreview ? (
                <div className="space-y-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={filePreview}
                    alt="Selected Preview"
                    className="mx-auto max-h-36 rounded-lg object-contain border border-border shadow-xs"
                  />
                  <div className="text-xs font-medium text-foreground">
                    {file?.name} ({(file!.size / 1024).toFixed(1)} KB)
                  </div>
                  <p className="text-[11px] text-primary underline">Click to change image</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      Click or drag an image here to upload
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Supports PNG, JPG, WebP, AVIF, SVG (max 10MB)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Error Banner */}
            {uploadError && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="font-medium">{uploadError}</p>
              </div>
            )}

            {/* Success Banner */}
            {uploadSuccess && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <p className="font-medium">Uploaded successfully to Supabase Bucket!</p>
              </div>
            )}

            {/* Alt Text (SEO Critical) */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center justify-between">
                <span>Alt Text (SEO Keyword)</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-medium flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> SEO Best Practice
                </span>
              </label>
              <Input
                type="text"
                placeholder="Descriptive text explaining what is shown in the image..."
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                className="text-xs"
              />
            </div>

            {/* Optional Caption */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground block">
                Caption (Optional)
              </label>
              <Input
                type="text"
                placeholder="Optional caption text..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="text-xs"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-xs h-8"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={!file || isUploading}
                onClick={handleUploadToSupabase}
                className="text-xs font-semibold h-8 bg-primary text-primary-foreground gap-1.5"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Uploading to Supabase...</span>
                  </>
                ) : (
                  <>
                    <CloudUpload className="h-3.5 w-3.5" />
                    <span>Upload & Insert Image</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Tab 2: Direct Image URL */}
        {activeTab === 'url' && (
          <form onSubmit={handleInsertUrlImage} className="space-y-4 pt-1">
            {/* Unsplash Quick Presets */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-muted-foreground block">
                Quick Unsplash Samples:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_IMAGES.map((sample) => (
                  <Badge
                    key={sample.label}
                    variant="outline"
                    className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors text-[11px] py-0.5 px-2"
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

            {/* Direct Image URL Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center justify-between">
                <span>Direct Image URL</span>
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
                className="text-xs font-mono"
              />
            </div>

            {/* Live Preview Box */}
            {previewStatus === 'valid' && (
              <div className="rounded-lg border border-border bg-muted/20 p-2 text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt="Preview"
                  className="mx-auto max-h-36 rounded-md object-contain shadow-xs"
                />
              </div>
            )}

            {/* Alt Text */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground block">
                Alt Text (SEO Keyword)
              </label>
              <Input
                type="text"
                placeholder="Descriptive text..."
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                className="text-xs"
              />
            </div>

            {/* Caption */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground block">
                Caption (Optional)
              </label>
              <Input
                type="text"
                placeholder="Optional caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="text-xs"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-xs h-8"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!url.trim() || previewStatus === 'invalid'}
                className="text-xs font-semibold h-8"
              >
                Insert Image
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
