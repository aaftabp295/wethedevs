import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ContentTypeSlug } from '@/types/content';

interface ArticleBreadcrumbsProps {
  contentType: ContentTypeSlug;
  contentTypeLabel: string;
  title: string;
}

export function ArticleBreadcrumbs({
  contentType,
  contentTypeLabel,
  title,
}: ArticleBreadcrumbsProps) {
  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList className="flex-wrap text-xs sm:text-sm leading-relaxed">
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href={`/${contentType}`}>
            {contentTypeLabel}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem className="shrink min-w-0">
          <BreadcrumbPage className="font-medium text-foreground leading-normal">
            {title}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
