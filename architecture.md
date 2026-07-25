# PROJECT MISSION

Build a premium editorial publishing platform for a single publisher.

This is NOT a blog.

This is NOT WordPress.

This is NOT a CMS.

It is a Git-backed publishing platform that combines:

- Medium-quality writing experience
- Excellent SEO
- Beautiful editorial design
- Zero-maintenance infrastructure
- Static performance
- Enterprise-grade architecture
- Future extensibility

Primary goals:

- Fast
- Beautiful
- SEO-first
- Maintainable
- Extensible
- Minimal dependencies
- Low infrastructure cost

---

# DESIGN PHILOSOPHY

Everything revolves around content.

The interface should disappear while reading.

Think:

Medium
Apple Documentation
Stripe Docs
Vercel Docs

NOT

WordPress
Bootstrap templates
Dashboard-heavy websites

Principles:

- Typography first
- Whitespace first
- Calm UI
- Editorial feel
- Minimal animations
- Accessibility by default
- Server-first architecture

---

# TARGET USERS

Author

- Single administrator
- Writes articles
- Never edits markdown
- Never uses Git
- Never commits code

Reader

- Reads
- Searches
- Shares
- Discovers related content

Nothing else.

---

# CORE TECH STACK

Framework

- Next.js App Router
- React
- TypeScript

Styling

- Tailwind CSS v4
- shadcn/ui

Icons

- Lucide

Animation

- Motion

Editor

- Tiptap
- Custom UI

Authentication

- Auth.js

Forms

- React Hook Form
- Zod

State

Local:
React

UI:
Zustand

Server:
TanStack Query

Context:
Theme
Auth
Editor

Theme

- next-themes

Deployment

GitHub

↓

Vercel

Analytics

Cloudflare Web Analytics

Search Console

Bing Webmaster

Search

Pagefind

Fallback

Fuse.js

---

# NEVER USE

Redux

MobX

Recoil

Prisma

Supabase

Firebase

MongoDB

Postgres

WordPress

TinyMCE

CKEditor

Heavy UI libraries

---

# PROJECT STRUCTURE

app/

components/

editor/

content/

hooks/

lib/

seo/

search/

styles/

types/

utils/

scripts/

public/

docs/

Keep folders shallow.

---

# THEMING

Support

Light

Dark

System

Persist preference.

Use semantic tokens.

Never hardcode colors.

Tokens

Background

Foreground

Primary

Secondary

Muted

Accent

Card

Border

Ring

Success

Warning

Danger

---

# TYPOGRAPHY

UI

Inter

Article

Newsreader

Code

Geist Mono

Reading width

680-720px

Content always takes priority over decoration.

---

# CONTENT ARCHITECTURE

Everything is content.

Content belongs to Content Types.

Content Types

Alternatives

Comparisons

Reviews

Guides

News

Resources

Future content types must be configurable.

Never hardcode.

Topics are metadata.

Examples

AI Coding

Writing

Image Generation

Research

Automation

Topics are NOT part of URLs.

---

# URL STRUCTURE

Keep URLs shallow.

Good

/alternatives/cursor

/comparisons/chatgpt-vs-claude

/reviews/cursor

/guides/how-to-use-cursor

Bad

/blog/post

/ai-coding/alternatives/cursor

Never include topics in URLs.

---

# CONTENT FOLDER

content/

alternatives/

cursor/

article.mdx

cover.webp

comparison/

cursor-vs-windsurf/

article.mdx

Every article owns its assets.

---

# ARTICLE FRONTMATTER

title

description

slug

contentType

topic

tags

cover

publishedAt

updatedAt

draft

featured

canonical

author

---

# CONTENT MANIFEST

Every build generates

content-index.json

Contains

Title

Slug

Content Type

Topic

Tags

Description

Headings

Links

Cover

Reading Time

Everything in the application consumes this manifest.

Never scan MDX repeatedly.

---

# WEBSITE

Public pages

/

Alternatives

Comparisons

Reviews

Guides

News

Resources

Search

About

Privacy

404

---

# ARTICLE PAGE

Hero

Author

Published Date

Updated Date

Reading Time

Breadcrumbs

TOC

Article

Share

Related Articles

Previous

Next

Newsletter Placeholder

Comments placeholder

---

# BREADCRUMBS

URLs remain shallow.

Breadcrumbs derive from metadata.

Example

Home

↓

AI Coding

↓

Alternatives

↓

Cursor

Topic is metadata only.

Automatically generate Breadcrumb JSON-LD.

---

# SEARCH

Use Pagefind.

Search consumes

content-index.json

Search by

Title

Description

Tags

Topic

Content Type

Headings

---

# RELATED ARTICLES

Generated automatically.

Based on

Topic

Tags

Content Type

Never maintain manually.

---

# INTERNAL LINKING

Inside editor.

Highlight text.

Ctrl + K.

Search opens.

Search fields

Title

Slug

Tags

Topic

Content Type

Select article.

Insert link.

Never paste URLs manually.

---

# LINK INSPECTOR

Edit

Destination

Anchor

Remove

Open in new tab

---

# LINK SUGGESTIONS

Editor sidebar.

Suggest relevant internal links while writing.

