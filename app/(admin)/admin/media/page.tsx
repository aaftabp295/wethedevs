import fs from 'fs';
import path from 'path';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { contentTypeSlugs } from '@/lib/content/content-types.config';
import { Image as ImageIcon } from 'lucide-react';

type MediaFile = {
  fileName: string;
  articleSlug: string;
  contentType: string;
  relativePath: string;
  sizeKb: string;
};

function getCoLocatedMedia(): MediaFile[] {
  const media: MediaFile[] = [];
  const contentDir = path.join(process.cwd(), 'content');

  if (!fs.existsSync(contentDir)) return media;

  contentTypeSlugs.forEach((type) => {
    const typeDir = path.join(contentDir, type);
    if (!fs.existsSync(typeDir)) return;

    const articleFolders = fs.readdirSync(typeDir);
    articleFolders.forEach((slug) => {
      const folderPath = path.join(typeDir, slug);
      if (!fs.statSync(folderPath).isDirectory()) return;

      const files = fs.readdirSync(folderPath);
      files.forEach((file) => {
        if (/\.(webp|jpg|jpeg|png|svg|gif)$/i.test(file)) {
          const filePath = path.join(folderPath, file);
          const stats = fs.statSync(filePath);
          media.push({
            fileName: file,
            articleSlug: slug,
            contentType: type,
            relativePath: `content/${type}/${slug}/${file}`,
            sizeKb: (stats.size / 1024).toFixed(1),
          });
        }
      });
    });
  });

  return media;
}

export default function AdminMediaPage() {
  const mediaFiles = getCoLocatedMedia();

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-6">
        <h2 className="text-2xl font-bold tracking-tight">Media Library</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Co-located assets stored inside each article&apos;s folder.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Co-Located Media Assets ({mediaFiles.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mediaFiles.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mediaFiles.map((item) => (
                <div
                  key={item.relativePath}
                  className="rounded-lg border border-border p-4 space-y-3 bg-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <ImageIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {item.fileName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.sizeKb} KB
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border text-xs">
                    <Badge variant="outline">{item.contentType}</Badge>
                    <span className="text-muted-foreground">/ {item.articleSlug}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No images uploaded yet. Images uploaded via the Tiptap editor are automatically co-located in the article&apos;s folder.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
