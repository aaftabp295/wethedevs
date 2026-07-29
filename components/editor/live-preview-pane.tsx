'use client';

import * as React from 'react';
import { marked } from 'marked';
import { ArticleHero } from '@/components/content/article-hero';
import { FAQItem } from '@/components/content/faq-item';
import { getContentType } from '@/lib/content/content-types.config';
import { PublishSidebarState } from '@/types/editor';
import { ContentTypeSlug } from '@/types/content';
import { siteConfig } from '@/lib/site.config';

interface LivePreviewPaneProps {
  publishState: PublishSidebarState;
  editorHtml: string;
}

export function LivePreviewPane({ publishState, editorHtml }: LivePreviewPaneProps) {
  const config = getContentType(publishState.contentType);

  // Convert raw markdown / HTML and FAQ sections into interactive FAQItem React elements for preview
  const parsedContent = React.useMemo(() => {
    if (!editorHtml) return null;

    let text = editorHtml
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&#x27;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&#34;/g, '"');

    // 1. If content contains raw markdown headings/text inside <p> or unparsed text, convert markdown to HTML
    if (text.includes('## ') || text.includes('### ') || text.includes('**')) {
      // Strips <p> tags surrounding raw markdown lines if present
      const unescaped = text
        .replace(/<p>\s*(#{1,6}\s+.*?)\s*<\/p>/g, '$1\n')
        .replace(/<p>(.*?)<\/p>/gi, '$1\n\n');
      try {
        text = marked.parse(unescaped) as string;
      } catch {
        // Fallback
      }
    }

    // 2. Extract FAQ blocks: <details><summary>, <FAQItem>, or <h3> under <h2>FAQ
    const faqBlocks: Array<{ question: string; answer: string }> = [];

    // Pattern A: <details><summary>
    text = text.replace(
      /<details[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>\s*([\s\S]*?)<\/details>/gi,
      (_, summary, body) => {
        const question = summary.replace(/<[^>]+>/g, '').trim();
        const answer = body.replace(/<[^>]+>/g, '').trim();
        faqBlocks.push({ question, answer });
        return `__FAQ_BLOCK_${faqBlocks.length - 1}__`;
      }
    );

    // Pattern B: <FAQItem question="..." answer="..." />
    text = text.replace(
      /<FAQItem\s+question=["']([\s\S]*?)["']\s+answer=["']([\s\S]*?)["']\s*\/>/gi,
      (_, question, answer) => {
        faqBlocks.push({ question: question.trim(), answer: answer.trim() });
        return `__FAQ_BLOCK_${faqBlocks.length - 1}__`;
      }
    );

    // Pattern C: <h3>Question</h3><p>Answer</p> inside/after <h2>FAQ</h2> section
    const faqSectionMatch = text.match(/(<h2[^>]*>[\s\S]*?(?:FAQ|Frequently Asked Questions)[\s\S]*?<\/h2>)([\s\S]*)/i);
    if (faqSectionMatch) {
      const beforeFaq = text.substring(0, text.indexOf(faqSectionMatch[1]) + faqSectionMatch[1].length);
      let faqBody = faqSectionMatch[2];

      faqBody = faqBody.replace(
        /<h3[^>]*>([\s\S]*?)<\/h3>\s*<p>([\s\S]*?)<\/p>/gi,
        (_, q, a) => {
          const question = q.replace(/<[^>]+>/g, '').trim();
          const answer = a.replace(/<[^>]+>/g, '').trim();
          faqBlocks.push({ question, answer });
          return `__FAQ_BLOCK_${faqBlocks.length - 1}__`;
        }
      );

      text = beforeFaq + faqBody;
    }

    // Split HTML by FAQ markers
    const parts = text.split(/(__FAQ_BLOCK_\d+__)/g);

    return parts.map((part, index) => {
      const match = part.match(/__FAQ_BLOCK_(\d+)__/);
      if (match) {
        const faqIndex = parseInt(match[1], 10);
        const faq = faqBlocks[faqIndex];
        if (faq) {
          return (
            <div key={`faq-${index}`} className="my-3">
              <FAQItem question={faq.question} answer={faq.answer} />
            </div>
          );
        }
      }

      return (
        <div
          key={`html-${index}`}
          className="prose prose-neutral dark:prose-invert max-w-reading leading-relaxed space-y-4"
          dangerouslySetInnerHTML={{ __html: part }}
        />
      );
    });
  }, [editorHtml]);

  return (
    <div className="rounded-xl border border-border bg-background p-6 sm:p-10 shadow-xs space-y-8 overflow-y-auto max-h-[calc(100vh-8.5rem)]">
      {/* Live Preview Watermark Badge */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <span className="text-[11px] uppercase tracking-widest font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Real-Time Live Preview
        </span>
        <span className="text-xs text-muted-foreground">
          Instant In-Memory Render (0ms latency)
        </span>
      </div>

      {/* Article Hero Header */}
      <ArticleHero
        title={publishState.title || 'Untitled Article'}
        description={publishState.description || 'Add an article description in Publish Settings...'}
        contentType={(publishState.contentType as ContentTypeSlug) || 'alternatives'}
        contentTypeLabel={config?.pluralLabel || 'Alternatives'}
        tags={publishState.tags || []}
        publishedAt={new Date().toISOString()}
        readingTime={Math.max(1, Math.ceil((editorHtml.replace(/<[^>]+>/g, '').split(/\s+/).length || 1) / 200))}
        author={siteConfig.author.name}
        cover={publishState.cover}
        coverAlt={publishState.coverAlt}
      />

      {/* Body Content */}
      <div className="space-y-6 pt-4 border-t border-border">
        {parsedContent || (
          <p className="text-sm text-muted-foreground italic">
            Start typing in the editor to see your live formatted article preview...
          </p>
        )}
      </div>
    </div>
  );
}
