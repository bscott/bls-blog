# 2D RPG Pixelated Theme - Implementation Plan

## Research Summary

Based on research into pixel art CSS techniques, JRPG UI patterns, retro typography, and real-world implementations, here's the comprehensive plan for transforming Brian's Tech Ramblings into a 2D RPG-themed blog.

---

## Design Direction

### Aesthetic: "Cyberpunk JRPG"
A fusion of classic Final Fantasy/Dragon Quest dialog boxes with a modern cyberpunk arcade color palette. Dark mode by default, high contrast, pixel-perfect details.

### Key Inspirations
- **Final Fantasy VI-VII**: Blue dialog boxes with beveled borders
- **Chrono Trigger**: Clean pixel typography with expressive UI
- **Cyberpunk Arcade**: Neon glows, dark backgrounds, CRT scanlines

---

## Color Palette

```css
/* Background Layers */
--bg-void: #050612;      /* Deepest black-blue */
--bg-deep: #0d0221;      /* Main background */
--bg-surface: #1a1a2e;   /* Elevated surfaces */
--bg-elevated: #16213e;  /* Cards, panels */

/* Accent Colors */
--cyan-glow: #00f5d4;    /* Primary accent (links, highlights) */
--pink-hot: #ff3c7d;     /* Secondary accent (hover, CTAs) */
--purple-accent: #9201cb; /* Tertiary (decorative) */
--gold-xp: #ffd700;      /* Featured, achievements */

/* Status Colors (RPG style) */
--hp-green: #39ff14;     /* Health/uptime */
--mp-blue: #00bfff;      /* Mana/duration */

/* Text */
--text-primary: #e8e8e8;
--text-secondary: #a0a0b0;
--text-dim: #6a6a7a;

/* Pixel Borders (FF-style) */
--border-outer: #1a1a3e;
--border-light: #4a4a8e;
--border-highlight: #7a7abe;
```

---

## Typography

### Fonts
| Use Case | Font | Size | Notes |
|----------|------|------|-------|
| Site Title | Press Start 2P | 20px (1.25rem) | With glow effect |
| Headings | Press Start 2P | 10-12px | Multiples of 8 preferred |
| Navigation | Press Start 2P | 10px | All caps |
| Body Text | System fonts | 16px | For readability |
| Meta/Tags | Press Start 2P | 6-8px | Small pixel text |
| Code | VT323 or system mono | 16px | Terminal aesthetic |

### Implementation
```css
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap');

.pixel-font {
  font-family: 'Press Start 2P', monospace;
  -webkit-font-smoothing: none;  /* Disable anti-aliasing */
  -moz-osx-font-smoothing: grayscale;
}
```

---

## Component Designs

### 1. Dialog Box (Post Cards)
FF-style 9-slice border simulation using CSS box-shadow:

```css
.dialog-box {
  background: linear-gradient(180deg, #0c1445 0%, #060d2e 100%);
  border: 4px solid var(--border-light);
  box-shadow:
    inset 4px 4px 0 0 var(--border-highlight),   /* Inner highlight */
    inset -4px -4px 0 0 var(--border-outer);      /* Inner shadow */
}
```

Features:
- Glowing corner accents
- Hover state with lift effect
- Arrow cursor indicator on hover

### 2. Navigation Menu
RPG command menu style:
- Vertical or horizontal list with arrow cursor
- Active state shows blinking arrow (►)
- Pixel font, all caps
- Renamed sections: "Quest Log" (blog), "Status" (about), "Inventory" (tags)

### 3. Blog Post Listings
Styled as "Quest Items":
- Title as quest name
- Description as quest objective
- Reading time as "Duration: X min"
- Date as "Acquired: MMM DD, YYYY"
- Tags as inventory item badges with quantity indicators

### 4. Stat Bars
HP/XP style progress indicators:
- Reading progress bar at top (XP bar style)
- Blog "uptime" stat (HP bar)
- Use for any percentage-based data

### 5. Tags
Inventory item badges:
- Small pixel font
- Count badge in corner (like item quantity)
- Hover glow effect

### 6. Footer
Save point aesthetic:
- Diamond/crystal icon with pulse animation
- "Progress Saved" text
- Social links as bracketed items

