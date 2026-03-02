---
title: "Bulk Renaming Obsidian Attachments with AI Vision"
description: "How I turned cryptic Pasted Image filenames into descriptive ones using Claude Code's vision, the Obsidian CLI, and a reusable skill"
pubDate: 2026-03-01
tags: ["obsidian", "automation", "ai", "claude-code", "pkm"]
draft: false
---

If you've used Obsidian for any length of time, you know the pain. Your attachments folder is a graveyard of `Pasted image 20241127231025.png` and `CleanShot 2025-01-19 at 13.12.18@2x.png`. These names tell you absolutely nothing about what's in the image. When you're searching for a specific screenshot or trying to understand what's embedded in a note, you're stuck opening each one.

I decided to fix this for my entire vault, and then make it repeatable.

## The Goal

Rename every poorly-named attachment to something descriptive and human-readable, like `kubernetes-pod-logs-terminal.png` or `strategic-thinking-7-mental-powers.png`, while preserving all of Obsidian's bidirectional wikilinks.

The constraint: never touch the markdown files directly. All renames must go through the Obsidian CLI so links stay intact.

## The First Attempt: Ollama Vision Pipeline

My initial approach was a Python script that used Ollama's vision API to analyze images locally. It loaded images as base64, sent them to Gemma 3 4B running on a homelab GPU via SSH tunnel, parsed the response into a filename, and called `obsidian rename`.

It worked. I renamed 191 files in one batch. But the setup had friction: Ollama had to be running, the GPU box had to be online, the SSH tunnel had to be active, and large images occasionally caused HTTP 500 errors.

Before even getting to Ollama, I tried dispatching parallel Claude Code sub-agents to chew through batches simultaneously. That failed immediately because background sub-agents can't get interactive permission approval. Lesson learned.

## The Realization: Claude Code Already Has Vision

The breakthrough was obvious in hindsight. Claude Code is multimodal. It can read images natively with its Read tool. No API keys, no external models, no GPU tunnels. The image analysis that required an entire Ollama pipeline was already built into the tool I was using to orchestrate everything.

The new approach:

1. A Python finder script identifies generic-named images
2. Claude reads each image visually (it just sees it)
3. Claude generates a descriptive kebab-case filename
4. Claude runs `obsidian rename` to execute the rename

No dependencies beyond Claude Code and Obsidian.

## The Obsidian CLI: The Real Hero

The `obsidian rename` command does the heavy lifting. When you run:

```bash
obsidian rename file="Pasted image 20260301143202.png" \
  name="anatomy-of-a-claude-prompt"
```

It doesn't just rename the file. It finds every wikilink reference across the vault and updates them atomically. `![[Pasted image 20260301143202.png]]` becomes `![[anatomy-of-a-claude-prompt.png]]` everywhere it appears. The CLI preserves the original extension, so you only pass the new base name.

This is why the "never edit markdown directly" constraint matters. The CLI handles the graph-wide update that would be error-prone to do manually.

## Packaging It as a Skill

Since I paste screenshots into Obsidian constantly, this isn't a one-time task. New `Pasted image` files accumulate weekly. So I packaged the workflow as a [Claude Code skill](https://github.com/bscott/claude-skills) called `image-renamer`.

The skill has two parts:

**A finder script** (`scripts/rename_images.py`) that scans the attachments directory for generic filename patterns:

```python
GENERIC_PATTERNS = [
    re.compile(r"^Pasted image \d+", re.IGNORECASE),
    re.compile(r"^IMG_\d+", re.IGNORECASE),
    re.compile(r"^Screenshot[ _]\d+", re.IGNORECASE),
    re.compile(r"^CleanShot \d{4}-\d{2}-\d{2}", re.IGNORECASE),
    re.compile(r"^Screen[ _]?Cap", re.IGNORECASE),
    re.compile(r"^image[ _]?\d*\.", re.IGNORECASE),
    re.compile(r"^[A-F0-9]{8}-[A-F0-9]{4}-", re.IGNORECASE),
]
```

Run it to see what needs renaming:

```bash
python3 scripts/rename_images.py ~/Documents/ObsVaults/Personal/System/Attachments
```

**A SKILL.md** that teaches Claude the workflow: find the images, read them in batches of 3 with a 2-second sleep between batches (to manage API rate limits), generate descriptive kebab-case names, and rename via the Obsidian CLI.

The naming rules are baked into the skill instructions:

- Lowercase kebab-case only
- Be specific to content, not generic
- For UI screenshots, name the app or feature shown
- For diagrams, name the concept illustrated
- Append numeric suffix for name collisions

## Running It Weekly

The skill integrates into my weekly reflection workflow. Every Sunday when I review the week's notes, I run the image renamer as a cleanup step. It catches any new pasted images from the past seven days and gives them proper names.

A typical weekly run looks like this:

```
| Original                           | New Name                              |
|------------------------------------|---------------------------------------|
| Pasted image 20250912195603.png    | strategic-thinking-7-mental-powers.png|
| Pasted image 20250912195656.png    | work-boundaries-quote-john-castro.png |
| Pasted image 20250912200721.png    | mind-traps-cognitive-distortions.png  |
| Pasted image 20250912200951.png    | running-motivation-slow-run-quote.png |
| image.jpg                          | atlas-paradox-olivie-blake-book.jpg   |
```

14 images renamed this week, zero generic names remaining, all wikilinks updated.

## Before and After

```text
Before:
  Pasted image 20241127231025.png
  CleanShot 2025-01-19 at 13.12.18@2x.png
  IMG_0668.jpeg
  72EC51BE-9D03-4F4C-97A3-325D65F81B80.png

After:
  hyprmon-dual-monitor-config.png
  leadership-qualities-infographic.png
  happiness-chemicals-boost-chart.png
  atlas-paradox-olivie-blake-book.jpg
```

## What Changed from V1 to V2

| Aspect | V1 (Ollama) | V2 (Claude Code Skill) |
|--------|-------------|----------------------|
| Vision model | Gemma 3 4B via Ollama | Claude Code's native vision |
| Dependencies | Ollama, GPU, SSH tunnel | None (just Claude Code + Obsidian) |
| Tracking | JSON database with checkpoints | Finder script + inline processing |
| Naming style | Title Case | kebab-case |
| Execution | One-time batch script | Reusable weekly skill |
| Rate limiting | GPU-bound (~3-4s/image) | Batches of 3, 2s sleep between |
| PDF handling | Context inference fallback | Same (vision for images only) |

The JSON tracking database from V1 was useful for the initial bulk rename of 191 files. For the ongoing weekly workflow of 5-15 images, the lighter skill approach is a better fit.

## The Stack

- **Claude Code** for vision analysis, orchestration, and the skill framework
- **Obsidian CLI** (v1.12+) for link-safe renames
- **Python** for the finder script
- **Claude Code Skills** for packaging and reuse

## Takeaway

The original Ollama pipeline was a solid solution for the initial bulk operation. But once I realized Claude Code already has multimodal vision built in, the external model infrastructure became unnecessary overhead. Packaging the workflow as a skill turned a one-time hack into a sustainable weekly habit.

The key insight hasn't changed from V1: use AI for what it's good at (understanding image content) and use purpose-built tools for what they're good at (safe file renaming with link preservation). What changed is where the AI runs.
