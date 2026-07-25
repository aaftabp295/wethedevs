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

  // Convert HTML tables to Markdown tables
  output = output.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (match) => {
    return convertHtmlTableToMarkdown(match);
  });

  // Remove leftover colgroup or col tags if any
  output = output
    .replace(/<colgroup>[\s\S]*?<\/colgroup>/gi, '')
    .replace(/<col(?:\s+[^>]*[^\/])?>/gi, '')
    .replace(/<br(?:\s+[^>]*[^\/])?>/gi, '<br />')
    .replace(/<hr(?:\s+[^>]*[^\/])?>/gi, '<hr />');

  // Convert headings FIRST before paragraph expansion (matching any attributes like class or style)
  output = output
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, text) => `# ${text.replace(/<[^>]+>/g, '').trim()}\n\n`)
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, text) => `## ${text.replace(/<[^>]+>/g, '').trim()}\n\n`)
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, text) => `### ${text.replace(/<[^>]+>/g, '').trim()}\n\n`)
    .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (_, text) => `#### ${text.replace(/<[^>]+>/g, '').trim()}\n\n`);

  // Convert lists
  output = output
    .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, list) => {
      return (
        list.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (__: string, item: string) => {
          const cleanItem = item.replace(/<p>(.*?)<\/p>/gi, '$1').trim();
          return `- ${cleanItem}\n`;
        }) + '\n'
      );
    })
    .replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, list) => {
      return (
        list.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (__: string, item: string) => {
          const cleanItem = item.replace(/<p>(.*?)<\/p>/gi, '$1').trim();
          return `1. ${cleanItem}\n`;
        }) + '\n'
      );
    })
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, item: string) => {
      const cleanItem = item.replace(/<p>(.*?)<\/p>/gi, '$1').trim();
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
    .replace(/<a href="([^"]+)">(.*?)<\/a>/gi, '[$2]($1)')
    .replace(/<img src="([^"]+)" alt="([^"]*)"\s*\/?>/gi, '![$2]($1)\n\n')
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
    '---',
  ]
    .filter(Boolean)
    .join('\n');

  const markdownBody = htmlToMarkdown(contentHtml);

  return `${yamlFrontmatter}\n\n${markdownBody}\n`;
}
