import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { siteConfig } from '@/lib/site.config';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-border pb-6">
        <h2 className="text-2xl font-bold tracking-tight">Studio Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure site metadata, publisher author profile, and deployment settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Site Metadata</CardTitle>
          <CardDescription>Global site settings used across SEO and RSS feeds.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Site Name</label>
            <Input defaultValue={siteConfig.name} readOnly />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Site Description</label>
            <Textarea defaultValue={siteConfig.description} readOnly />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Base URL</label>
            <Input defaultValue={siteConfig.url} readOnly />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Publisher Profile</CardTitle>
          <CardDescription>Default author information attached to published articles.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Author Name</label>
            <Input defaultValue={siteConfig.author.name} readOnly />
          </div>
        </CardContent>
        <CardFooter className="border-t border-border pt-4 text-xs text-muted-foreground">
          Settings are stored in <code className="bg-muted px-1 py-0.5 rounded font-mono mx-1">lib/site.config.ts</code>.
        </CardFooter>
      </Card>
    </div>
  );
}
