import { ArticleFrontmatter } from '@/types/content';

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
      const question = summaryHtml.replace(/<[^>]+>/g, '').replace(/"/g, '&quot;').trim();
      const answer = bodyHtml.replace(/<[^>]+>/g, '').replace(/"/g, '&quot;').trim();
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

/** Convert MDX content to Editor-friendly HTML for TipTap */
export function mdxToEditorHtml(mdx: string): string {
  if (!mdx) return '';

  let html = mdx;

  // Convert <FAQItem question="..." answer="..." /> to <details><summary>question</summary><p>answer</p></details>
  html = html.replace(
    /<FAQItem\s+question=["']([\s\S]*?)["']\s+answer=["']([\s\S]*?)["']\s*\/>/gi,
    (_, question, answer) => {
      return `<details><summary>${question.trim()}</summary><p>${answer.trim()}</p></details>`;
    }
  );

  return html;
}
