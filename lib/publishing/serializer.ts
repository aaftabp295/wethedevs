import { ArticleFrontmatter } from '@/types/content';
import { marked } from 'marked';

/** Convert HTML table elements to clean GFM Markdown table string */
function convertHtmlTableToMarkdown(htmlTable: string): string {
  const rows = [...htmlTable.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
  if (rows.length === 0) return '';

  const tableData: string[][] = [];

  for (const row of rows) {
    const rowContent = row[1];
    const cells = [...rowContent.matchAll(/<(?:th|td)[^>]*>([\s\S]*?)<\/(?:th|td)>/gi)];
    const rowCells = cells.map((cell) => {
      // Clean inner cell markup
      const text = cell[1]
        .replace(/<p>(.*?)<\/p>/gi, '$1')
        .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
        .replace(/<b>(.*?)<\/b>/gi, '**$1**')
        .replace(/<em>(.*?)<\/em>/gi, '*$1*')
        .replace(/<i>(.*?)<\/i>/gi, '*$1*')
        .replace(/<a href="([^"]+)">(.*?)<\/a>/gi, '[$2]($1)')
        .replace(/<[^>]+>/g, '')
        .replace(/\|/g, '\\|')
        .replace(/\n+/g, ' ')
        .trim();
      return text || ' ';
    });
    if (rowCells.length > 0) {
      tableData.push(rowCells);
    }
  }

  if (tableData.length === 0) return '';

  const header = tableData[0];
  const headerLine = `| ${header.join(' | ')} |`;
  const separatorLine = `| ${header.map(() => '---').join(' | ')} |`;
  const bodyLines = tableData.slice(1).map((row) => `| ${row.join(' | ')} |`);

  return `\n\n${headerLine}\n${separatorLine}\n${bodyLines.join('\n')}\n\n`;
}

