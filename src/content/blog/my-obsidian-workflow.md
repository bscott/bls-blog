---
title: "My Obsidian Workflow: PARA Method, Daily Notes, and Connected Tools"
description: "A deep dive into how I use Obsidian for personal knowledge management, organized with PARA and integrated with other tools"
pubDate: 2026-02-01
tags: ["obsidian", "pkm", "productivity", "automation", "para"]
draft: true
---

I've been using Obsidian as my primary knowledge management system for several years now. This post details my current workflow, including folder organization, daily notes, plugin choices, and how Obsidian connects with my broader tool ecosystem.

## Why Obsidian?

<!-- TODO: Write about the journey to Obsidian -->

- Local-first, plain Markdown files
- Flexibility without lock-in
- Powerful linking and graph features
- Extensible plugin ecosystem
- Ownership of my data

Previous tools I used and why I moved on:
- Notion - great but cloud-dependent
- Roam - expensive, proprietary
- Apple Notes - too simple, no linking

## Organization: The PARA Method

### What is PARA?

The PARA method (Projects, Areas, Resources, Archives) by Tiago Forte provides a clear framework for organizing information by actionability rather than subject.

| Category | Definition | Example |
|----------|------------|---------|
| **Projects** | Short-term efforts with specific goals | "Build new blog", "Plan vacation" |
| **Areas** | Ongoing responsibilities | "Health", "Finances", "Homelab" |
| **Resources** | Topics of interest | "Programming guides", "Recipes" |
| **Archives** | Inactive items | Completed projects, past interests |

### My Folder Structure

```
Vault/
├── 00 Inbox/           # Capture everything first
├── 10 - Projects/      # Active projects with endpoints
├── 20 - Areas/         # Ongoing responsibilities
│   ├── Personal/
│   ├── Homelab/
│   ├── Career/
│   └── House/
├── 30 - Resources/     # Reference materials
└── @Archive/           # Completed/inactive items
```

### Why This Works for Me

<!-- TODO: Discuss benefits of PARA in Obsidian -->

- Clear decision making for where notes go
- Projects provide motivation through completion
- Resources don't clutter active work
- Archives preserve history without noise

## Daily Notes: The Hub of My System

### Template Structure

My daily note template captures multiple dimensions of each day:

```markdown
## The Day
- Key events and activities

## Something I Learned
- Technical insights and growth moments

## Three Good Things
- Gratitude practice

## Discovered
- New tools, resources, interesting finds
```

### Why Daily Notes Matter

<!-- TODO: Expand on daily notes value -->

- Consistent capture habit
- Foundation for weekly/monthly reflections
- Searchable personal history
- Pattern recognition over time

### Automated Reflections

<!-- TODO: Reference the weekly reflection post -->

I've built automation that analyzes daily notes to generate weekly reflections using Claude Code and MCP. [See my post on automated weekly reflections](/blog/automated-weekly-reflection-system).

## Properties and Metadata

### Frontmatter Strategy

Every note includes structured YAML frontmatter:

```yaml
---
aliases:
  - Alternate Name
tags:
  - relevant-tag
created: 2026-01-15
category: Projects
status: active
---
```

### Property Conventions

<!-- TODO: Detail my property standards -->

- Always pluralize: `tags`, `aliases`
- Use dates in `YYYY-MM-DD` format
- Keep property names short: `start` not `start-date`
- Quote internal links: `author: "[[Person Name]]"`

### Obsidian Bases (v1.9+)

<!-- TODO: Explain how I use Bases for database views -->

Bases provide native database-like views:

```yaml
filters:
  - categories.contains("Projects")
  - status == "active"
views:
  - type: table
    name: "Active Projects"
```

## Essential Plugins

### Core Plugins I Enable

<!-- TODO: List core plugins -->

- Daily Notes
- Templates
- Backlinks
- Graph View
- Quick Switcher

### Community Plugins

#### Templater

<!-- TODO: Detail Templater usage -->

More powerful than built-in templates:

```javascript
// Example: Auto-generate creation date
<%* tp.file.creation_date("YYYY-MM-DD") %>
```

#### Dataview

<!-- TODO: Dataview examples -->

Query notes like a database:

```dataview
TABLE status, due
FROM "10 - Projects"
WHERE status != "completed"
SORT due ASC
```

#### Calendar

<!-- TODO: Calendar plugin usage -->

Visual navigation of daily notes.

