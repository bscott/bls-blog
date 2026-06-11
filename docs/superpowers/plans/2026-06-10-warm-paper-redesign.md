# Warm Paper Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the cyberpunk JRPG theme with a calm, readable "Warm Paper" theme (cream background, warm serif, rust-orange links) across the entire Astro blog, touching only the presentation layer.

**Architecture:** Astro static site with content collections. The theme lives in `src/styles/global.css` (CSS variables + element styles) plus scoped `<style>` blocks in each component/page. We rewrite the global stylesheet first to establish the new variable system, then rewrite each component and page to use it, then delete the dead game-themed code. Content (`src/content/blog/*.md`), routing, RSS, and the content schema are untouched.

**Tech Stack:** Astro 5, vanilla CSS, Shiki (code highlighting), Pagefind (search). No test framework exists in this repo — verification is `npm run build` (must exit 0) plus visual checks in `npm run dev`.

**Spec:** `docs/superpowers/specs/2026-06-10-warm-paper-redesign-design.md`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/styles/global.css` | Rewrite | Theme variables, element defaults, prose styles |
| `astro.config.mjs` | Modify | Shiki theme → `gruvbox-dark-medium` |
| `src/layouts/BaseLayout.astro` | Rewrite | HTML shell; remove progress bar, font imports |
| `src/components/Header.astro` | Rewrite | Wordmark + sans nav |
| `src/components/Footer.astro` | Rewrite | Plain centered links + copyright |
| `src/pages/index.astro` | Rewrite | Intro + 5 recent posts |
| `src/components/TableOfContents.astro` | Rewrite | Inline Contents box |
| `src/components/RelatedPosts.astro` | Rewrite | "Further reading" list |
| `src/layouts/BlogPost.astro` | Rewrite | Post page layout |
| `src/pages/blog/[...page].astro` | Rewrite | All-posts index + pagination |
| `src/pages/blog/tags/[tag].astro` | Rewrite | Tag pages |
| `src/pages/about.astro` | Rewrite | Plain-prose about page |
| `src/pages/search.astro` | Rewrite | Reskinned Pagefind search |
| `src/pages/404.astro` | Rewrite | Simple not-found page |
| `src/components/SoundToggle.astro` | Delete | — |
| `src/components/KonamiCode.astro` | Patch | Font fallbacks only (easter egg survives) |
| `CLAUDE.md` | Modify | Styling Philosophy + fonts docs |

Shared CSS classes defined in `global.css` and used by multiple pages: `.post-item`, `.post-meta`, `.post-desc`, `.section-label`, `.panel`. Page-specific styles stay in scoped `<style>` blocks.

---

### Task 1: Theme foundation — `global.css`, Shiki theme, `BaseLayout`

**Files:**
- Modify: `src/styles/global.css` (full rewrite)
- Modify: `astro.config.mjs:14-19`
- Modify: `src/layouts/BaseLayout.astro` (full rewrite)

- [ ] **Step 1: Rewrite `src/styles/global.css`** with exactly this content:

```css
/* ═══════════════════════════════════════════════════════════════
   WARM PAPER THEME
   Cream background, warm serif body, rust-orange links.
   Readability first, personality second.
═══════════════════════════════════════════════════════════════ */

:root {
  /* Palette */
  --paper: #faf6ef;
  --ink: #2b2620;
  --ink-soft: #55493c;
  --ink-muted: #8a7f70;
  --accent: #b3551d;
  --accent-dark: #8a3f12;
  --rule: #e2d9c8;
  --panel: #f3ecdf;
  --code-bg: #2a2520;
  --code-ink: #d8d0c0;

  /* Typography */
  --font-serif: "Iowan Old Style", Palatino, "Palatino Linotype", Georgia, serif;
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-mono: "SF Mono", Menlo, Monaco, "Cascadia Code", Consolas, monospace;

  /* Spacing */
  --space-xs: 0.5rem;
  --space-sm: 1rem;
  --space-md: 1.5rem;
  --space-lg: 2rem;
  --space-xl: 3rem;

  /* Legacy variable mappings (KonamiCode and any stragglers) */
  --color-bg: var(--paper);
  --color-text: var(--ink);
  --color-text-muted: var(--ink-muted);
  --color-link: var(--accent);
  --color-border: var(--rule);
  --color-code-bg: var(--panel);
}

/* ── Reset ─────────────────────────────────────────────────── */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ── Base ──────────────────────────────────────────────────── */
html {
  font-size: 18px;
  background: var(--paper);
}

body {
  font-family: var(--font-serif);
  color: var(--ink);
  background: var(--paper);
  line-height: 1.65;
  max-width: 42rem;
  min-height: 100vh;
  margin: 0 auto;
  padding: var(--space-md) var(--space-sm) var(--space-xl);
}

main {
  margin-top: var(--space-lg);
  margin-bottom: var(--space-xl);
}

/* ── Typography ────────────────────────────────────────────── */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-serif);
  font-weight: 700;
  line-height: 1.3;
  color: var(--ink);
  margin-top: var(--space-lg);
  margin-bottom: var(--space-sm);
}

h1 { font-size: 1.7rem; }
h2 { font-size: 1.35rem; }
h3 { font-size: 1.1rem; }
h4, h5, h6 { font-size: 1rem; }

p {
  margin-bottom: var(--space-md);
}

