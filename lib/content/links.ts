export function extractOutgoingLinks(content: string): string[] {
  // Matches markdown links [label](/contentType/slug)
  const linkRegex = /\[[^\]]+\]\(\/([a-z0-9-]+)\/([a-z0-9-]+)\)/g;
  const links = new Set<string>();
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    const slug = match[2];
    links.add(slug);
  }

  return Array.from(links);
}
