---
title: "From Card to Action: Connecting Fizzy to Claude Code with Channels"
description: "How I built a webhook pipeline from Basecamp's Fizzy to Claude Code using the new Channels API, so moving a card to 'Action' triggers my AI assistant to execute the task"
pubDate: 2026-04-01
tags: ["ai", "automation", "homelab", "claude-code", "self-hosted", "webhooks"]
draft: false
---

*Move a card, get it done. How I connected Basecamp's Fizzy to my Claude Code session using the Channels API.*

## The Idea

I run a personal AI assistant called Nova through [Claude Code](https://claude.ai/code). It manages my homelab, tracks subscriptions, journals my day, and handles infrastructure tasks — all through a terminal session on my workstation. But every task required me to type a command or send a message.

I wanted something more natural: **drop a card on a board, and Nova picks it up and does it.**

[Fizzy](https://github.com/basecamp/fizzy) is Basecamp's self-hostable project management tool — think cards on a board with columns. I set up a "Nova" board where cards moved to the "Action" column become tasks for my AI assistant. Fizzy sends a webhook, Claude Code receives it through the new [Channels API](https://code.claude.com/docs/en/channels), and Nova acts on it.

## The Architecture

```
┌─────────────────────────┐
│  Fizzy (self-hosted)    │
│  Card → Action column   │
│         │               │
│    Webhook fires        │
└─────────┬───────────────┘
          │ HTTPS POST
          ▼
┌─────────────────────────┐
│  Channel Server         │
│  (MCP server on :8081)  │
│         │               │
│  Parses card payload    │
│  Pushes channel event   │
└─────────┬───────────────┘
          │ MCP stdio
          ▼
┌─────────────────────────┐
│  Claude Code Session    │
│  (Nova)                 │
│         │               │
│  Reads card title &     │
│  description, executes  │
│  task, posts result     │
│  back to Fizzy card     │
└─────────────────────────┘
```

## What Are Claude Code Channels?

Channels are a new feature in Claude Code (v2.1.80+) that let MCP servers push events into a running session. Unlike standard MCP tools where Claude pulls data on demand, channels push data to Claude when something happens externally.

A channel server is a standard MCP server that declares the `claude/channel` capability. When an event arrives, it sends a `notifications/claude/channel` notification, and Claude sees it as a `<channel>` tag in its context — similar to how a chat message arrives, but from an automated source.

The key insight: **channels turn Claude Code from a pull-based assistant into a reactive one.** Instead of asking Claude to check something, external systems tell Claude when something needs attention.

## Building the Channel Server

The channel server is a Bun script that serves two purposes:

1. **Chat bridge** — a web UI for two-way conversation with Nova (replacing an older CLI-spawning approach)
2. **Webhook receiver** — accepts HTTP POSTs from Fizzy and pushes them as channel events

Here's the core of the webhook handler:

```typescript
// POST /api/webhook/fizzy
if (req.method === "POST" && url.pathname === "/api/webhook/fizzy") {
  const rawBody = await req.text();
  const body = JSON.parse(rawBody);

  // Fizzy payload: { action, eventable: { title, description, column: { name } } }
  const event = body.action || "unknown";
  const card = body.eventable || body;
  const title = card.title || "Untitled";
  const description = card.description || "";
  const column = card.column?.name || "";

  let summary = `Fizzy: "${title}" → ${column}`;
  if (description) summary += `\n\nDescription: ${description}`;

  // Push to Claude Code session
  await mcp.notification({
    method: "notifications/claude/channel",
    params: {
      content: summary,
      meta: { source: "fizzy", event_type: event, card_title: title, column },
    },
  });

  return new Response(JSON.stringify({ ok: true }));
}
```

The server also exposes a `portal_reply` tool so Claude can send messages back to the web chat UI, and a generic `/api/webhook/*` endpoint for other services to push events in the future.

## The Fizzy Side

Fizzy supports webhooks natively — you configure a URL and subscribe to events like `card_triaged` (moved to a column), `card_closed`, `comment_created`, etc.

The webhook payload includes the full card data: title, description, column, creator, assignees, and a link back to the card. Fizzy also signs each request with HMAC-SHA256, so the channel server can verify the request is legitimate.

One thing I learned: Fizzy has SSRF protection that blocks webhooks to private IPs (including Tailscale's `100.64.0.0/10` range). Since my homelab runs on Tailscale, I had to patch the SSRF check for self-hosted use. Something to be aware of if you're running Fizzy on a private network.

## Running It

The channel server registers as an MCP server in Claude Code's config:

```json
{
  "mcpServers": {
    "portal-channel": {
      "command": "bun",
      "args": ["/path/to/portal-channel.ts"]
    }
  }
}
```

Then Claude Code starts with the channels flag:

```bash
claude --dangerously-load-development-channels server:portal-channel
```

The `dangerously-load-development-channels` flag is needed during the research preview — custom channels aren't on the approved allowlist yet. Once channels graduate from preview, this should simplify.

## What It Looks Like in Practice

I create a card on the Nova board in Fizzy:

> **Title:** Backup Status
> **Description:** Check backup status on iotstn and post a comment on this card with the details

I drag it to the "Action" column. Within seconds, Nova receives the webhook:

```
<channel source="portal-channel" event_type="card_triaged" card_title="Backup Status" column="Action">
Fizzy: "Backup Status" → Action (board: Nova)
Description: Check backup status on iotstn and post a comment on this card with the details
</channel>
```

Nova SSHes into the server, collects backup data, posts a comment on the Fizzy card via the API with the results, and closes the card. The whole loop — card created, moved to action, task executed, results posted, card closed — happens without me touching the terminal.

## Beyond Fizzy

The channel server accepts webhooks from any source at `/api/webhook/{source-name}`. Future integrations I'm planning:

- **Backup failures** → Nova investigates and reports
- **Docker container health** → Nova checks logs and alerts
- **Subscription renewals** → Nova reminds me before charges hit
- **CI/CD results** → Nova reviews failures and suggests fixes

The pattern is always the same: external event → webhook → channel server → Claude Code session → action.

## What I'd Improve

**The channel server needs to run with Claude Code.** If Claude Code isn't running, webhooks still get accepted (HTTP 200) but the MCP notification has nowhere to go. A queue or retry mechanism would help for when the session isn't active.

**Fizzy's webhook events don't include a `card_column_changed` action via the API**, even though the UI shows it. Moving between custom columns doesn't always trigger the events you'd expect. I ended up relying on `card_triaged` which fires when a card moves from the triage inbox to any column.

**The research preview flag is verbose.** I'm looking forward to channels being a standard feature so the startup command is just `claude` with the MCP server configured.

## Wrapping Up

Channels turn Claude Code from a tool you talk to into an assistant that reacts to your systems. Fizzy gives it a visual task board. Together, they create a loop where I can manage tasks from my phone (via Fizzy's mobile UI), and Nova handles the execution on my homelab.

The code is all self-hosted — Fizzy on Docker with a Tailscale sidecar, the channel server on my workstation, Claude Code running in a persistent terminal. No external services required beyond the Claude API itself.

If you're running Claude Code and want to experiment with channels, the [Channels documentation](https://code.claude.com/docs/en/channels) and [Channels reference](https://code.claude.com/docs/en/channels-reference) are the places to start. The `fakechat` demo plugin is a good first step before building your own.
