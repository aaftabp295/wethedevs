import { ManifestEntry } from './content';
import { PublishSidebarState } from './editor';

export type InternalLinkSuggestion = {
  id: string;
  type: 'inline' | 'callout';
  anchorText: string;
  contextExcerpt?: string;
  targetSlug: string;
  targetTitle: string;
  targetUrl: string; // Relative path e.g. /alternatives/replit-alternatives
  reason: string;
  description?: string;
  status: 'pending' | 'accepted' | 'rejected';
};

export type ExternalLinkSuggestion = {
  id: string;
  anchorText: string;
  url: string;
  domain: string;
  reason: string;
  nofollow: boolean;
  status: 'pending' | 'accepted' | 'rejected';
};

export type SchemaResultItem = {
  type: string;
  jsonLd: Record<string, unknown>;
  isValid: boolean;
  issues: string[];
  applyAction?: 'faq' | 'meta' | 'content';
  faqItems?: Array<{ question: string; answer: string }>;
};

export type MetaTagSuggestions = {
  metaTitle: { value: string; charCount: number; isOptimal: boolean };
  metaDescription: { value: string; charCount: number; isOptimal: boolean };
  coverAlt: string;
  ogTitle: string;
  suggestedTags: string[];
};

export type AuditItem = {
  id: string;
  category: 'headings' | 'links' | 'images' | 'meta' | 'schema' | 'content' | 'readability';
  severity: 'error' | 'warning' | 'info' | 'pass';
  title: string;
  description: string;
  fix?: string;
};

export type AuditReport = {
  score: number;
  items: AuditItem[];
  summary: string;
};

export type AiSeoAction = 'internal-links' | 'external-links' | 'schema' | 'meta-tags' | 'audit' | 'validate-key';

export type AiSeoRequestBody = {
  action: AiSeoAction;
  articleHtml: string;
  publishState: PublishSidebarState;
  manifest?: ManifestEntry[];
};
