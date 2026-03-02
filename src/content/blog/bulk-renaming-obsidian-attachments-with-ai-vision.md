---
title: "Bulk Renaming Obsidian Attachments with AI Vision"
description: "Using Claude Code, Ollama, and the Obsidian CLI to turn cryptic attachment names into descriptive ones automatically"
pubDate: 2026-03-01
tags: ["obsidian", "automation", "ai", "ollama", "pkm"]
draft: false
---

If you've used Obsidian for any length of time, you know the pain. Your attachments folder is a graveyard of `Pasted image 20241127231025.png` and `CleanShot 2025-01-19 at 13.12.18@2x.png`. These names tell you absolutely nothing about what's in the image. When you're searching for a specific screenshot or trying to understand what's embedded in a note, you're stuck opening each one.

I decided to fix this for my entire vault, all at once.

## The Goal

Rename every poorly-named attachment to something descriptive and human-readable, like `Proxmox VM Dashboard.png` or `Kubernetes Cluster Diagram.png`, while preserving all of Obsidian's bidirectional wikilinks.

The constraint: never touch the markdown files directly. All renames must go through the Obsidian CLI so links stay intact.

## Building the Tracking Database

Before renaming anything, I needed to know what I was working with. I built a JSON database that cataloged every attachment with its backlinks (which notes reference it), file type, and processing status.

![JSON database entry showing file metadata and backlinks](/images/obsidian-rename/json-database.png)

Finding backlinks was straightforward with ripgrep:

```bash
rg -l "Pasted image 20260301143202" --type md
```

This gave me a full map of which notes reference which attachments. Files that already had descriptive names (game covers, named PDFs, etc.) were filtered out automatically.

## The Failed First Attempt: Parallel Sub-Agents

My first instinct was to split the work into batches and dispatch parallel Claude Code sub-agents to chew through them simultaneously.

![Claude Code task list showing 8 parallel batch tasks](/images/obsidian-rename/task-list.png)

Clean plan, eight parallel workers, each handling a batch of files. But background sub-agents can't get interactive permission approval for tools like file reads and shell commands. Every single one hit the same wall and bailed out immediately.

Lesson learned: if your automation requires interactive approval, parallel agents won't help.

## The Working Approach: Ollama Vision Pipeline

Instead of reading images one-by-one through Claude Code (which burns context window fast), I wrote a Python script that uses Ollama's vision API to analyze images locally.

The script follows a simple loop:

1. Load the pending list from the JSON database
2. Check if each file still exists (skip already-renamed ones)
3. Send the image to Ollama's `/api/generate` endpoint, base64-encoded
4. Parse the response into a clean filename
5. Deduplicate names (append numbers for collisions)
6. Call `obsidian rename` via subprocess
7. Checkpoint progress every 10 files

The prompt for the vision model was the critical piece:

```text
Describe this image in 3-7 words for use as a filename.
Use Title Case. Be specific: mention the app/tool if it's a screenshot,
describe the diagram topic if it's a diagram, describe the code purpose
if it's code. Return ONLY the filename, nothing else.
```

I used Google's Gemma 3 4B model, which handles vision tasks well and runs comfortably on consumer hardware.

## GPU Offload via SSH Tunnel

My primary machine runs Ollama fine, but I have a homelab box with a dedicated GPU. Rather than reconfiguring network bindings, I set up a one-liner SSH tunnel:

```bash
ssh -f -N -L 11435:localhost:11434 gpu-host
```

The script pointed to `localhost:11435` and got GPU-accelerated inference. Each image took roughly 3-4 seconds to analyze, which made the whole batch finish in minutes rather than the hour it would take on CPU.

## The Obsidian CLI: The Real Hero

The `obsidian rename` command does the heavy lifting here. When you run:

```bash
obsidian rename file="Pasted image 20260301143202.png" \
  name="Anatomy of a Claude Prompt" vault="Personal"
```

It doesn't just rename the file. It finds every wikilink reference across the vault and updates them atomically. `![[Pasted image 20260301143202.png]]` becomes `![[Anatomy of a Claude Prompt.png]]` everywhere it appears.

This is why the "never edit markdown directly" constraint matters. The CLI handles the graph-wide update that would be error-prone to do manually.

## Handling Edge Cases

**PDFs** can't be sent to a vision model easily, so I fell back to context-based naming. The original filename, backlink location, and note title usually provide enough signal to generate a reasonable name.

**Name collisions** happen when multiple screenshots show similar content. The script tracks all used names and appends incrementing numbers when needed.

**Files in unexpected locations** were a surprise. Some attachments lived in `attachments/` or `Daily/attachments/` rather than the expected `System/Attachments/`. The Obsidian CLI resolves files by name (like wikilinks do), so it found and renamed them regardless of directory.

**Ollama failures** on a couple of large images (HTTP 500) were logged in the database for manual retry later. The checkpoint system meant nothing was lost.

## Before and After

```text
Before:
  Pasted image 20241127231025.png
  CleanShot 2025-01-19 at 13.12.18@2x.png
  IMG_0668.jpeg
  72EC51BE-9D03-4F4C-97A3-325D65F81B80.png

After:
  Bloom's Taxonomy Diagram.png
  Kubernetes Cluster Diagram.png
  Caves of Qud Game Screenshot.png
  Digital Fox Illustration.png
```

Every wikilink updated. No broken references. The vault is instantly more navigable.

## What I'd Do Differently

**Start with the script approach from the beginning.** I initially had Claude Code read and rename images one at a time, which works but eats context window fast. The Ollama script was the right call for batch processing.

**Add a dry-run mode.** Being able to preview all proposed renames before executing would catch weird model outputs early.

**Better PDF handling.** A dedicated PDF text extraction step would produce better names than context inference alone.

## The Stack

- **Claude Code** for orchestration, script writing, and initial prototyping
- **Ollama** with Gemma 3 4B for local vision inference
- **Obsidian CLI** for link-safe renames
- **Python** for the automation script
- **SSH tunneling** for GPU offload
- **restic** for pre-flight backup

## Takeaway

The combination of a local vision model with a domain-specific CLI tool turned a tedious manual task into an automated pipeline. The key insight: use AI for what it's good at (understanding image content) and use purpose-built tools for what they're good at (safe file renaming with link preservation).

The JSON tracking database also means I can revert any rename if the AI got it wrong. So far, the descriptions have been surprisingly accurate.
