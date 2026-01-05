# bscott blog

A minimalist blog built with Astro, embracing a retro-web aesthetic.

## Features

- ASCII bracket navigation `[home] [blog] [about]`
- Classic blue/purple hyperlinks
- System fonts (zero downloads)
- High-contrast, accessible design
- Content Collections with TypeScript
- RSS feed support
- Tag system for organizing posts
- Reading time calculation
- Table of contents for long posts
- Responsive mobile-first design
- Zero JavaScript by default

## Tech Stack

- **Framework:** Astro with TypeScript
- **Styling:** Vanilla CSS
- **Content:** Markdown/MDX with Content Collections
- **Integrations:** MDX, RSS, Sitemap

## Getting Started

### Development

Start the development server:

```bash
npm run dev
```

Open http://localhost:4321 to view the site.

### Build

Build the site for production:

```bash
npm run build
```

The static files will be generated in the `dist/` directory.

### Preview

Preview the production build:

```bash
npm run preview
```

## Creating Blog Posts

Create a new markdown file in `src/content/blog/`:

```markdown
---
title: "Your Post Title"
description: "A brief description"
pubDate: 2025-12-17
tags: ["tag1", "tag2"]
draft: false
---

Your content goes here...
```

## Customization

### Site Title and Description

Update in `src/layouts/BaseLayout.astro`:

```typescript
const siteTitle = 'bscott blog';
```

### Site URL

Update in `astro.config.mjs`:

```javascript
export default defineConfig({
  site: 'https://yourdomain.com',
  // ...
});
```

### Colors and Fonts

Edit CSS variables in `src/styles/global.css`

## Deployment

Deploy to any static hosting platform (Netlify, Vercel, GitHub Pages, Cloudflare Pages)

Build command: `npm run build`

Publish directory: `dist`
