import { getArticleBySlug, articleToManifestEntry } from '../lib/content/loader';
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildFaqJsonLdFromContent,
  buildItemListJsonLdFromContent,
  buildSoftwareApplicationJsonLdFromContent,
} from '../lib/seo/metadata';

const article = getArticleBySlug('comparisons', 'lovable-vs-bolt');
if (!article) {
  console.error('❌ Article not found!');
  process.exit(1);
}

console.log('✅ Found article:', article.title);

const manifestEntry = articleToManifestEntry(article);
const articleJsonLd = buildArticleJsonLd(manifestEntry, 'https://wethedevs.com/comparisons/lovable-vs-bolt');
const breadcrumbJsonLd = buildBreadcrumbJsonLd([
  { name: 'Home', url: '/' },
  { name: 'Comparisons', url: '/comparisons' },
  { name: article.title, url: '/comparisons/lovable-vs-bolt' },
]);
const faqJsonLd = buildFaqJsonLdFromContent(article.content);
const itemListJsonLd = buildItemListJsonLdFromContent(article.content, 'https://wethedevs.com/comparisons/lovable-vs-bolt');
const softwareAppsJsonLd = buildSoftwareApplicationJsonLdFromContent(article.content, article.title);

console.log('\n--- 1. FAQ SCHEMA ---');
console.log(JSON.stringify(faqJsonLd, null, 2));

console.log('\n--- 2. ITEMLIST SCHEMA ---');
console.log(JSON.stringify(itemListJsonLd, null, 2));

console.log('\n--- 3. SOFTWARE APPLICATION SCHEMAS ---');
console.log(JSON.stringify(softwareAppsJsonLd, null, 2));
