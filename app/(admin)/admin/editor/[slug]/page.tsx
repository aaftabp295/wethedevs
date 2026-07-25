import { notFound } from 'next/navigation';
import { getManifest } from '@/lib/content/manifest';
import { EditorComponent } from '@/components/editor/editor';

interface EditArticlePageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const { slug } = await params;
  const manifest = getManifest();
  const article = manifest.articles.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <EditorComponent
        articleSlug={slug}
        initialPublishState={{
          title: article.title,
          slug: article.slug,
          description: article.description,
          contentType: article.contentType,
          topic: article.topic,
          tags: article.tags,
          cover: article.cover,
          featured: article.featured,
        }}
      />
    </div>
  );
}
