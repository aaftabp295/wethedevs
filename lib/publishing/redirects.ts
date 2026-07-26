import fs from 'fs';
import path from 'path';

export interface RedirectRule {
  source: string;
  destination: string;
  permanent: boolean;
}

const REDIRECTS_FILE = path.join(process.cwd(), 'content', 'redirects.json');

/** Load all SEO redirect rules from content/redirects.json */
export function getRedirects(): RedirectRule[] {
  try {
    if (!fs.existsSync(REDIRECTS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(REDIRECTS_FILE, 'utf-8');
    return JSON.parse(data) as RedirectRule[];
  } catch {
    return [];
  }
}

/** Record a 301 Permanent Redirect when an article URL slug changes */
export function recordSlugRedirect(
  contentType: string,
  oldSlug: string,
  newSlug: string
): void {
  if (!oldSlug || !newSlug || oldSlug === newSlug) return;

  const source = `/${contentType}/${oldSlug}`;
  const destination = `/${contentType}/${newSlug}`;

  const currentRedirects = getRedirects();

  // Remove existing rule if source already exists
  const updatedRedirects = currentRedirects.filter(
    (r) => r.source !== source
  );

  // Append new 301 Permanent Redirect rule
  updatedRedirects.push({
    source,
    destination,
    permanent: true,
  });

  // Ensure content directory exists
  const contentDir = path.dirname(REDIRECTS_FILE);
  if (!fs.existsSync(contentDir)) {
    fs.mkdirSync(contentDir, { recursive: true });
  }

  fs.writeFileSync(
    REDIRECTS_FILE,
    JSON.stringify(updatedRedirects, null, 2),
    'utf-8'
  );
}