/* Small sans-serif metadata text (dates, labels, nav) */
.meta,
.post-meta {
  font-family: var(--font-sans);
  font-size: 0.78rem;
  color: var(--ink-muted);
}

/* Small uppercase sans section label */
.section-label {
  font-family: var(--font-sans);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-muted);
  margin-bottom: var(--space-sm);
}

/* ── Links ─────────────────────────────────────────────────── */
a {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 1px;
}

a:visited {
  color: var(--accent);
}

a:hover {
  color: var(--accent-dark);
}

a:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* ── Lists ─────────────────────────────────────────────────── */
ul, ol {
  margin-bottom: var(--space-md);
  padding-left: var(--space-lg);
}

li {
  margin-bottom: 0.4rem;
}

li::marker {
  color: var(--ink-muted);
}

/* ── Code ──────────────────────────────────────────────────── */
code {
  font-family: var(--font-mono);
  font-size: 0.82em;
  background-color: var(--panel);
  border: 1px solid var(--rule);
  border-radius: 3px;
  padding: 0.1em 0.35em;
}

pre {
  font-family: var(--font-mono);
  background-color: var(--code-bg);
  color: var(--code-ink);
  padding: var(--space-sm) var(--space-md);
  border-radius: 6px;
  overflow-x: auto;
  margin-bottom: var(--space-md);
  line-height: 1.6;
}

pre code {
  background-color: transparent;
  border: none;
  border-radius: 0;
  padding: 0;
  font-size: 0.78rem;
}

/* Shiki blocks: force the warm background */
pre.astro-code {
  background-color: var(--code-bg) !important;
}

/* Plain text / ASCII diagram blocks render as plain light text */
pre.astro-code[data-language="text"] code,
pre.astro-code[data-language="text"] span,
pre.astro-code[data-language="plaintext"] code,
pre.astro-code[data-language="plaintext"] span {
  color: var(--code-ink) !important;
}

/* ── Blockquotes ───────────────────────────────────────────── */
blockquote {
  background: var(--panel);
  border-left: 3px solid var(--accent);
  padding: var(--space-sm) var(--space-md);
  margin: var(--space-md) 0;
  color: var(--ink-soft);
  font-style: italic;
}

blockquote p:last-child {
  margin-bottom: 0;
}

/* ── Horizontal rules ──────────────────────────────────────── */
hr {
  border: none;
  border-top: 1px solid var(--rule);
  margin: var(--space-xl) 0;
}

/* ── Tables ────────────────────────────────────────────────── */
table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: var(--space-md);
  font-size: 0.9rem;
}

th, td {
  border: 1px solid var(--rule);
  padding: 0.5rem 0.75rem;
  text-align: left;
}

th {
  font-family: var(--font-sans);
  font-size: 0.78rem;
  font-weight: 600;
  background: var(--panel);
  color: var(--ink-soft);
}

/* ── Images ────────────────────────────────────────────────── */
img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: var(--space-md) auto;
  border-radius: 4px;
}

/* ── Panel (contents box, asides) ──────────────────────────── */
.panel {
  background: var(--panel);
  border: 1px solid var(--rule);
  border-radius: 4px;
  padding: var(--space-sm) var(--space-md);
}

/* ── Post list item (homepage, blog index, tag pages) ──────── */
.post-item {
  margin-bottom: var(--space-lg);
}

.post-item h2 {
  font-size: 1.15rem;
  margin: 0 0 0.2rem 0;
}

.post-item .post-meta {
  margin-bottom: 0.3rem;
}

.post-desc {
  color: var(--ink-soft);
  font-size: 0.95rem;
  margin-bottom: 0;
}

/* ── Selection ─────────────────────────────────────────────── */
::selection {
  background: var(--accent);
  color: var(--paper);
}

/* ── Responsive ────────────────────────────────────────────── */
@media (max-width: 480px) {
  html {
    font-size: 17px;
  }

  h1 { font-size: 1.45rem; }
  h2 { font-size: 1.2rem; }

  pre {
    padding: var(--space-xs) var(--space-sm);
    border-radius: 4px;
  }
}
```

- [ ] **Step 2: Update the Shiki theme in `astro.config.mjs`**

Change:

```javascript
  markdown: {
    shikiConfig: {
      theme: 'tokyo-night',
      wrap: true,
    },
  },
```

to:

```javascript
  markdown: {
    shikiConfig: {
      theme: 'gruvbox-dark-medium',
      wrap: true,
    },
  },
```

- [ ] **Step 3: Rewrite `src/layouts/BaseLayout.astro`** with exactly this content (removes Google Fonts, progress bar, and scroll script; keeps KonamiCode; site title becomes "Brian Scott"):

```astro
---
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import KonamiCode from '../components/KonamiCode.astro';
import '../styles/global.css';

interface Props {
  title: string;
  description: string;
  ogType?: 'website' | 'article';
}

const { title, description, ogType = 'website' } = Astro.props;
const siteTitle = 'Brian Scott';
const fullTitle = title === siteTitle ? siteTitle : `${title} | ${siteTitle}`;
const canonicalURL = new URL(Astro.url.pathname, Astro.site);
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />
    <meta name="generator" content={Astro.generator} />
    <link rel="canonical" href={canonicalURL} />

    <!-- Open Graph / Social Media -->
    <meta property="og:type" content={ogType} />
    <meta property="og:title" content={fullTitle} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonicalURL} />
    <meta property="og:site_name" content={siteTitle} />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content={fullTitle} />
    <meta name="twitter:description" content={description} />

    <title>{fullTitle}</title>
  </head>
  <body>
    <Header />
    <main>
      <slot />
    </main>
    <Footer />
    <KonamiCode />
  </body>
