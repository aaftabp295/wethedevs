# PROJECT MISSION

Build a premium editorial publishing platform for a single publisher.

This is **NOT** a blog.
This is **NOT** WordPress.
This is **NOT** a CMS.

It is a Git-backed publishing platform that combines:

- Medium-quality writing experience
- Excellent SEO
- Beautiful editorial design
- Zero-maintenance infrastructure
- Static performance
- Enterprise-grade architecture
- Future extensibility

**Primary goals:**

1. Fast
2. Beautiful
3. SEO-first
4. Maintainable
5. Extensible
6. Minimal dependencies
7. Low infrastructure cost

---

# DESIGN PHILOSOPHY

Everything revolves around content. The interface should disappear while reading.

**Think:**

- Medium
- Apple Documentation
- Stripe Docs
- Vercel Docs

**NOT:**

- WordPress
- Bootstrap templates
- Dashboard-heavy websites

**Principles:**

- Typography first
- Whitespace first
- Calm UI
- Editorial feel
- Minimal animations
- Accessibility by default
- Server-first architecture

---

# TARGET USERS

**Author:**

- Single administrator
- Writes articles
- Never edits markdown
- Never uses Git
- Never commits code

**Reader:**

- Reads
- Searches
- Shares
- Discovers related content

Nothing else.

---

# CORE TECH STACK

**Framework:**

- Next.js App Router
- React
- TypeScript

**Styling:**

- Tailwind CSS v4
- shadcn/ui

**Icons:**

- Lucide

**Animation:**

- Motion

**Editor:**

- Tiptap with custom UI

**Authentication:**

- Auth.js (JWT-only strategy)
- Single admin credential via environment variables (`ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`)
- No database adapter required — hardcoded single-user, JWT session
- Provider: Credentials provider only

**Forms:**

- Zod for validation
- Native form handling with Server Actions
- No form library — the admin surface is small enough (publish sidebar, settings) to handle natively

**State:**

- `useState` / `useReducer` — component-local state
- `React.Context` — theme, auth session, editor instance
- No external state library — the UI state surface (sidebar open, modal visible, editor focus) is minimal for a single-publisher platform
- Server Components handle all data fetching; no client-side cache layer needed

**Theme:**

- next-themes

**Deployment:**

- GitHub → Vercel

**Analytics:**

- Cloudflare Web Analytics
- Google Search Console
- Bing Webmaster Tools

**Search:**

- Pagefind (primary — indexes static HTML at build time)
- Fuse.js (dev-mode fallback and admin-side search)
- Accessible via both `Cmd+K` modal overlay (any page) and dedicated `/search` page

> **Note:** All article pages must use `generateStaticParams` to produce static HTML for Pagefind indexing. Fuse.js serves as the fallback during development and for admin-panel search where Pagefind indices are unavailable.

**Image Processing:**

- Next.js `<Image>` component for all rendered images
- Sharp (built into Next.js) for build-time optimization
- WebP as the default format for all covers and content images
- Maximum dimensions: 1200px width for content images, 1920px for hero/cover images
- All images co-located with their article in the content folder

**MDX Processing:**

- `@next/mdx` with dynamic imports for loading content from the `content/` directory
- Custom MDX components defined in root `mdx-components.tsx`
- Frontmatter handled via MDX exports (no gray-matter needed)
- No `next-mdx-remote` or `contentlayer` — `@next/mdx` is the Next.js-recommended approach

---

# NEVER USE

- Redux, MobX, Recoil
- Prisma, Supabase, Firebase, MongoDB, Postgres
- WordPress, TinyMCE, CKEditor
- TanStack Query, Zustand, React Hook Form
- Heavy UI libraries
- Any database

---

# PROJECT STRUCTURE

```
app/
  (public)/          # Public-facing routes (articles, listings, search)
  (admin)/           # Admin routes (dashboard, editor, settings)
  api/               # API routes (publish, git operations)
components/
  ui/                # shadcn/ui primitives (Button, Input, Card, etc.)
  editor/            # Tiptap editor and related components
  content/           # Article rendering, TOC, breadcrumbs, related
  layout/            # Header, Footer, Navigation, Container
hooks/               # Custom React hooks
lib/
  content/           # MDX loader, manifest generator, frontmatter parser
  seo/               # Metadata, JSON-LD, sitemap, RSS, link validation
  search/            # Pagefind integration, Fuse.js fallback
  git/               # Git operations (commit, push, status)
  auth/              # Auth.js configuration
styles/              # Global CSS, design tokens
types/               # TypeScript type definitions
utils/               # Pure utility functions
scripts/             # Build scripts (manifest generation, search indexing)
content/             # MDX articles and co-located assets
public/              # Static assets (fonts, favicon, robots.txt)
docs/                # Project documentation
```