/** Convert HTML content to clean Markdown/MDX text */
export function htmlToMarkdown(html: string): string {
  if (!html) return '';

  let output = html;

  // Preserve FAQItem components (even if low-cased by TipTap or HTML entity encoded)
  output = output
    .replace(/&lt;FAQItem([\s\S]*?)&gt;/gi, '<FAQItem$1>')
    .replace(/&lt;\/FAQItem&gt;/gi, '')
    .replace(/<faqitem\s+([^>]*)\/?>/gi, '<FAQItem $1 />')
    .replace(/<faqitem\s+([^>]*)>([\s\S]*?)<\/faqitem>/gi, '<FAQItem $1 />')
    .replace(/<p>\s*(<FAQItem[\s\S]*?\/>)\s*<\/p>/gi, '\n\n$1\n\n');

  // Convert HTML <details><summary> tags from editor directly to <FAQItem />
  output = output.replace(
    /<details[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>\s*([\s\S]*?)<\/details>/gi,
    (_, summaryHtml, bodyHtml) => {
      const question = summaryHtml
        .replace(/<[^>]+>/g, '')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&#x27;/g, "'")
        .replace(/"/g, '&quot;')
        .trim();
      const answer = bodyHtml
        .replace(/<[^>]+>/g, '')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&#x27;/g, "'")
        .replace(/"/g, '&quot;')
        .trim();
      return `\n\n<FAQItem\n  question="${question}"\n  answer="${answer}"\n/>\n\n`;
    }
  );

  // 1. Convert HTML code blocks (<pre><code.../pre>) to GFM fenced code blocks BEFORE general html tag stripping
  output = output.replace(
    /<pre[^>]*>\s*<code(?: class="([^"]+)")?[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi,
    (_, className, codeText) => {
      const langMatch = className ? className.match(/language-([a-z0-9_-]+)/i) : null;
      const lang = langMatch ? langMatch[1] : '';
      const cleanCode = codeText
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '');
      return `\n\n\`\`\`${lang || 'text'}\n${cleanCode.trim()}\n\`\`\`\n\n`;
    }
  );

  // Clean up any stray <code...>...</code></pre> or <pre>...
  output = output
    .replace(/<code(?:\s+[^>]*>|>)([\s\S]*?)<\/code>\s*<\/pre>/gi, (_, codeText) => {
      const cleanCode = codeText.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/<[^>]+>/g, '');
      return `\n\n\`\`\`text\n${cleanCode.trim()}\n\`\`\`\n\n`;
    })
    .replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_, codeText) => {
      const cleanCode = codeText.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/<[^>]+>/g, '');
      return `\n\n\`\`\`text\n${cleanCode.trim()}\n\`\`\`\n\n`;
    });

  // 2. Convert HTML tables to Markdown tables
  output = output.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (match) => {
    return convertHtmlTableToMarkdown(match);
  });

  // Remove leftover colgroup or col tags if any
  output = output
    .replace(/<colgroup>[\s\S]*?<\/colgroup>/gi, '')
    .replace(/<col(?:\s+[^>]*[^\/])?>/gi, '')
    .replace(/<br(?:\s+[^>]*[^\/])?>/gi, '<br />')
    .replace(/<hr(?:\s+[^>]*[^\/])?>/gi, '<hr />');

  // Convert headings FIRST before paragraph expansion
  output = output
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, text) => `# ${text.replace(/<[^>]+>/g, '').trim()}\n\n`)
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, text) => `## ${text.replace(/<[^>]+>/g, '').trim()}\n\n`)
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, text) => `### ${text.replace(/<[^>]+>/g, '').trim()}\n\n`)
    .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (_, text) => `#### ${text.replace(/<[^>]+>/g, '').trim()}\n\n`);

  // Convert lists cleanly with double newline padding
  output = output
    .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, list) => {
      const items = [...list.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)];
      const formattedItems = items.map((m: RegExpMatchArray) => {
        const clean = m[1].replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1').trim();
        return `- ${clean}`;
      });
      return `\n\n${formattedItems.join('\n')}\n\n`;
    })
    .replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, list) => {
      const items = [...list.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)];
      const formattedItems = items.map((m: RegExpMatchArray, i: number) => {
        const clean = m[1].replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1').trim();
        return `${i + 1}. ${clean}`;
      });
      return `\n\n${formattedItems.join('\n')}\n\n`;
    })
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, item: string) => {
      const cleanItem = item.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1').trim();
      return `- ${cleanItem}\n`;
    });

  // Convert paragraphs and inline formatting
  output = output
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n\n')
    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i>(.*?)<\/i>/gi, '*$1*')
    .replace(/<code>(.*?)<\/code>/gi, '`$1`')
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, '> $1\n\n')
    .replace(/<a\s+[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)')
    .replace(/<a\s+[^>]*href='([^']+)'[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)')
    .replace(/<img\s+([^>]+)\/?>/gi, (_, attribs: string) => {
      const srcMatch = attribs.match(/src="([^"]+)"/i) || attribs.match(/src='([^']+)'/i);
      const altMatch = attribs.match(/alt="([^"]*)"/i) || attribs.match(/alt='([^']*)'/i);
      const titleMatch = attribs.match(/title="([^"]*)"/i) || attribs.match(/title='([^']*)'/i);

      const src = srcMatch ? srcMatch[1] : '';
      const alt = altMatch ? altMatch[1] : 'Article image';
      const title = titleMatch ? titleMatch[1] : '';

      if (!src) return '';
      if (title) {
        return `\n\n![${alt}](${src} "${title}")\n\n`;
      }
      return `\n\n![${alt}](${src})\n\n`;
    })
    .replace(/<hr\s*\/?>/gi, '---\n\n')
    .replace(/<\/?(?:ul|ol|li)[^>]*>/gi, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return output;
}

/** Serialize frontmatter metadata + markdown body into MDX file text */
export function serializeMdx(
  frontmatter: ArticleFrontmatter,
  contentHtml: string
): string {
  const yamlFrontmatter = [
    '---',
    `title: "${frontmatter.title.replace(/"/g, '\\"')}"`,
    `description: "${frontmatter.description.replace(/"/g, '\\"')}"`,
    `slug: "${frontmatter.slug}"`,
    `contentType: "${frontmatter.contentType}"`,
    `topic: "${frontmatter.topic}"`,
    `tags: [${frontmatter.tags.map((t) => `"${t}"`).join(', ')}]`,
    `publishedAt: "${frontmatter.publishedAt || new Date().toISOString()}"`,
    frontmatter.updatedAt ? `updatedAt: "${frontmatter.updatedAt}"` : null,
    `draft: ${frontmatter.draft}`,
    `featured: ${frontmatter.featured}`,
    frontmatter.author ? `author: "${frontmatter.author}"` : null,
    frontmatter.cover ? `cover: "${frontmatter.cover}"` : null,
    frontmatter.coverAlt ? `coverAlt: "${frontmatter.coverAlt.replace(/"/g, '\\"')}"` : null,
    '---',
  ]
    .filter(Boolean)
    .join('\n');

  const markdownBody = htmlToMarkdown(contentHtml);

  return `${yamlFrontmatter}\n\n${markdownBody}\n`;
}