</html>
```

- [ ] **Step 4: Build to verify nothing is structurally broken**

Run: `npm run build`
Expected: exit 0. (Pages will look half-styled until later tasks — that's fine; only the build gate matters here.)

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css astro.config.mjs src/layouts/BaseLayout.astro
git commit -m "feat: add Warm Paper theme foundation (global.css, Shiki theme, base layout)"
```

---

### Task 2: Header and Footer

**Files:**
- Modify: `src/components/Header.astro` (full rewrite)
- Modify: `src/components/Footer.astro` (full rewrite)

- [ ] **Step 1: Rewrite `src/components/Header.astro`** with exactly this content:

```astro
---
const currentPath = Astro.url.pathname;

const navItems = [
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
  { href: '/search', label: 'Search' },
  { href: '/rss.xml', label: 'RSS' },
];
---

<header class="site-header">
  <a href="/" class="wordmark">Brian Scott</a>
  <nav class="site-nav" aria-label="Main navigation">
    {navItems.map(item => (
      <a
        href={item.href}
        class:list={['nav-link', { active: currentPath.startsWith(item.href) && item.href !== '/rss.xml' }]}
      >
        {item.label}
      </a>
    ))}
  </nav>
</header>

<style>
  .site-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    flex-wrap: wrap;
    gap: var(--space-xs) var(--space-sm);
    padding: var(--space-sm) 0;
    border-bottom: 1px solid var(--rule);
  }

  .wordmark {
    font-family: var(--font-serif);
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--ink);
    text-decoration: none;
  }

  .wordmark:visited {
    color: var(--ink);
  }

  .wordmark:hover {
    color: var(--accent);
  }

  .site-nav {
    display: flex;
    gap: var(--space-sm);
  }

  .nav-link {
    font-family: var(--font-sans);
    font-size: 0.82rem;
    color: var(--ink-soft);
    text-decoration: none;
    padding: 0.4rem 0.2rem;
  }

  .nav-link:visited {
    color: var(--ink-soft);
  }

  .nav-link:hover {
    color: var(--accent);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .nav-link.active {
    color: var(--ink);
    font-weight: 600;
  }
</style>
```

- [ ] **Step 2: Rewrite `src/components/Footer.astro`** with exactly this content:

```astro
---
const currentYear = new Date().getFullYear();
---

<footer>
  <nav class="footer-links" aria-label="Social links">
    <a href="https://bsky.app/profile/bscott.social">Bluesky</a>
    <a href="https://hachyderm.io/@bscott">Mastodon</a>
    <a href="https://linkedin.com/in/brianlscott/">LinkedIn</a>
    <a href="/rss.xml">RSS</a>
  </nav>
  <p class="copyright">&copy; {currentYear} Brian Scott</p>
</footer>

<style>
  footer {
    margin-top: var(--space-xl);
    padding: var(--space-md) 0;
    border-top: 1px solid var(--rule);
    text-align: center;
    font-family: var(--font-sans);
  }

  .footer-links {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: var(--space-sm) var(--space-md);
    margin-bottom: var(--space-xs);
  }

  .footer-links a {
    font-size: 0.8rem;
    color: var(--ink-muted);
    text-decoration: none;
    padding: 0.4rem 0;
  }

  .footer-links a:visited {
    color: var(--ink-muted);
  }

  .footer-links a:hover {
    color: var(--accent);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .copyright {
    font-size: 0.72rem;
    color: var(--ink-muted);
    margin-bottom: 0;
  }
</style>
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: exit 0

- [ ] **Step 4: Commit**

```bash
git add src/components/Header.astro src/components/Footer.astro
git commit -m "feat: restyle header and footer for Warm Paper theme"
```

---

### Task 3: Homepage

**Files:**
- Modify: `src/pages/index.astro` (full rewrite — old file is 648 lines of quest-log markup and styles, all replaced)

- [ ] **Step 1: Rewrite `src/pages/index.astro`** with exactly this content:

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import { getReadingTime } from '../utils/readingTime';

const allPosts = await getCollection('blog', ({ data }) => data.draft !== true);

const posts = allPosts
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
  .slice(0, 5);

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
---

<BaseLayout
  title="Brian Scott"
  description="Writing about homelab infrastructure, automation, and building things with AI assistants."
>
  <p class="intro">
    I write about homelab infrastructure, automation, and building things with
    AI assistants. Currently tinkering with Claude-powered workflows.
  </p>

  <section>
    <h2 class="section-label">Recent writing</h2>

    {posts.length === 0 ? (
      <p>No posts yet. Check back soon.</p>
    ) : (
      posts.map(post => (
        <article class="post-item">
          <h2><a href={`/blog/${post.slug}`}>{post.data.title}</a></h2>
          <p class="post-meta">
            {formatDate(post.data.pubDate)} · {getReadingTime(post.body)}
          </p>
          <p class="post-desc">{post.data.description}</p>
        </article>
      ))
    )}

    <p class="all-posts-link">
      <a href="/blog">All posts &rarr;</a>
    </p>
  </section>
</BaseLayout>

<style>
  .intro {
    font-style: italic;
    color: var(--ink-soft);
    font-size: 1.05rem;
    margin: var(--space-md) 0 var(--space-lg);
  }

  .all-posts-link {
    font-family: var(--font-sans);
    font-size: 0.85rem;
    margin-top: var(--space-lg);
  }
</style>
```

