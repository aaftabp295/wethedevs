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
  metaTitle?: string;
  metaDescription?: string;
  canonical?: string;
  draft: boolean;
  featured: boolean;
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
