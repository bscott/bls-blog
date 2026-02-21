# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A minimalist blog built with Astro, embracing a retro-web aesthetic with ASCII bracket navigation, classic hyperlinks, and zero JavaScript by default.

## Development Commands

```bash
npm run dev      # Start dev server at http://localhost:4321
npm run build    # Build static site to dist/
npm run preview  # Preview production build locally
```

## Architecture

### Content Management

This blog uses **Astro Content Collections** for type-safe content management:

- **Schema Definition**: `src/content/config.ts` defines the Zod schema for all blog posts
- **Content Location**: Blog posts live in `src/content/blog/` as `.md` or `.mdx` files
- **Type Safety**: Schema validation ensures all posts have required frontmatter (title, description, pubDate, tags, draft)
- **Querying**: Use `getCollection('blog')` to fetch posts with full TypeScript support

### Layout Hierarchy

Two-tier layout system:

1. **BaseLayout** (`src/layouts/BaseLayout.astro`)
   - Root layout for all pages
   - Imports global CSS, includes Header/Footer
   - Handles HTML structure and meta tags

2. **BlogPost** (`src/layouts/BlogPost.astro`)
   - Extends BaseLayout for blog posts
   - Renders post metadata, reading time, tags, TableOfContents
   - Receives post data and headings from page component

### Routing Structure

- `src/pages/index.astro` - Homepage (shows 5 recent posts)
- `src/pages/blog/index.astro` - All posts listing with tag filters
- `src/pages/blog/[slug].astro` - Dynamic blog post pages (uses `getStaticPaths()`)
- `src/pages/blog/tags/[tag].astro` - Tag filter pages (dynamic routes for each tag)
- `src/pages/about.astro` - Static about page
- `src/pages/rss.xml.ts` - RSS feed generator (API route)

### Key Patterns

**Creating Blog Posts**: Add `.md` files to `src/content/blog/` with frontmatter:
```markdown
---
title: "Post Title"
description: "Brief description"
pubDate: 2025-12-17
tags: ["tag1", "tag2"]
draft: false
---
```

**Dynamic Routes**: Pages in `blog/[slug].astro` and `blog/tags/[tag].astro` use `getStaticPaths()` to:
1. Query all posts with `getCollection('blog')`
2. Filter out drafts (`data.draft !== true`)
3. Generate static paths for each post/tag at build time

**Reading Time**: Calculated by `src/utils/readingTime.ts` which strips frontmatter, code blocks, and markdown syntax before counting words (assumes 200 WPM)

**Table of Contents**: `src/components/TableOfContents.astro` receives headings from `post.render()` and displays h2/h3 anchors in ASCII bracket style

## Styling Philosophy

- **Vanilla CSS**: No frameworks, all styles in `src/styles/global.css`
- **CSS Variables**: Colors, fonts, spacing defined in `:root`
- **Cyberpunk RPG Aesthetic**: Cyan/pink/gold accents, dark backgrounds, pixel fonts for headings, FF-style dialog boxes
- **Scoped Styles**: Component-specific styles use Astro's `<style>` blocks

## Code Block Style Guide

Code blocks use **Shiki** syntax highlighting with the `tokyo-night` theme for readable, high-contrast code on the dark background.

### Fenced Code Block Rules

**Always specify a language hint** on every fenced code block. Never use bare ` ``` ` — Shiki will auto-detect and miscolor content.

| Content Type | Language Hint | Example |
|---|---|---|
| Shell commands | `bash` | ` ```bash ` |
| YAML config | `yaml` | ` ```yaml ` |
| JSON | `json` | ` ```json ` |
| JavaScript/TypeScript | `javascript` / `typescript` | ` ```javascript ` |
| Markdown content | `markdown` | ` ```markdown ` |
| ASCII diagrams | `text` | ` ```text ` |
| Directory trees | `text` | ` ```text ` |
| Plain output / logs | `text` | ` ```text ` |

### ASCII Diagrams

- Use `text` language hint so diagrams render as plain white text (no syntax coloring)
- Use a true monospace font for alignment — the CSS uses SF Mono/Monaco/Cascadia Code (`--font-mono`)
- Ensure consistent line widths: all lines in a box diagram must have the same character count
- Test diagram alignment in the browser before committing (VT323 and other display fonts break box-drawing alignment)

### Fonts

- **Code blocks** (`pre`, `pre code`): `--font-mono` (SF Mono, Monaco, Cascadia Code) — true monospace for alignment
- **Inline code** (`code`): `--font-terminal` (VT323) — retro aesthetic for inline snippets
- **Headings**: `--font-pixel` (Press Start 2P) — pixel art style

## Site Configuration

Update site URL in `astro.config.mjs`:
```javascript
site: 'https://yourdomain.com'
```

Update site title in `src/layouts/BaseLayout.astro`:
```typescript
const siteTitle = 'bscott blog';
```

## Content Collections Schema

All blog posts must include:
- `title` (string, required)
- `description` (string, required)
- `pubDate` (date, required)
- `updatedDate` (date, optional)
- `tags` (string[], defaults to [])
- `draft` (boolean, defaults to false)

Schema is validated at build time via Zod in `src/content/config.ts`.