Note: `.section-label` on an `h2` keeps heading semantics while rendering as the small uppercase label — the class selector outranks the bare `h2` element selector in `global.css`, so the label styles win. Verify visually; if any serif h2 style leaks through, add `h2.section-label { font-size: 0.72rem; font-family: var(--font-sans); }` to this page's scoped style block.

- [ ] **Step 2: Build and visual check**

Run: `npm run build`
Expected: exit 0

Run: `npm run dev` and open http://localhost:4321/
Expected: cream page, "Brian Scott" wordmark + nav header, italic intro, "RECENT WRITING" label, 5 posts with title/meta/description, "All posts →" link, plain footer. No sidebar, no stat bars, no FEATURED badge.

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: redesign homepage as intro plus recent posts list"
```

---

### Task 4: TableOfContents and RelatedPosts components

**Files:**
- Modify: `src/components/TableOfContents.astro` (full rewrite)
- Modify: `src/components/RelatedPosts.astro` (full rewrite)

- [ ] **Step 1: Rewrite `src/components/TableOfContents.astro`** with exactly this content (interface unchanged — `BlogPost.astro` keeps importing `Heading`; renders only with ≥2 headings, same as before):

```astro
---
export interface Heading {
  depth: number;
  slug: string;
  text: string;
}

interface Props {
  headings: Heading[];
}

const { headings } = Astro.props;

// Only h2 and h3 headings
const tocHeadings = headings.filter(h => h.depth <= 3);
---

{tocHeadings.length > 1 && (
  <nav class="toc panel" aria-label="Table of contents">
    <p class="section-label">Contents</p>
    <ul>
      {tocHeadings.map(heading => (
        <li class={`toc-level-${heading.depth}`}>
          <a href={`#${heading.slug}`}>{heading.text}</a>
        </li>
      ))}
    </ul>
  </nav>
)}

<style>
  .toc {
    margin: var(--space-md) 0 var(--space-lg);
    font-family: var(--font-sans);
  }

  .toc .section-label {
    margin-bottom: var(--space-xs);
  }

  .toc ul {
    list-style: none;
    padding-left: 0;
    margin-bottom: 0;
  }

  .toc li {
    margin-bottom: 0.25rem;
  }

  .toc a {
    font-size: 0.85rem;
    color: var(--accent);
    text-decoration: none;
    display: inline-block;
    padding: 0.15rem 0;
  }

  .toc a:visited {
    color: var(--accent);
  }

  .toc a:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .toc-level-3 {
    padding-left: var(--space-md);
  }
</style>
```

- [ ] **Step 2: Rewrite `src/components/RelatedPosts.astro`** with exactly this content (same matching logic, "Further reading" presentation):

```astro
---
import { getCollection } from 'astro:content';

interface Props {
  currentSlug: string;
  tags: string[];
  limit?: number;
}

const { currentSlug, tags, limit = 3 } = Astro.props;

const allPosts = await getCollection('blog', ({ data }) => data.draft !== true);

const relatedPosts = allPosts
  .filter(post => post.slug !== currentSlug)
  .map(post => {
    const matchingTags = post.data.tags.filter(tag => tags.includes(tag)).length;
    return { post, matchingTags };
  })
  .filter(({ matchingTags }) => matchingTags > 0)
  .sort((a, b) => {
    if (b.matchingTags !== a.matchingTags) {
      return b.matchingTags - a.matchingTags;
    }
    return b.post.data.pubDate.valueOf() - a.post.data.pubDate.valueOf();
  })
  .slice(0, limit)
  .map(({ post }) => post);

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
---

{relatedPosts.length > 0 && (
  <aside class="further-reading">
    <p class="section-label">Further reading</p>
    <ul>
      {relatedPosts.map(post => (
        <li>
          <a href={`/blog/${post.slug}`}>{post.data.title}</a>
          <time class="meta" datetime={post.data.pubDate.toISOString()}>
            {formatDate(post.data.pubDate)}
          </time>
        </li>
      ))}
    </ul>
  </aside>
)}

<style>
  .further-reading {
    margin-top: var(--space-xl);
    padding-top: var(--space-md);
    border-top: 1px solid var(--rule);
  }

  .further-reading ul {
    list-style: none;
    padding-left: 0;
    margin-bottom: 0;
  }

  .further-reading li {
    margin-bottom: 0.6rem;
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.6rem;
  }

  .further-reading a {
    font-size: 0.98rem;
  }
</style>
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: exit 0

- [ ] **Step 4: Commit**

```bash
git add src/components/TableOfContents.astro src/components/RelatedPosts.astro
git commit -m "feat: restyle table of contents and related posts for Warm Paper theme"
```

---

### Task 5: Post layout (`BlogPost.astro`)

**Files:**
- Modify: `src/layouts/BlogPost.astro` (full rewrite)

- [ ] **Step 1: Rewrite `src/layouts/BlogPost.astro`** with exactly this content (same Props interface — callers like `src/pages/blog/[slug].astro` are untouched):

