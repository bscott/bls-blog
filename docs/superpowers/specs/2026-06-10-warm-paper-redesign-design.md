# Warm Paper Redesign — Design Spec

**Date:** 2026-06-10
**Status:** Approved

## Goal

Replace the cyberpunk JRPG theme (pixel fonts, scanlines, glow effects, quest/RPG framing) with a calm, readable "Warm Paper" theme: cream background, warm serif body text, rust-orange links. Readability first, personality second. The redesign touches only the presentation layer — content, routing, and data stay untouched.

## Decisions (validated with mockups)

| Question | Decision |
|---|---|
| Visual direction | Warm Paper — cream background, warm serif, rust-orange links |
| Homepage structure | Short two-line intro, then recent posts |
| Post page | Inline Contents box under the title (no sidebar TOC) |
| Game-flavored extras | Remove all except the Konami code easter egg |
| Dark mode | Light only |
| Code blocks | Dark islands — warm dark-brown blocks on the cream page |
| Depth | Full presentation refresh (CSS + markup/copy), not a CSS-only reskin |

## 1. Theme System (`src/styles/global.css` — full rewrite)

### Palette

```text
--paper:        #faf6ef   page background
--ink:          #2b2620   body text
--ink-soft:     #55493c   secondary text
--ink-muted:    #8a7f70   metadata, captions
--accent:       #b3551d   links (darken on hover, e.g. #8a3f12)
--rule:         #e2d9c8   hairline borders
--panel:        #f3ecdf   contents box / inline-code tint
--code-bg:      #2a2520   code block background
--code-ink:     #d8d0c0   code block default text
```

### Typography

- **Body:** `Iowan Old Style, Palatino, Georgia, serif`, 18px base, line-height 1.65.
- **Headings:** same serif, bold, conventional sizes (h1 ~1.7rem, h2 ~1.35rem, h3 ~1.1rem). No pixel fonts anywhere.
- **UI/meta** (nav, dates, tags, labels, contents box): system sans stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`), smaller and muted.
- **Code:** `"SF Mono", Menlo, Monaco, "Cascadia Code", Consolas, monospace` for both blocks and inline. VT323 and Press Start 2P are removed entirely.
- **No web font imports.** System fonts only — delete the Google Fonts `@import`.

### Layout

- Single centered column, `max-width: 42rem` for prose; generous vertical rhythm.
- Links: accent color, underlined (solid, `text-underline-offset: 3px`); visited stays accent.

### Code blocks

- Blocks: `--code-bg` background, rounded corners, no terminal-header decoration (`pre::before "$ TERMINAL"` is deleted), no inset/glow shadows.
- Shiki theme: switch `astro.config.mjs` to a warm dark theme (`gruvbox-dark-medium` first choice). If it clashes with `--code-bg`, keep `tokyo-night` and adjust `--code-bg` to suit it.
- `text`/`plaintext` blocks must render as plain light text on the dark block (ASCII diagrams in existing posts depend on this).
- Inline code: mono stack, `--panel` background tint, hairline border, no color change.

### Deleted outright

Scanline overlay, margin icon sprites (`html::before/after`), all glow/twinkle/pulse animations, custom pixel cursors, custom scrollbar styling, dialog-box / stat-bar / quest-item / status-panel / corner-decoration / save-point / pixel-star CSS, reading progress bar styles.

## 2. Pages & Components

### Header (`src/components/Header.astro`)

- "Brian Scott" plain serif wordmark, left-aligned; right-aligned sans nav: **Blog · About · Search · RSS**.
- One hairline rule below. Remove SoundToggle import, "LEVEL 99 TECHNOLOGIST" subtitle, arrow-cursor nav animations, and quest-themed labels (QUEST LOG → Blog, STATUS → About, SUBSCRIBE → RSS).

### Homepage (`src/pages/index.astro`)

- Two-line italic intro (draft, editable): *"I write about homelab infrastructure, automation, and building things with AI assistants. Currently tinkering with Claude-powered workflows."*
- Small uppercase sans label "Recent writing", then 5 latest posts: title link / `date · N min read` / one-line description.
- Removed: sidebar, ADVENTURER STATUS panel, stat bars, FEATURED badge, tag cloud, quest framing, post-count badge.
- Footer of list: link to the full blog index ("All posts →").

### Post page (`src/layouts/BlogPost.astro`)

Order: title → meta line (`date · N min read · tag, tag`) → Contents box → article → Further reading.

- Tags render as plain accent-colored text links (no badges, no counts).
- Contents box: restyled `TableOfContents.astro` — `--panel` background, hairline border, "Contents" sans label, h2/h3 links. Rendered only when the post has ≥2 headings.
- `RelatedPosts.astro` restyled as a simple "Further reading" link list.
- Reading progress bar removed.

### Blog index (`src/pages/blog/[...page].astro`) and tag pages (`src/pages/blog/tags/[tag].astro`)

- Same list style as homepage, all posts, existing pagination logic kept; controls restyled as plain `← Newer / Older →` links.
- Tag pages match, with a plain "Posts tagged X" heading.

### About / Search / 404

- Restyled into the same single column. Character-sheet/game copy rewritten as plain prose. Search keeps its existing client-side behavior, reskinned. 404 becomes a simple "Page not found" with a link home.

### Footer (`src/components/Footer.astro`)

- Plain centered sans line: copyright + existing links (Bluesky · Mastodon · LinkedIn · RSS) without the ASCII brackets. Save-point styling removed.

### Kept as-is

Content schema (`src/content/config.ts`), all `.md` posts, routing, `rss.xml.ts`, `readingTime.ts`, `OptimizedImage.astro`, and `KonamiCode.astro` (hidden easter egg survives; patch minimally if its overlay depends on removed CSS variables).

### Deleted files

`SoundToggle.astro` and all its imports.

## 3. Risks & Verification

- **ASCII diagram regression:** several posts contain `text`-hinted ASCII diagrams. Verify every post's code blocks render aligned and plain after the Shiki theme change.
- **Konami code dependency:** the easter egg may reference removed CSS variables/classes; verify it still triggers and renders sanely.
- **Verification gate:** `npm run build` passes; visual pass in dev server over every page type — home, post (each of the 9 posts), blog index + pagination, a tag page, about, search, 404.

## 4. Documentation

Update `CLAUDE.md`: rewrite "Styling Philosophy" (Warm Paper palette, serif/sans/mono roles, single column) and the Code Block Style Guide fonts section (mono everywhere, VT323 gone). Code-block language-hint rules stay unchanged.

## Out of Scope

Dark mode, new features (comments, analytics), content edits to posts, changes to URLs/routing, RSS format changes.