---

## Special Effects

### CRT Scanlines (Optional)
Subtle overlay for authenticity:
```css
body::before {
  content: "";
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.1) 0px,
    rgba(0, 0, 0, 0.1) 1px,
    transparent 1px,
    transparent 2px
  );
  pointer-events: none;
  opacity: 0.3;
}
```

### Glow Effects
Text and element glows:
```css
.glow-text {
  text-shadow:
    0 0 10px var(--cyan-glow),
    0 0 20px var(--cyan-glow);
}
```

### Animations
- Title: Gentle glow pulse
- Cursor: Blink animation (steps)
- Save icon: Diamond pulse
- Stars: Twinkle effect

---

## Implementation Phases

### Phase 1: Core Styling
1. Update `global.css` with new color palette
2. Add Press Start 2P font import
3. Create dialog-box mixin/classes
4. Update body background with gradient + scanlines

### Phase 2: Components
1. Create `PixelBorder.astro` component
2. Update `Header.astro` with RPG menu style
3. Update `Footer.astro` with save point design
4. Create `StatBar.astro` for progress indicators

### Phase 3: Page Templates
1. Update homepage with quest log layout
2. Update blog listing with inventory grid
3. Update single post with dialog box styling
4. Update about page as "Status Screen"

### Phase 4: Polish
1. Add reading progress bar
2. Add hover animations
3. Add custom cursor (optional)
4. Add sound effects (optional, toggle-able)
5. Test accessibility contrast ratios

---

## File Changes Required

| File | Changes |
|------|---------|
| `src/styles/global.css` | Complete overhaul with new palette, fonts, base styles |
| `src/layouts/BaseLayout.astro` | Add scanline overlay, progress bar |
| `src/layouts/BlogPost.astro` | Dialog box styling for content |
| `src/components/Header.astro` | RPG menu navigation |
| `src/components/Footer.astro` | Save point design |
| `src/pages/index.astro` | Quest log layout |
| `src/pages/blog/[...page].astro` | Inventory grid listing |
| `src/pages/about.astro` | Status screen design |
| NEW: `src/components/PixelBorder.astro` | Reusable dialog box wrapper |
| NEW: `src/components/StatBar.astro` | HP/XP style progress bars |
| NEW: `src/components/QuestItem.astro` | Post card component |

---

## Accessibility Considerations

1. **Contrast Ratios**: Cyan on dark (#00f5d4 on #0d0221) = 9.5:1 ✓
2. **Font Sizing**: Body text stays at 16px system fonts
3. **Motion**: Respect `prefers-reduced-motion` for animations
4. **Scanlines**: Keep opacity low (0.3) to not affect readability
5. **Focus States**: Ensure visible focus indicators

---

## Optional Enhancements

### Custom Pixel Cursor
```css
body {
  cursor: url('/cursors/pixel-pointer.png') 4 4, auto;
}
a:hover {
  cursor: url('/cursors/pixel-hand.png') 8 0, pointer;
}
```

### Sound Effects (with toggle)
- Menu select: 8-bit blip
- Page transition: level up sound
- Save point: crystal chime

### Easter Eggs
- Konami code reveals something special
- Click counter as "battles won"
- Random NPC quotes in footer

---

## Preview

The mockup file is available at:
`/Users/bscott/workspace/personal/bscott-blog/mockup-rpg-theme.html`

Open in browser to preview the design direction.

---

## Decision Points

Before implementation, confirm preferences on:

1. **Scanline Effect**: Include CRT scanlines or keep cleaner?
2. **Custom Cursor**: Use pixel cursors or keep system default?
3. **Sound Effects**: Add optional audio or keep silent?
4. **Naming**: Keep "Quest Log"/"Status" naming or prefer original?
5. **Featured Posts**: Use gold border treatment for featured content?
6. **Animation Level**: Full animations, subtle only, or respect system preference?

---

## Resources

- **NES.css**: https://nostalgic-css.github.io/NES.css/
- **Press Start 2P**: https://fonts.google.com/specimen/Press+Start+2P
- **Lospec Palettes**: https://lospec.com/palette-list
- **Game UI Database**: https://www.gameuidatabase.com/