```astro
---
import BaseLayout from './BaseLayout.astro';
import TableOfContents, { type Heading } from '../components/TableOfContents.astro';
import RelatedPosts from '../components/RelatedPosts.astro';
import { getReadingTime } from '../utils/readingTime';

interface Props {
  title: string;
  description: string;
  pubDate: Date;
  updatedDate?: Date;
  tags: string[];
  headings: Heading[];
  body: string;
  slug: string;
}

const { title, description, pubDate, updatedDate, tags, headings, body, slug } = Astro.props;

const readingTime = getReadingTime(body);

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
---

<BaseLayout title={title} description={description} ogType="article">
  <article class="blog-post">
    <header class="post-header">
      <h1 class="post-title">{title}</h1>
      <p class="post-meta">
        <time datetime={pubDate.toISOString()}>{formatDate(pubDate)}</time>
        {' · '}{readingTime}
        {tags.length > 0 && (
          <>
            {' · '}
            {tags.map((tag, i) => (
              <>
                {i > 0 && ', '}
                <a href={`/blog/tags/${tag}`} class="tag-link">{tag}</a>
              </>
            ))}
          </>
        )}
      </p>
      {updatedDate && (
        <p class="post-meta updated">
          Updated <time datetime={updatedDate.toISOString()}>{formatDate(updatedDate)}</time>
        </p>
      )}
    </header>

    <TableOfContents headings={headings} />

    <div class="post-content">
      <slot />
    </div>

    {tags.length > 0 && <RelatedPosts currentSlug={slug} tags={tags} />}
  </article>
</BaseLayout>

<style>
  .post-header {
    margin-bottom: var(--space-md);
  }

  .post-title {
    margin-top: var(--space-md);
    margin-bottom: var(--space-xs);
  }

  .post-meta .tag-link {
    color: var(--accent);
    text-decoration: none;
  }

  .post-meta .tag-link:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .updated {
    margin-top: 0.2rem;
  }

  .post-content :global(h2) {
    margin-top: var(--space-xl);
    padding-top: var(--space-sm);
    border-top: 1px solid var(--rule);
  }

  .post-content :global(h3) {
    margin-top: var(--space-lg);
  }
</style>
```

- [ ] **Step 2: Build and visual check**

Run: `npm run build`
Expected: exit 0

Run: `npm run dev`, open http://localhost:4321/blog/removing-secrets-from-dotfiles-with-1password
Expected: serif title → sans meta line (date · N min read · tags) → cream Contents box → article with dark warm code blocks → "FURTHER READING" list. No dialog-box borders, no glow.

- [ ] **Step 3: Commit**

```bash
git add src/layouts/BlogPost.astro
git commit -m "feat: redesign post layout with inline contents box"
```

---

### Task 6: Blog index and tag pages

**Files:**
- Modify: `src/pages/blog/[...page].astro` (full rewrite)
- Modify: `src/pages/blog/tags/[tag].astro` (full rewrite)

- [ ] **Step 1: Rewrite `src/pages/blog/[...page].astro`** with exactly this content (same pagination logic; adds reading time to match homepage list style; keeps a plain tag-browse line):

```astro
---
import type { GetStaticPaths, Page } from 'astro';
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getReadingTime } from '../../utils/readingTime';

export const getStaticPaths: GetStaticPaths = async ({ paginate }) => {
  const allPosts = await getCollection('blog', ({ data }) => data.draft !== true);
  const posts = allPosts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
  return paginate(posts, { pageSize: 10 });
};

interface Props {
  page: Page;
}

const { page } = Astro.props;

const allPosts = await getCollection('blog', ({ data }) => data.draft !== true);
const allTags = [...new Set(allPosts.flatMap(post => post.data.tags))].sort();

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
---

<BaseLayout
  title={page.currentPage === 1 ? 'Blog' : `Blog - Page ${page.currentPage}`}
  description="All blog posts"
>
  <h1>Blog</h1>

  {allTags.length > 0 && (
    <p class="tag-browse meta">
      Browse by tag:{' '}
      {allTags.map((tag, i) => (
        <>
          {i > 0 && ', '}
          <a href={`/blog/tags/${tag}`}>{tag}</a>
        </>
      ))}
    </p>
  )}

  <section>
    {page.data.length === 0 ? (
      <p>No posts yet. Check back soon.</p>
    ) : (
      page.data.map((post: any) => (
        <article class="post-item">
          <h2><a href={`/blog/${post.slug}`}>{post.data.title}</a></h2>
          <p class="post-meta">
            <time datetime={post.data.pubDate.toISOString()}>
              {formatDate(post.data.pubDate)}
            </time>
            {' · '}{getReadingTime(post.body)}
          </p>
          <p class="post-desc">{post.data.description}</p>
        </article>
      ))
    )}
  </section>

  {page.lastPage > 1 && (
    <nav class="pagination" aria-label="Blog pagination">
      {page.url.prev ? (
        <a href={page.url.prev}>&larr; Newer</a>
      ) : (
        <span class="disabled">&larr; Newer</span>
      )}
      <span class="meta">Page {page.currentPage} of {page.lastPage}</span>
      {page.url.next ? (
        <a href={page.url.next}>Older &rarr;</a>
      ) : (
        <span class="disabled">Older &rarr;</span>
      )}
    </nav>
  )}
</BaseLayout>

<style>
  h1 {
    margin-top: var(--space-md);
  }

  .tag-browse {
    margin-bottom: var(--space-lg);
  }

  .pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-md);
    margin-top: var(--space-xl);
    padding-top: var(--space-md);
    border-top: 1px solid var(--rule);
    font-family: var(--font-sans);
    font-size: 0.85rem;
  }

  .pagination .disabled {
    color: var(--ink-muted);
  }
</style>
```