/** Extract FAQ items from raw MDX or HTML content into a structured array */
export function extractFaqsFromMdx(rawContent: string): Array<{ id: string; question: string; answer: string }> {
  if (!rawContent) return [];
  const items: Array<{ id: string; question: string; answer: string }> = [];

  // Match <FAQItem question="..." answer="..." />
  const faqBlockMatches = [...rawContent.matchAll(/<FAQItem\b([\s\S]*?)\/>/gi)];
  for (const match of faqBlockMatches) {
    const attrsStr = match[1];
    const qMatch = attrsStr.match(/question=(?:"([^"]*)"|'([^']*)')/i);
    const aMatch = attrsStr.match(/answer=(?:"([^"]*)"|'([^']*)')/i);

    if (qMatch && aMatch) {
      const question = (qMatch[1] ?? qMatch[2] ?? '')
        .replace(/&#39;/g, "'").replace(/&apos;/g, "'").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').trim();
      const answer = (aMatch[1] ?? aMatch[2] ?? '')
        .replace(/&#39;/g, "'").replace(/&apos;/g, "'").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').trim();
      if (question && answer) {
        items.push({ id: Math.random().toString(36).substring(2, 9), question, answer });
      }
    }
  }

  // Fallback match <details><summary>
  if (items.length === 0) {
    const detailsMatches = [...rawContent.matchAll(/<details[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>\s*([\s\S]*?)<\/details>/gi)];
    for (const match of detailsMatches) {
      const question = match[1].replace(/<[^>]+>/g, '').replace(/&#39;/g, "'").replace(/&apos;/g, "'").replace(/&quot;/g, '"').trim();
      const answer = match[2].replace(/<[^>]+>/g, '').replace(/&#39;/g, "'").replace(/&apos;/g, "'").replace(/&quot;/g, '"').trim();
      if (question && answer) {
        items.push({ id: Math.random().toString(36).substring(2, 9), question, answer });
      }
    }
  }

  return items;
}

/** Format structured FAQ items to MDX string */
export function formatFaqsToMdx(faqs: Array<{ question: string; answer: string }>): string {
  if (!faqs || faqs.length === 0) return '';

  const faqLines = faqs.map(
    (faq) =>
      `<FAQItem\n  question="${faq.question.replace(/"/g, '&quot;')}"\n  answer="${faq.answer.replace(/"/g, '&quot;')}"\n/>`
  );

  return `\n\n## Frequently asked questions\n\n${faqLines.join('\n\n')}\n`;
}

/** Convert MDX content to Editor-friendly HTML for TipTap */
export function mdxToEditorHtml(mdx: string): string {
  if (!mdx) return '';

  let text = mdx;

  // 1. Convert <FAQItem question="..." answer="..." /> to <details><summary>question</summary><p>answer</p></details>
  text = text.replace(
    /<FAQItem\s+question=["']([\s\S]*?)["']\s+answer=["']([\s\S]*?)["']\s*\/>/gi,
    (_, question, answer) => {
      const qClean = question
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&#x27;/g, "'")
        .replace(/&quot;/g, '"');
      const aClean = answer
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&#x27;/g, "'")
        .replace(/&quot;/g, '"');
      return `<details><summary>${qClean.trim()}</summary><p>${aClean.trim()}</p></details>`;
    }
  );

  // 2. Decode entity encoded quotes and apostrophes before markdown parsing
  text = text
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"');

  // 3. Parse Markdown into clean HTML using marked so TipTap receives <h2>, <h3>, <strong>, etc.
  let html = '';
  try {
    html = marked.parse(text) as string;
  } catch {
    html = text;
  }

  // 4. Decode HTML entities that marked.parse might have produced for quotes
  html = html
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"');

  return html;
}
