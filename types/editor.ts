import { ContentTypeSlug } from './content';

/** Form state for the publish sidebar */
export type PublishSidebarState = {
  title: string;
  slug: string;
  description: string;
  contentType: ContentTypeSlug;
  topic: string;
  tags: string[];
  cover?: string;
  coverAlt?: string;
  metaTitle?: string;
  metaDescription?: string;
  canonical?: string;
  draft: boolean;
  featured: boolean;
  /** Preserved from original publish — never overwritten by the editor */
  publishedAt?: string;
};

/** Full document state for the editor */
export type EditorState = {
  slug?: string;
  contentHtml: string;
  publishState: PublishSidebarState;
  isDirty: boolean;
  lastSavedAt?: string;
  wordCount: number;
  readingTime: number;
};