- [ ] **Step 2: Rewrite `src/pages/blog/tags/[tag].astro`** with exactly this content:

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../../layouts/BaseLayout.astro';
import { getReadingTime } from '../../../utils/readingTime';

export async function getStaticPaths() {
  const allPosts = await getCollection('blog', ({ data }) => data.draft !== true);
  const allTags = [...new Set(allPosts.flatMap(post => post.data.tags))];

  return allTags.map(tag => {
    const filteredPosts = allPosts
      .filter(post => post.data.tags.includes(tag))
      .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

    return {
      params: { tag },
      props: { posts: filteredPosts, tag },
    };
  });
}

const { posts, tag } = Astro.props;

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
---

<BaseLayout
  title={`Posts tagged "${tag}"`}
  description={`All blog posts tagged with ${tag}`}
>
  <h1>Posts tagged &ldquo;{tag}&rdquo;</h1>
  <p class="back-link meta"><a href="/blog">&larr; All posts</a></p>

  <section>
    {posts.length === 0 ? (
      <p>No posts with this tag yet.</p>
    ) : (
      posts.map(post => (
        <article class="post-item">
          <h2><a href={`/blog/${post.slug}`}>{post.data.title}</a></h2>
          <p class="post-meta">
            <time datetime={post.data.pubDate.toISOString()}>
              {formatDate(post.data.pubDate)}
            </time>
            {' · '}{getReadingTime(post.body)}
          </p>
          <p class="post-desc">{post.data.description}</p>
        </article>
      ))
    )}
  </section>
</BaseLayout>

<style>
  h1 {
    margin-top: var(--space-md);
    margin-bottom: var(--space-xs);
  }

  .back-link {
    margin-bottom: var(--space-lg);
  }
</style>
```

- [ ] **Step 3: Build and visual check**

Run: `npm run build`
Expected: exit 0

Run: `npm run dev`, open http://localhost:4321/blog and one tag page (e.g. http://localhost:4321/blog/tags/homelab)
Expected: both match the homepage list style; pagination (if more than 10 posts) shows plain "← Newer / Older →".

- [ ] **Step 4: Commit**

```bash
git add 'src/pages/blog/[...page].astro' 'src/pages/blog/tags/[tag].astro'
git commit -m "feat: restyle blog index and tag pages"
```

---

### Task 7: About page

**Files:**
- Modify: `src/pages/about.astro` (full rewrite — character-sheet markup replaced with prose; bio text, links, email obfuscation, and disclaimer content preserved)

- [ ] **Step 1: Rewrite `src/pages/about.astro`** with exactly this content:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout
  title="About"
  description="About Brian Scott - Father, Leader, TechExec, Inventor, Technologist & Writer"
>
  <h1>About</h1>

  <p>
    I'm Brian Scott &mdash; father, leader, tech executive, inventor, and writer.
    With a background in engineering leadership, DevOps, and SRE&mdash;plus
    hands-on software development&mdash;I've spent my career building reliable
    systems and teams. I hold patents and have authored publications in the
    field. This is my space for tech ramblings, home lab adventures, and
    thoughts on productivity and automation.
  </p>

  <h2>Elsewhere</h2>
  <ul>
    <li><a href="https://bsky.app/profile/bscott.social">Bluesky</a></li>
    <li><a href="https://hachyderm.io/@bscott">Mastodon</a></li>
    <li><a href="https://linkedin.com/in/brianlscott/">LinkedIn</a></li>
    <li><a href="/rss.xml">RSS feed</a></li>
    <li class="email">Email: brian<span class="ob">[at]</span>byte-mail<span class="ob">[dot]</span>xyz</li>
  </ul>

  <h2>About this site</h2>
  <p>
    This blog is built with <a href="https://astro.build">Astro</a>, a modern
    static site generator that prioritizes performance and developer
    experience. It uses vanilla CSS, system fonts (zero downloads), Markdown
    content collections, and ships no JavaScript by default.
  </p>

  <p class="disclaimer">
    This site/blog is of my own opinions and does not reflect the
    opinions/thoughts/endorsements of my Employer, Friends or Family.
  </p>
</BaseLayout>

<style>
  h1 {
    margin-top: var(--space-md);
  }

  .email .ob {
    font-family: var(--font-sans);
    font-size: 0.8em;
    color: var(--ink-muted);
  }

  .disclaimer {
    margin-top: var(--space-xl);
    padding-top: var(--space-md);
    border-top: 1px solid var(--rule);
    font-style: italic;
    font-size: 0.88rem;
    color: var(--ink-muted);
  }
</style>
```

- [ ] **Step 2: Build and visual check**

Run: `npm run build`
Expected: exit 0. Check http://localhost:4321/about — plain prose, no panels or ability bars.

- [ ] **Step 3: Commit**

```bash
git add src/pages/about.astro
git commit -m "feat: rewrite about page as plain prose"
```

---

### Task 8: Search page

**Files:**
- Modify: `src/pages/search.astro` (full rewrite — Pagefind wiring preserved verbatim: the `#search` container, stylesheet link, and init script)