One-click insertion.

---

# SEO ENGINE

Centralized module.

Responsible for

Metadata

Canonical

OpenGraph

Twitter Cards

JSON-LD

Article Schema

Breadcrumb Schema

FAQ Schema

Robots

RSS

Sitemap

Reading Time

TOC

Related Articles

Internal Links

Broken Links

Orphan Pages

Search Index

---

# SEO DASHBOARD

Admin

SEO

Internal Links

Shows

Incoming Links

Outgoing Links

Broken Links

Orphan Pages

Suggestions

---

# LINK VALIDATION

During build

Validate

Broken links

Duplicate slugs

Missing pages

Warn or fail build.

---

# ORPHAN DETECTION

Show pages with

No incoming links.

---

# ADMIN

Dashboard

Articles

Drafts

Media

Topics

Content Types

SEO

Settings

---

# EDITOR

Medium inspired.

Not cloned.

Features

Large title

Slash menu

Bubble menu

Floating toolbar

Drag & Drop

Paste Images

Tables

Code Blocks

Callouts

Lists

Quotes

Word Count

Reading Time

Autosave

Fullscreen

Link Picker

Link Suggestions

Publish Sidebar

---

# PUBLISH SIDEBAR

Title

Slug

Description

Content Type

Topic

Tags

Cover

Meta Title

Meta Description

Canonical

Draft

Publish

---

# PUBLISH FLOW

Publish

↓

Generate MDX

↓

Generate Frontmatter

↓

Save Assets

↓

Generate Content Manifest

↓

Validate Links

↓

Git Commit

↓

Git Push

↓

Vercel Deploy

↓

Website Updated

---

# STATE MANAGEMENT

React

Component state

Zustand

UI state

TanStack Query

Server state

Context

Theme

Auth

Editor

Avoid global state.

---

# COMPONENTS

Reusable only.

Button

Input

Textarea

Card

Dialog

Drawer

Tabs

Badge

Toast

Pagination

Breadcrumb

Avatar

Tooltip

Dropdown

Command

Search

Empty State

Skeleton

Theme Toggle

Container

Typography

---

# PERFORMANCE

Server Components first.

Client Components only when necessary.

Static Generation wherever possible.

Lazy load heavy features.

Target

Lighthouse 95+

---

# ACCESSIBILITY

Semantic HTML

Keyboard Navigation

Focus States

ARIA

Color Contrast

Screen Reader Support

Heading hierarchy

---

# ENGINEERING RULES

Strict TypeScript

No any

Small components

Composition over inheritance

Meaningful names

No premature optimization

Minimal dependencies

---

# FUTURE READY

Architecture must support

Scheduling

AI Assistant

Affiliate blocks

Newsletter

Premium articles

API

Cloud storage

Multi-author

Analytics dashboard

Without rewrites.

---

# IMPLEMENTATION PRINCIPLES

Never implement future phases.

Finish one phase.

Review.

Approve.

Proceed.

Every phase ends with

Architecture summary

Files created

Tradeoffs

Next steps

Wait for approval.

---

# PHASE 0

Architecture Blueprint

Deliver

Folder tree

Routes

Types

Schemas

Dependency graph

State boundaries

Data flow

Design tokens

Component inventory

Content model

No implementation.

STOP.

---

# PHASE 1

Foundation

Next.js

TypeScript

Tailwind

shadcn

Theme

Navigation

Footer

SEO foundation

Tooling

STOP.

---

# PHASE 2

Design System

All reusable UI.

No business logic.

STOP.

---

# PHASE 3

Public Website

Layouts

Homepage

Listing pages

Dynamic article pages

Search UI

Breadcrumbs

TOC

RSS

Sitemap

Metadata

Responsive design

STOP.

---

# PHASE 4

Content Engine

MDX loader

Frontmatter parser

Content Manifest Generator

Reading Time

Syntax Highlighting

Related Articles

Search indexing

Internal Link Graph

Broken Link Detection

Orphan Detection

STOP.

---

# PHASE 5

Authentication & Admin

Auth.js

Dashboard

Articles

Drafts

Media

Topics

Content Types

SEO

Settings

STOP.

---

# PHASE 6

Editor

Complete Tiptap

Slash menu

Floating menu

Bubble menu

Image upload

Autosave

Word count

Reading time

Internal Link Picker

Link Suggestions

Publish sidebar

STOP.

---

# PHASE 7

Publishing

Generate MDX

Generate Manifest

Validate Links

Git Commit

Git Push

Deploy

Notifications

STOP.

---

# PHASE 8

Polish

Accessibility

Performance

Error Boundaries

Loading States

SEO Audit

Responsive Audit

Documentation

Project Complete.

---

# AI IMPLEMENTATION RULES

You are acting as a Staff Software Engineer.

Optimize for:

1. Maintainability
2. Simplicity
3. Performance
4. Accessibility
5. SEO
6. Developer Experience

Always explain architectural decisions.

Never introduce dependencies without justification.

Prefer Server Components.

Prefer composition.

Build reusable systems.

Keep codebase clean.

Think in systems, not pages.

Never break existing architecture.

Treat this document as the canonical source of truth throughout development.