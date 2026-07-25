import manifestData from '@/content-index.json';
import { ContentManifest } from '@/types/content';

export function getManifest(): ContentManifest {
  return manifestData as ContentManifest;
}