- [ ] **Step 1: Rewrite `src/pages/search.astro`** with exactly this content:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="Search" description="Search blog posts">
  <h1>Search</h1>
  <p class="meta hint">Search posts by title, content, or tags. Results update as you type.</p>

  <div class="search-container" id="search"></div>
</BaseLayout>

<link rel="stylesheet" href="/pagefind/pagefind-ui.css" />
<script src="/pagefind/pagefind-ui.js" is:inline></script>
<script is:inline>
  window.addEventListener('DOMContentLoaded', () => {
    new PagefindUI({ element: '#search', showSubResults: true });
  });
</script>

<style>
  h1 {
    margin-top: var(--space-md);
    margin-bottom: var(--space-xs);
  }

  .hint {
    margin-bottom: var(--space-md);
  }

  /* Theme the Pagefind UI to match Warm Paper */
  .search-container {
    --pagefind-ui-scale: 0.9;
    --pagefind-ui-primary: var(--accent);
    --pagefind-ui-text: var(--ink);
    --pagefind-ui-background: var(--paper);
    --pagefind-ui-border: var(--rule);
    --pagefind-ui-tag: var(--panel);
    --pagefind-ui-border-width: 1px;
    --pagefind-ui-border-radius: 4px;
    --pagefind-ui-font: var(--font-sans);
  }
</style>
```

- [ ] **Step 2: Build and functional check**

Run: `npm run build && npm run preview`
(Pagefind indexes at build time, so search must be tested against the production build, not the dev server.)
Open http://localhost:4321/search, type "backup".
Expected: results appear, styled in warm tones; clicking a result navigates to the post.

- [ ] **Step 3: Commit**

```bash
git add src/pages/search.astro
git commit -m "feat: restyle search page and theme Pagefind UI"
```

---

### Task 9: 404 page

**Files:**
- Modify: `src/pages/404.astro` (full rewrite)

- [ ] **Step 1: Rewrite `src/pages/404.astro`** with exactly this content:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="Page not found" description="This page does not exist">
  <div class="not-found">
    <h1>404</h1>
    <p>This page doesn't exist. It may have been moved or deleted.</p>
    <p class="links">
      <a href="/">Home</a> · <a href="/blog">All posts</a> · <a href="/search">Search</a>
    </p>
  </div>
</BaseLayout>

<style>
  .not-found {
    text-align: center;
    padding: var(--space-xl) 0;
  }

  .not-found h1 {
    font-size: 4rem;
    margin-bottom: var(--space-sm);
  }

  .links {
    font-family: var(--font-sans);
    font-size: 0.9rem;
  }
</style>
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: exit 0. Check http://localhost:4321/does-not-exist in dev — simple centered 404.

- [ ] **Step 3: Commit**

```bash
git add src/pages/404.astro
git commit -m "feat: simplify 404 page"
```

---

### Task 10: Remove SoundToggle, patch KonamiCode

**Files:**
- Delete: `src/components/SoundToggle.astro`
- Modify: `src/components/KonamiCode.astro` (font fallbacks only)

- [ ] **Step 1: Verify nothing imports SoundToggle anymore**

Run: `grep -rn "SoundToggle" src/`
Expected: no matches (the only importer was the old `Header.astro`, rewritten in Task 2). If matches appear, remove those imports/usages first.

- [ ] **Step 2: Delete the component**

```bash
git rm src/components/SoundToggle.astro
```

- [ ] **Step 3: Patch KonamiCode font fallbacks**

In `src/components/KonamiCode.astro` there are three occurrences of `font-family: var(--font-pixel);` (around lines 54, 65, 107). `--font-pixel` no longer exists, which would make the declaration invalid. Replace **all three** with:

```css
  font-family: var(--font-pixel, var(--font-mono));