#### Quick Add

<!-- TODO: Quick Add for rapid capture -->

One-keystroke capture to inbox.

#### Other Plugins I Use

<!-- TODO: List other useful plugins -->

| Plugin | Purpose |
|--------|---------|
| Outliner | Better list handling |
| Excalidraw | Visual diagrams |
| Git | Version control |
| [Others] | [Purposes] |

## Linking and Graph

### Linking Philosophy

<!-- TODO: Discuss linking strategy -->

- Link liberally during writing
- Use `[[Note]]` for existing concepts
- Create notes for recurring concepts
- Don't stress about perfect structure

### Graph View

<!-- TODO: How I use the graph -->

- Periodic review for orphan notes
- Discovering unexpected connections
- Visual representation of knowledge

### MOCs (Maps of Content)

<!-- TODO: Explain MOC usage -->

Index notes that curate links to related content:

```markdown
# Homelab MOC

## Infrastructure
- [[Server Setup]]
- [[Network Architecture]]

## Services
- [[Self-Hosted Services]]
- [[Docker Configuration]]
```

## Integration with Other Tools

### NotePlan

<!-- TODO: How Obsidian and NotePlan coexist -->

- NotePlan for task management and calendar
- Obsidian for knowledge and reference
- Cross-linking between systems

### Claude Code and MCP

<!-- TODO: AI integration -->

The Obsidian MCP server enables Claude Code to:
- Read and analyze vault contents
- Generate content based on existing notes
- Create automated workflows

### Sync Strategy

<!-- TODO: How I sync across devices -->

- iCloud for primary sync
- Git for version history
- Mobile access considerations

## Capture Workflow

### Inbox Zero for Notes

<!-- TODO: Inbox processing workflow -->

1. Everything goes to `00 Inbox/` first
2. Daily processing session
3. Move to appropriate PARA category
4. Link to related notes

### Quick Capture Methods

<!-- TODO: Various capture approaches -->

- Mobile: Obsidian app + Quick Add
- Desktop: Global hotkey
- Voice: Shortcuts + transcription
- Web: Bookmarklet to inbox

## Search and Retrieval

### Finding Information

<!-- TODO: Search strategies -->

- Quick Switcher for known notes
- Full-text search for content
- Tag filtering for categories
- Dataview queries for structured data

### Avoiding the "Write Once, Read Never" Trap

<!-- TODO: Strategies for actually using notes -->

- Regular review sessions
- Link notes when writing new content
- Surface relevant notes during planning
- Use daily notes as discovery mechanism

## Maintenance Practices

### Weekly Review

<!-- TODO: Weekly maintenance tasks -->

- Process inbox to zero
- Review active projects
- Archive completed work
- Check for orphan notes

### Monthly Review

<!-- TODO: Monthly maintenance -->

- Evaluate folder structure
- Update MOCs
- Review and consolidate tags
- Archive stale projects

### Annual Review

<!-- TODO: Yearly cleanup -->

- Major reorganization if needed
- Plugin audit
- Workflow optimization

## Lessons Learned

### What Works

<!-- TODO: Successes -->

1. Consistent daily notes habit
2. PARA prevents over-categorization
3. Liberal linking creates value
4. Automation reduces friction

### What Didn't Work

<!-- TODO: Failed experiments -->

1. Over-complicated folder hierarchies
2. Too many plugins
3. Perfect organization before capture
4. Neglecting the inbox

### Advice for New Users

<!-- TODO: Recommendations -->

1. Start simple - add complexity as needed
2. Capture first, organize later
3. Daily notes are foundational
4. Don't aim for perfection

## Resources

### Learning Obsidian

<!-- TODO: Recommended resources -->

- Official Obsidian Help docs
- Nick Milo's Linking Your Thinking
- Tiago Forte's PARA articles
- r/ObsidianMD community

### My Templates

<!-- TODO: Consider sharing templates -->

## Conclusion

<!-- TODO: Summary -->

Obsidian works because it adapts to how I think rather than forcing a specific structure. The combination of local files, powerful linking, and extensibility makes it sustainable for long-term knowledge management.

The real value isn't in the tool itself - it's in the consistent practice of capturing, connecting, and reviewing information. Obsidian just makes that practice frictionless enough to maintain.

---

*Questions about my Obsidian setup? Always happy to discuss PKM workflows - there's no one right way, but sharing approaches helps everyone refine their systems.*
