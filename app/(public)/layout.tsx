import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SEOHead } from '@/components/shared/seo-head';
import { buildOrganizationJsonLd, buildWebSiteJsonLd } from '@/lib/seo/metadata';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const orgJsonLd = buildOrganizationJsonLd();
  const websiteJsonLd = buildWebSiteJsonLd();

  return (
    <>
      <SEOHead jsonLd={[orgJsonLd, websiteJsonLd]} />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