Keep folders shallow. One level of nesting maximum inside each directory.

---

# THEMING

**Modes:**

- Light
- Dark
- System (default)

Persist user preference. Use semantic tokens. Never hardcode colors.

**Design Tokens:**

| Token       | Purpose                        |
| ----------- | ------------------------------ |
| Background  | Page and section backgrounds   |
| Foreground  | Primary text                   |
| Primary     | Brand color, CTAs              |
| Secondary   | Secondary actions              |
| Muted       | Subdued text, placeholders     |
| Accent      | Highlights, active states      |
| Card        | Card backgrounds               |
| Border      | Borders and dividers           |
| Ring        | Focus rings                    |
| Success     | Positive feedback              |
| Warning     | Caution indicators             |
| Danger      | Errors, destructive actions    |

---

# TYPOGRAPHY

| Role    | Font         | Purpose                    |
| ------- | ------------ | -------------------------- |
| UI      | Inter        | Navigation, buttons, admin |
| Article | Newsreader   | Article body text          |
| Code    | Geist Mono   | Code blocks, inline code   |

**Reading width:** 680–720px

Content always takes priority over decoration.

---

# CONTENT ARCHITECTURE

Everything is content. Content belongs to Content Types.

**Content Types:**

- Alternatives
- Comparisons
- Reviews
- Guides
- News
- Resources

**Content Type Registry** (`lib/content/content-types.config.ts`):

```ts
type ContentTypeConfig = {
  slug: string;           // URL segment (e.g., "alternatives")
  label: string;          // Display name (e.g., "Alternatives")
  pluralLabel: string;    // Listing page title
  icon: string;           // Lucide icon name
  description: string;    // Meta description for listing page
  frontmatterSchema: ZodSchema; // Zod schema for validation
  listingBehavior: {
    sortBy: 'publishedAt' | 'updatedAt' | 'title';
    sortOrder: 'asc' | 'desc';
    perPage: number;
  };
};
```

Future content types are added by extending this config. Never hardcode content type logic.

**Topics** are metadata only:

- AI Coding, Writing, Image Generation, Research, Automation, etc.
- Topics are **NOT** part of URLs
- Used for filtering, breadcrumbs, and related articles

---

# URL STRUCTURE

Keep URLs shallow.

**Good:**

- `/alternatives/cursor`
- `/comparisons/chatgpt-vs-claude`
- `/reviews/cursor`
- `/guides/how-to-use-cursor`

**Bad:**

- `/blog/post`
- `/ai-coding/alternatives/cursor`

Never include topics in URLs.

---

# CONTENT FOLDER

```
content/
  alternatives/
    cursor/
      article.mdx
      cover.webp
      assets/           # Additional images for this article
  comparisons/
    cursor-vs-windsurf/
      article.mdx
      cover.webp
```

Every article owns its assets. No shared image folders.

---

# ARTICLE FRONTMATTER

```yaml
title: string           # Required
description: string     # Required — used for meta description
slug: string            # Required — URL segment
contentType: string     # Required — must match a registered content type
topic: string           # Required — metadata only, not in URL
tags: string[]          # Optional — for filtering and related articles
cover: string           # Optional — relative path to cover image
publishedAt: string     # Required — ISO 8601 date
updatedAt: string       # Optional — ISO 8601 date
draft: boolean          # Default: false
featured: boolean       # Default: false
canonical: string       # Optional — canonical URL if republished
author: string          # Default: site author from config
```

All frontmatter is validated against the content type's Zod schema at build time. Invalid frontmatter fails the build.

---

# CONTENT MANIFEST

Every build generates `content-index.json`.

**Contains:**

- Title, Slug, Content Type, Topic, Tags
- Description, Headings, Links
- Cover path, Reading Time
- Internal link graph (outgoing links per article)

Everything in the application consumes this manifest. Never scan MDX files at runtime.

---

# WEBSITE

