import { notFound } from 'next/navigation';
import { getManifest } from '@/lib/content/manifest';
import { getArticleBySlug } from '@/lib/content/loader';
import { EditorComponent } from '@/components/editor/editor';
import { mdxToEditorHtml } from '@/lib/publishing/serializer';

interface EditArticlePageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const { slug } = await params;
  const manifest = getManifest();
  const articleMeta = manifest.articles.find((a) => a.slug === slug);

  if (!articleMeta) {
    notFound();
  }

  const fullArticle = getArticleBySlug(articleMeta.contentType, slug);
  const initialContent = mdxToEditorHtml(fullArticle?.content || '');

  return (
    <div className="space-y-6">
      <EditorComponent
        articleSlug={slug}
        initialContent={initialContent}
        initialRawMdx={fullArticle?.content || ''}
        initialPublishState={{
          title: articleMeta.title,
          slug: articleMeta.slug,
          description: articleMeta.description,
          contentType: articleMeta.contentType,
          topic: articleMeta.topic,
          tags: articleMeta.tags,
          cover: articleMeta.cover,
          coverAlt: articleMeta.coverAlt,
          featured: articleMeta.featured,
          publishedAt: articleMeta.publishedAt,
        }}
      />
    </div>
  );
}
