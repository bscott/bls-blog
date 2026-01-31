---
title: "Giving My AI Assistant a Voice with Home Assistant"
description: "How I connected Cosmo to Home Assistant Voice speakers so my AI assistant can talk to me through the house"
pubDate: 2026-01-31
tags: ["homelab", "ai", "home-assistant", "automation", "clawdbot", "self-hosted", "tts"]
draft: false
---

*How I connected Cosmo to Home Assistant Voice speakers so my AI assistant can talk to me through the house*

## Beyond the Screen

In my [last post](/blog/meet-cosmo-my-24-7-ai-assistant-powered-by-clawdbot), I introduced Cosmo — my 24/7 AI assistant running on [OpenClaw](https://github.com/openclaw/openclaw) in my homelab. Cosmo manages my notes, monitors services, tracks bookmarks, and handles all sorts of background automation. But every interaction happened through text — Telegram messages, terminal commands, web chat.

I wanted something more ambient. Something where Cosmo could just *tell me* things — a morning briefing while I'm getting ready, an alert when something goes wrong in the lab, or just a friendly notification that a long-running task finished.

The answer was already sitting on my nightstand: Home Assistant Voice.

## The Hardware

I have two [Home Assistant Voice](https://www.home-assistant.io/voice_control/) satellites in the house — ESPHome-based smart speakers with built-in wake word detection:

| Speaker | Location | Wake Word |
|---------|----------|-----------|
| HA Voice PE #1 | Master Bedroom | "Hey Jarvis" |
| HA Voice PE #2 | Gaming Room | "Hey Jarvis" |

These are proper bidirectional voice devices. They can listen (via Assist pipelines) and they can speak (via TTS services and the `announce` feature). That second capability is what I was after.

## The Integration

Home Assistant exposes everything as REST API calls. Since Cosmo already had access to my HA instance over Tailscale, the integration was surprisingly straightforward.

### TTS: Making It Talk

Home Assistant supports multiple TTS engines. I tested three:

**1. Nabu Casa Cloud TTS** (recommended — best quality)
```bash
curl -s -X POST \
  -H "Authorization: Bearer $HASS_TOKEN" \
  -H "Content-Type: application/json" \
  "$HASS_URL/api/services/tts/speak" \
  -d '{
    "entity_id": "tts.home_assistant_cloud",
    "media_player_entity_id": "media_player.bedroom_speaker_media_player",
    "message": "Good morning Brian. You have 3 new Raindrop saves and no alerts."
  }'
```

**2. Google Translate TTS** (free, robotic)
```bash
curl -s -X POST \
  -H "Authorization: Bearer $HASS_TOKEN" \
  -H "Content-Type: application/json" \
  "$HASS_URL/api/services/tts/speak" \
  -d '{
    "entity_id": "tts.google_translate_en_com",
    "media_player_entity_id": "media_player.bedroom_speaker_media_player",
    "message": "Hello from the free tier."
  }'
```

**3. Legacy Cloud Say** (still works, less flexible)
```bash
curl -s -X POST \
  -H "Authorization: Bearer $HASS_TOKEN" \
  -H "Content-Type: application/json" \
  "$HASS_URL/api/services/tts/cloud_say" \
  -d '{
    "entity_id": "media_player.bedroom_speaker_media_player",
    "message": "This is the legacy method."
  }'
```

The Nabu Casa Cloud TTS is the clear winner — natural-sounding voices with good cadence. Worth the Home Assistant Cloud subscription on its own.

### Volume Control

Nobody wants to get blasted by a notification at 2 AM:

```bash
curl -s -X POST \
  -H "Authorization: Bearer $HASS_TOKEN" \
  -H "Content-Type: application/json" \
  "$HASS_URL/api/services/media_player/volume_set" \
  -d '{
    "entity_id": "media_player.bedroom_speaker_media_player",
    "volume_level": 0.25
  }'
```

## How Cosmo Uses It

With the REST API mapped out, I gave Cosmo the ability to speak through any speaker in the house. Here's how it fits into the workflow:

### Proactive Notifications

Cosmo runs hourly heartbeat checks — monitoring services, checking for new bookmarks, verifying backups. If something needs my attention, instead of just logging it or sending a Telegram message, it can announce through the nearest speaker:

> *"Hey Brian, Tailscale went offline on the Proxmox node. You might want to check that."*

### Task Completion Alerts

When I kick off a long-running background task (a subagent doing research, a large file sync, a deployment), Cosmo can announce when it's done:

> *"Your blog deployment finished successfully."*

### Morning Briefing

A scheduled summary of what happened overnight — new saves, completed tasks, any alerts that fired. Delivered through the bedroom speaker while I'm getting ready.

## The Architecture

Here's how all the pieces connect:

```
┌──────────────┐     ┌──────────────┐     ┌─────────────────┐
│   OpenClaw   │────▶│    Home      │────▶│  HA Voice       │
│   (Cosmo)    │ API │  Assistant   │ TTS │  Speakers       │
│              │     │              │     │  🔊 Bedroom     │
│  Lab Server  │     │  (Tailscale) │     │  🔊 Gaming Room │
│              │     │              │     │                 │
└──────────────┘     └──────────────┘     └─────────────────┘
```

Everything communicates over my Tailscale network — encrypted, no ports exposed to the internet. The HA Voice speakers connect to Home Assistant locally over WiFi, and Cosmo reaches HA via its Tailscale address.

## Tips If You're Building This

**Start with `tts/speak`** — it's the modern service call and gives you the most control over which TTS engine to use.

**Set a sane default volume.** I keep the bedroom speaker at 25% and only bump it for important alerts. Your future self at 3 AM will thank you.

**Use the `announce` feature** for time-sensitive messages. HA Voice speakers support interrupting whatever's playing to deliver an announcement, then resuming.

**Rename your devices.** Out of the box, HA Voice speakers have generic serial-based names. Rename them in Home Assistant to something human-readable like `bedroom_speaker` — it makes automations much easier to reason about.

**Test all three TTS methods.** Google Translate is free but sounds robotic. Nabu Casa Cloud is natural but requires a subscription. Find what works for your use case.

## What's Next

The obvious next step is making this bidirectional — using the "Hey Jarvis" wake word to trigger Cosmo directly through the speakers, not just HA's built-in Assist pipeline. Imagine walking into a room and asking your AI assistant a question without reaching for your phone.

I'm also exploring time-aware volume scheduling (quieter at night, louder during the day) and room-aware notifications (speak through whichever speaker is closest based on motion sensors).

The home is becoming an interface. The screen is becoming optional.

---

*Building something similar? Find me on [Bluesky](https://bsky.app/profile/bscott.social) or [Mastodon](https://hachyderm.io/@bscott).*