```

(The color vars like `--gold-xp` already have literal fallbacks, e.g. `var(--gold-xp, #ffd700)` — leave those alone.)

- [ ] **Step 4: Build and easter-egg check**

Run: `npm run build`
Expected: exit 0

In the dev server, on any page type the Konami sequence (↑ ↑ ↓ ↓ ← → ← → b a).
Expected: the "CHEAT ACTIVATED / +30 LIVES" overlay still appears and is legible (monospace instead of pixel font is fine).

- [ ] **Step 5: Commit**

```bash
git add -A src/components/
git commit -m "feat: remove sound toggle, keep Konami easter egg with font fallback"
```

---

### Task 11: Update CLAUDE.md docs

**Files:**
- Modify: `CLAUDE.md` (Project Overview line, Styling Philosophy section, Code Block Style Guide fonts)

- [ ] **Step 1: Update the Project Overview sentence**

Replace:

```markdown
A minimalist blog built with Astro, embracing a retro-web aesthetic with ASCII bracket navigation, classic hyperlinks, and zero JavaScript by default.
```

with:

```markdown
A minimalist blog built with Astro, using a warm paper aesthetic — cream background, serif body text, rust-orange links — with zero JavaScript by default.
```

- [ ] **Step 2: Replace the Styling Philosophy section**

Replace:

```markdown
- **Vanilla CSS**: No frameworks, all styles in `src/styles/global.css`
- **CSS Variables**: Colors, fonts, spacing defined in `:root`
- **Cyberpunk RPG Aesthetic**: Cyan/pink/gold accents, dark backgrounds, pixel fonts for headings, FF-style dialog boxes
- **Scoped Styles**: Component-specific styles use Astro's `<style>` blocks
```

with:

```markdown
- **Vanilla CSS**: No frameworks, all styles in `src/styles/global.css`
- **CSS Variables**: Colors, fonts, spacing defined in `:root` (`--paper`, `--ink`, `--accent`, `--rule`, `--panel`, `--code-bg`)
- **Warm Paper Aesthetic**: Cream background (`#faf6ef`), warm serif body text, rust-orange links (`#b3551d`), single centered reading column (42rem), system fonts only (no web font downloads)
- **Light theme only**: No dark mode variant
- **Scoped Styles**: Component-specific styles use Astro's `<style>` blocks; shared list/label/panel classes live in `global.css`
```

- [ ] **Step 3: Update the Code Block Style Guide**

Replace:

```markdown
Code blocks use **Shiki** syntax highlighting with the `tokyo-night` theme for readable, high-contrast code on the dark background.
```

with:

```markdown
Code blocks use **Shiki** syntax highlighting with the `gruvbox-dark-medium` theme — code sits in warm dark-brown blocks (`--code-bg: #2a2520`) that contrast with the cream page.
```

And replace the Fonts subsection:

```markdown
- **Code blocks** (`pre`, `pre code`): `--font-mono` (SF Mono, Monaco, Cascadia Code) — true monospace for alignment
- **Inline code** (`code`): `--font-terminal` (VT323) — retro aesthetic for inline snippets
- **Headings**: `--font-pixel` (Press Start 2P) — pixel art style
```

with:

```markdown
- **Code blocks** (`pre`, `pre code`): `--font-mono` (SF Mono, Menlo, Cascadia Code) — true monospace for alignment
- **Inline code** (`code`): `--font-mono` with a light panel-tint background
- **Headings**: `--font-serif` (Iowan Old Style / Palatino / Georgia) — same family as body text, bold
```

Also in the ASCII Diagrams bullet list, replace the line:

```markdown
- Test diagram alignment in the browser before committing (VT323 and other display fonts break box-drawing alignment)
```

with:

```markdown
- Test diagram alignment in the browser before committing
```

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for Warm Paper theme"
```

---

### Task 12: Full verification pass

**Files:** none (verification only; fix-ups allowed)

- [ ] **Step 1: Clean production build**

Run: `npm run build`
Expected: exit 0, no warnings about missing components.

- [ ] **Step 2: Grep for leftover game-theme references**

Run: `grep -rni "quest\|adventurer\|pixel\|konami\|VT323\|Press Start\|scanline\|dialog-box\|stat-bar" src/ --include="*.astro" --include="*.css" -l`
Expected: ONLY `src/components/KonamiCode.astro` (intentional easter egg). Any other file listed still has game-theme leftovers — open it and clean them up.

- [ ] **Step 3: Visual pass over every page type** (use `npm run preview` after the build so Pagefind works)

Check each, confirming warm paper styling, readable type, no broken layout:

- [ ] Homepage `/`
- [ ] Blog index `/blog` (+ `/blog/2` if pagination exists)
- [ ] One tag page, e.g. `/blog/tags/homelab`
- [ ] About `/about`
- [ ] Search `/search` (run a real query)
- [ ] 404 (any bogus URL)
- [ ] **Every one of the 9 posts**, specifically checking code blocks:
  - [ ] `automated-weekly-reflection-system`
  - [ ] `bulk-renaming-obsidian-attachments-with-ai-vision`
  - [ ] `fizzy-to-claude-code-channels-task-automation`
  - [ ] `giving-my-ai-assistant-a-voice-with-home-assistant`
  - [ ] `meet-cosmo-my-24-7-ai-assistant-powered-by-clawdbot`
  - [ ] `my-backup-strategy`
  - [ ] `removing-secrets-from-dotfiles-with-1password`
  - [ ] `securing-your-home-lab`
  - [ ] `two-layer-machine-provisioning-with-pyinfra-and-chezmoi`

  For each post: code blocks have the warm dark background with gruvbox colors; **ASCII diagrams (` ```text ` blocks) render as plain light monospace with intact box-drawing alignment**; inline code has the light panel tint; the Contents box appears on posts with 2+ headings.

- [ ] **Step 4: Konami code still works** — type ↑ ↑ ↓ ↓ ← → ← → b a on the homepage; overlay appears.

- [ ] **Step 5: Mobile check** — narrow the browser to ~375px on the homepage and one post; no horizontal overflow, nav wraps cleanly, code blocks scroll horizontally.

- [ ] **Step 6: Fix anything found, then final commit**

```bash
git add -A
git commit -m "fix: Warm Paper redesign verification cleanups"
```

(Skip the commit if Step 3-5 found nothing to fix.)

---

## Notes for the implementer

- **No test framework exists** in this repo. The verification gates are `npm run build` and the visual checks written into each task. Do not add a test framework.
- **Do not touch** `src/content/`, `src/pages/rss.xml.ts`, `src/pages/blog/[slug].astro`, `src/utils/readingTime.ts`, `src/components/OptimizedImage.astro`, or `src/content/config.ts`.
- Commit messages: conventional format, **no AI/Claude attribution** (user's global standard).
- If `gruvbox-dark-medium` is rejected by the Shiki build (unlikely — it's bundled), fall back to `tokyo-night` and change `--code-bg` to `#1a1b26` in `global.css` to match it.
- The dev server may cache aggressively; restart `npm run dev` after `astro.config.mjs` changes.