**Public pages:**

- `/` — Homepage
- `/alternatives` — Listing
- `/comparisons` — Listing
- `/reviews` — Listing
- `/guides` — Listing
- `/news` — Listing
- `/resources` — Listing
- `/search` — Search
- `/about` — About
- `/privacy` — Privacy Policy
- `/404` — Not Found

---

# ARTICLE PAGE

- Hero (cover image, title)
- Author, Published Date, Updated Date, Reading Time
- Breadcrumbs
- Table of Contents (sticky sidebar on desktop)
- Article body (MDX rendered via design system components)
- Share buttons
- Related Articles (auto-generated)
- Previous / Next navigation
- Newsletter placeholder (future)
- Comments placeholder (future)

---

# BREADCRUMBS

URLs remain shallow. Breadcrumbs derive from metadata, not URL segments.

**Example:**

Home → AI Coding → Alternatives → Cursor

Topic is metadata only — it appears in breadcrumbs but not in the URL.

Automatically generate Breadcrumb JSON-LD for every article page.

---

# SEARCH

**Primary:** Pagefind (indexes static HTML post-build)
**Fallback:** Fuse.js (dev mode, admin panel)

Search consumes `content-index.json` and indexes:

- Title
- Description
- Tags
- Topic
- Content Type
- Headings

---

# RELATED ARTICLES

Generated automatically at build time. Never maintained manually.

**Matching criteria (weighted):**

1. Same Topic (highest weight)
2. Shared Tags
3. Same Content Type

---

# INTERNAL LINKING

**In-editor flow:**

1. Highlight text
2. `Ctrl + K`
3. Search modal opens (searches `content-index.json`)
4. Search by: Title, Slug, Tags, Topic, Content Type
5. Select article → Insert link

Never paste URLs manually.

**Link Inspector (on click):**

- Edit destination
- Edit anchor text
- Remove link
- Open in new tab

**Link Suggestions (editor sidebar):**

- Suggest relevant internal links while writing
- One-click insertion

---

# SEO ENGINE

Centralized module at `lib/seo/`.

**Responsibilities:**

- Metadata generation (title, description, keywords)
- Canonical URLs
- OpenGraph tags
- Twitter Cards
- JSON-LD (Article, Breadcrumb, FAQ schemas)
- `robots.txt`
- RSS feed
- Sitemap (auto-generated)
- Reading Time calculation
- Table of Contents extraction
- Related Articles computation
- Internal Link Graph
- Broken Link Detection (build-time)
- Orphan Page Detection

---

# SEO DASHBOARD (Admin)

**Internal Links view:**

- Incoming links per article
- Outgoing links per article
- Broken links (404s, missing slugs)
- Orphan pages (no incoming links)
- Link suggestions

---

# LINK VALIDATION

**At build time, validate:**

