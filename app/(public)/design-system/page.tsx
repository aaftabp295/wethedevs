import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export default function DesignSystemPage() {
  return (
    <div className="container mx-auto max-w-5xl py-12 space-y-12 px-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Design System</h1>
        <p className="text-muted-foreground mt-1">
          Component inventory and visual test page.
        </p>
      </div>

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2">Buttons</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </div>
      </section>

      <Separator />

      {/* Inputs & Form Controls */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2">Form Inputs</h2>
        <div className="grid gap-4 max-w-md">
          <Input placeholder="Enter title..." />
          <Input placeholder="Disabled input" disabled />
          <Textarea placeholder="Write article description..." />
        </div>
      </section>

      <Separator />

      {/* Badges */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2">Badges</h2>
        <div className="flex flex-wrap gap-3">
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      </section>

      <Separator />

      {/* Cards */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2">Cards</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Cursor Alternatives</CardTitle>
              <CardDescription>
                A curated list of top AI code editors.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Detailed benchmarks and feature breakdown comparing Windsurf, GitHub Copilot, and Zed.
              </p>
            </CardContent>
            <CardFooter>
              <Button size="sm">Read Article</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>ChatGPT vs Claude</CardTitle>
              <CardDescription>Comprehensive model comparison.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Analyzing reasoning quality, coding capabilities, and context limits.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm">
                View Comparison
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Avatars & Breadcrumbs */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2">Avatars & Breadcrumbs</h2>
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="Author" />
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
        </div>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/alternatives">Alternatives</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Cursor</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </section>

      <Separator />

      {/* Tabs */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2">Tabs</h2>
        <Tabs defaultValue="all" className="w-full max-w-md">
          <TabsList className="grid w-full grid-cols-3">
            <TabsList />
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="p-4 border rounded-md mt-2">
            Showing all articles.
          </TabsContent>
          <TabsContent value="published" className="p-4 border rounded-md mt-2">
            Showing published articles only.
          </TabsContent>
          <TabsContent value="drafts" className="p-4 border rounded-md mt-2">
            Showing draft articles.
          </TabsContent>
        </Tabs>
      </section>

      <Separator />

      {/* Skeletons */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2">Skeleton Loading</h2>
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </section>
    </div>
  );
}
