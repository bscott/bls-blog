---
title: "Building a Blog with Astro"
description: "A technical walkthrough of building this blog using Astro, Content Collections, and TypeScript"
pubDate: 2025-12-16
tags: ["astro", "web-dev", "typescript"]
draft: false
---

Astro is a modern static site generator that's perfect for content-focused websites like blogs. Here's how I built this site.

## Why Astro?

Astro has several compelling features:

1. **Zero JavaScript by default** - Pages are rendered as pure HTML
2. **Content Collections** - Type-safe content management with Zod schemas
3. **Component Islands** - Add interactivity only where needed
4. **Fast builds** - Optimized for performance

## Setting Up Content Collections

Content Collections provide type-safe content management. Here's how to set one up:

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
```

This schema ensures all blog posts have the required frontmatter fields and provides TypeScript autocomplete.

## Querying Content

You can query content with type safety:

```typescript
import { getCollection } from 'astro:content';

const posts = await getCollection('blog', ({ data }) => {
  return data.draft !== true;
});

const sortedPosts = posts.sort(
  (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
);
```

## Dynamic Routes

Creating dynamic routes for blog posts is straightforward:

```typescript
// src/pages/blog/[slug].astro
export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post },
  }));
}
```

## Performance Results

The result is a blazing fast site:

- First Contentful Paint: <0.5s
- Time to Interactive: <1s
- Lighthouse Score: 100/100
- Total page weight: <50KB

## Conclusion

Astro makes it easy to build fast, content-focused websites with modern tooling. The combination of Content Collections, TypeScript, and zero-JavaScript-by-default is perfect for blogs.