- Broken internal links (target slug doesn't exist)
- Duplicate slugs across content types
- Missing required pages

**Behavior:** Warn in development, fail build in production.

---

# ORPHAN DETECTION

Flag pages with zero incoming internal links. Surfaced in the SEO Dashboard.

---

# ADMIN

**Routes (`/admin/*`):**

- Dashboard — overview stats
- Articles — list, filter, sort
- Drafts — unpublished content
- Media — uploaded images
- Topics — manage topic taxonomy
- Content Types — view registered types
- SEO — link health, orphan pages
- Settings — site config, author profile

---

# EDITOR

Medium-inspired. Not cloned.

**Features:**

- Large title input (auto-focus)
- Slash menu (`/` commands)
- Bubble menu (inline formatting)
- Floating toolbar
- Drag & Drop blocks
- Paste images (auto-upload to article's asset folder)
- Tables
- Code blocks (with syntax highlighting)
- Callouts / Admonitions
- Lists (ordered, unordered, task)
- Block quotes
- Word count (live)
- Reading time (live)
- Autosave (every 30 seconds + on blur)
- Fullscreen mode
- Internal Link Picker (`Ctrl + K`)
- Link Suggestions sidebar
- Publish Sidebar

---

# PUBLISH SIDEBAR

- Title (editable)
- Slug (auto-generated, editable)
- Description
- Content Type (dropdown from registry)
- Topic (dropdown)
- Tags (multi-select / create)
- Cover image (upload / replace)
- Meta Title (override)
- Meta Description (override)
- Canonical URL
- Draft toggle
- **Publish** / **Update** button

---

# PUBLISH FLOW

```
Author clicks Publish
       ↓
Generate MDX from editor content
       ↓
Generate / validate frontmatter
       ↓
Save assets to content/{type}/{slug}/
       ↓
Regenerate content-index.json
       ↓
Validate internal links (warn on broken)
       ↓
Git commit (via API route → simple-git)
       ↓
Git push to GitHub
       ↓
Vercel auto-deploys
       ↓
Website updated
```

---

# GIT OPERATIONS

**Architecture:** Next.js API routes (`app/api/publish/`) using `simple-git` to execute Git commands server-side.

**Operations:**

- `git add` — stage new/modified content files and assets
- `git commit` — with structured message: `publish: {contentType}/{slug}`
- `git push` — push to configured remote branch
- `git status` — check for uncommitted changes (used in admin dashboard)

**Constraints:**

- Git operations run server-side only (API routes)
- The Vercel deployment must have Git credentials configured (deploy key or GitHub App)
- All Git operations are atomic per article — one commit per publish/update action
- Failed Git operations surface clear error messages in the admin UI

> **Note:** During local development, Git operations work against the local repo. In production on Vercel, this requires a writable filesystem or a separate serverless function that clones, commits, and pushes. This architectural decision should be finalized in Phase 7.

---

# ERROR HANDLING & DATA PROTECTION

**Editor (critical path):**

- Autosave every 30 seconds to localStorage as fallback
- Dirty-state detection — warn on navigation (`beforeunload`)
- Explicit "unsaved changes" indicator in the UI
- Recovery: on editor mount, check for newer localStorage draft vs. server version

**Build errors:**

- Invalid frontmatter → fail build with clear error message and file path
- Broken internal links → warn in dev, fail in production
- Missing required fields → fail build
- Duplicate slugs → fail build

**Runtime errors:**

- React Error Boundaries at route level (public and admin)
- Graceful fallback UI for failed article renders
- Toast notifications for failed admin operations (save, publish, delete)

---

# STATE MANAGEMENT

| Scope     | Tool                    | Use Case                                        |
| --------- | ----------------------- | ----------------------------------------------- |
| Component | `useState` / `useReducer` | Form inputs, toggles, local UI                 |
| Shared UI | `React.Context`         | Theme, auth session, editor instance             |
| Server    | Server Components       | All data fetching — articles, listings, config   |
| Mutations | Server Actions          | Publish, save draft, update settings             |

**Rules:**

- No external state management libraries
- Avoid global state — scope state as narrowly as possible
- Server Components handle all read operations
- Server Actions handle all write operations

---

# COMPONENTS

All reusable. Sourced from shadcn/ui, customized to match the design system.

**Primitives:**

- Button, Input, Textarea, Select
- Card, Dialog, Drawer, Sheet
- Tabs, Badge, Toast
- Pagination, Breadcrumb
- Avatar, Tooltip, Dropdown
- Command (search palette)
- Skeleton, Empty State
- Theme Toggle
- Container, Typography (prose wrapper)

---

# PERFORMANCE

- Server Components by default
- Client Components only when interactivity is required (editor, search, theme toggle)
- Static Generation for all article and listing pages (`generateStaticParams`)
- Lazy load heavy features (editor, search modal)
- Optimize images via Next.js `<Image>` + Sharp
- Minimize JavaScript sent to the client

**Target:** Lighthouse 95+ across all categories.

---

# ACCESSIBILITY

- Semantic HTML (`article`, `nav`, `main`, `aside`, `header`, `footer`)
- Full keyboard navigation
- Visible focus states
- ARIA labels and roles where semantic HTML is insufficient
- Color contrast WCAG AA minimum
- Screen reader support
- Proper heading hierarchy (single `h1` per page)

---

# ENGINEERING RULES

- Strict TypeScript — no `any`, no `@ts-ignore`
- Small, focused components
- Composition over inheritance
- Meaningful, descriptive names
- No premature optimization
- Minimal dependencies — justify every `npm install`
- Colocate related code (component + styles + types)

---

# FUTURE READY

The architecture must support adding the following **without rewrites:**

- Scheduled publishing
- AI writing assistant
- Affiliate / CTA blocks
- Newsletter integration
- Premium / gated articles
- Public API
- Cloud storage for media (S3 / R2)
- Multi-author support
- Analytics dashboard

These are NOT implemented now. The architecture simply must not block them.

---

# IMPLEMENTATION PRINCIPLES

- Never implement future phases
- Finish one phase → Review → Approve → Proceed
- Every phase ends with:
  - Architecture summary
  - Files created / modified
  - Tradeoffs documented
  - Next steps outlined
- **Wait for explicit approval before proceeding**

---

# PHASE 0 — Architecture Blueprint

**Deliver:**

- Folder tree (final)
- Route definitions
- TypeScript types and interfaces
- Zod schemas (frontmatter, content type config)
- Dependency graph
- State boundaries
- Data flow diagram
- Design tokens (CSS custom properties)
- Component inventory
- Content model

**No implementation. STOP.**

---

# PHASE 1 — Foundation

- Next.js project setup
- TypeScript configuration (strict)
- Tailwind CSS v4 configuration
- shadcn/ui initialization
- Theme system (light/dark/system)
- Navigation (header)
- Footer
- SEO foundation (metadata, robots, sitemap scaffold)
- Linting and formatting (ESLint, Prettier)
- Project structure scaffolded

**STOP.**

---

# PHASE 2 — Design System

- All reusable UI components (from component inventory)
- No business logic in this phase
- Storybook or dedicated preview page for visual verification

**STOP.**

---

# PHASE 3 — Public Website

- Page layouts (public shell, article layout)
- Homepage
- Listing pages (per content type)
- Dynamic article pages (`/[contentType]/[slug]`)
- Search UI (Pagefind integration)
- Breadcrumbs
- Table of Contents
- RSS feed
- Sitemap (auto-generated)
- Full metadata (OpenGraph, Twitter, JSON-LD)
- Responsive design (mobile-first)

**STOP.**

---

# PHASE 4 — Content Engine

- MDX loader (`next-mdx-remote/rsc`)
- Frontmatter parser + Zod validation
- Content Manifest Generator (`content-index.json`)
- Reading Time calculation
- Syntax highlighting (code blocks)
- Related Articles engine
- Search indexing (Pagefind build step)
- Internal Link Graph builder
- Broken Link Detection (build-time)
- Orphan Page Detection

**STOP.**

---

# PHASE 5 — Authentication & Admin

- Auth.js setup (JWT + Credentials provider)
- Admin layout and navigation
- Dashboard (overview)
- Articles management
- Drafts management
- Media library
- Topics management
- Content Types view
- SEO dashboard (links, orphans)
- Settings page

**STOP.**

---

# PHASE 6 — Editor

- Tiptap editor (full setup)
- Slash menu, Floating menu, Bubble menu
- Image upload (paste + drag, co-located with article)
- Autosave (30s interval + blur + localStorage fallback)
- Dirty-state detection and navigation warning
- Word count and reading time (live)
- Internal Link Picker (`Ctrl + K`)
- Link Suggestions sidebar
- Publish sidebar (all frontmatter fields)

**STOP.**

---

# PHASE 7 — Publishing Pipeline

- MDX generation from editor state
- Frontmatter generation from publish sidebar
- Content manifest regeneration
- Link validation (pre-publish)
- Git operations (commit, push via `simple-git`)
- Deploy trigger (Vercel auto-deploy on push)
- Success/failure notifications in admin UI
- Finalize production Git strategy (local repo vs. clone-commit-push)

**STOP.**

---

# PHASE 8 — Polish & Launch

- Accessibility audit and fixes
- Performance audit (Lighthouse 95+ target)
- Error Boundaries at all route levels
- Loading states and skeletons for all async UI
- SEO audit (validate all structured data, meta tags)
- Responsive audit (test all breakpoints)
- Documentation (README, contribution guide, architecture summary)

**Project complete.**

---

# AI IMPLEMENTATION RULES

You are acting as a Staff Software Engineer.

**Optimize for (in order):**

1. Maintainability
2. Simplicity
3. Performance
4. Accessibility
5. SEO
6. Developer Experience

**Rules:**

- Always explain architectural decisions
- Never introduce dependencies without justification
- Prefer Server Components
- Prefer composition
- Build reusable systems
- Keep codebase clean
- Think in systems, not pages
- Never break existing architecture
- Treat this document as the **canonical source of truth** throughout development