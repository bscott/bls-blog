---
title: "My Homelab Setup in 2026: Hardware, Services, and Lessons Learned"
description: "A comprehensive tour of my current homelab infrastructure including hardware choices, self-hosted services, and hard-won insights"
pubDate: 2026-03-01
tags: ["homelab", "self-hosted", "infrastructure", "docker", "networking"]
draft: true
---

My homelab has evolved significantly over the years, from a single Raspberry Pi running Pi-hole to a more comprehensive setup that handles everything from photo management to home automation. Here's a detailed look at my current infrastructure.

## Hardware Overview

### The Main Server

<!-- TODO: Detail primary server specs -->

| Component | Specification |
|-----------|--------------|
| CPU | [Model] |
| RAM | [Amount] |
| Storage | [Configuration] |
| OS | [Distribution] |

Why I chose this hardware:
- Power efficiency considerations
- Noise levels for home environment
- Expansion capabilities

### Network Attached Storage

<!-- TODO: Detail NAS setup -->

**Synology DS220+**
- [Storage configuration]
- [RAID setup]
- Primary uses: backups, media, file sharing

### Raspberry Pi Fleet

<!-- TODO: List Pis and their purposes -->

| Device | Purpose | Location |
|--------|---------|----------|
| Pi 4 | [Use] | [Where] |
| Pi 4 | [Use] | [Where] |
| Pi Zero 2W | [Use] | [Where] |

### Mini PCs and Edge Devices

<!-- TODO: Any additional compute -->

## Network Architecture

### Physical Network

<!-- TODO: Network diagram or description -->

```
[Internet] --> [Router] --> [Switch] --> [Devices]
                  |
                  v
              [WiFi APs]
```

### VLANs and Segmentation

<!-- TODO: Network segmentation strategy -->

- **VLAN 10**: Management/Infrastructure
- **VLAN 20**: Trusted devices
- **VLAN 30**: IoT devices
- **VLAN 40**: Guest network

### DNS and Ad Blocking

<!-- TODO: Pi-hole/AdGuard setup -->

## Self-Hosted Services

### Media and Photos

#### Immich

<!-- TODO: Detail Immich setup -->

- Why I chose Immich over alternatives
- Storage backend configuration
- Mobile app experience
- Machine learning features

#### Jellyfin/Plex

<!-- TODO: Media server setup -->

### Document Management

#### Paperless-ngx

<!-- TODO: Document workflow -->

- Consumption workflow
- OCR configuration
- Tagging strategy

### Home Automation

#### Home Assistant

<!-- TODO: HA setup overview -->

- Integration highlights
- Automation examples
- Dashboard approach

### Development and CI/CD

#### Gitea/Forgejo

<!-- TODO: Self-hosted git -->

#### CI Runners

<!-- TODO: Self-hosted CI -->

### Monitoring and Observability

#### Uptime Kuma

<!-- TODO: Uptime monitoring -->

#### Grafana + Prometheus

<!-- TODO: Metrics setup -->

### Other Services

<!-- TODO: List other services -->

| Service | Purpose | Notes |
|---------|---------|-------|
| Nginx Proxy Manager | Reverse proxy | |
| Portainer | Container management | |
| Vaultwarden | Password management | |
| [Other] | [Purpose] | |

## Container Strategy

### Docker Compose Organization

<!-- TODO: How I organize compose files -->

```
/opt/docker/
├── immich/
│   └── docker-compose.yml
├── paperless/
│   └── docker-compose.yml
└── monitoring/
    └── docker-compose.yml
```

### Update Strategy

<!-- TODO: Reference my update and scanning workflow -->

- Automated weekly updates
- Vulnerability scanning with Trivy
- Discord notifications

### Backup Strategy

<!-- TODO: Reference backup post or summarize -->

## Power and Cooling

### Power Consumption

<!-- TODO: Power monitoring and optimization -->

- Measured consumption
- UPS setup
- Power failure handling

### Cooling Considerations

<!-- TODO: Thermal management -->

## Remote Access

### VPN Setup

<!-- TODO: How I access remotely -->

- WireGuard/Tailscale approach
- Split tunneling configuration

### External Access

<!-- TODO: Public-facing services if any -->

- Cloudflare Tunnel usage
- Security considerations

## Lessons Learned

### What Works Well

<!-- TODO: Successes -->

1. Docker for everything possible
2. Proper backups from day one
3. Network segmentation
4. Documentation as you go

### Mistakes I've Made

<!-- TODO: Honest retrospective -->

1. Over-engineering early on
2. Inadequate initial backup strategy
3. Ignoring security until too late
4. Not monitoring power consumption

### Cost Considerations

<!-- TODO: Running costs and budget -->

- Hardware investment breakdown
- Monthly operating costs
- Cloud services comparison

## Future Plans

### Planned Upgrades

<!-- TODO: What's next -->

- [Planned hardware changes]
- [New services to deploy]
- [Infrastructure improvements]

### What I'm Evaluating

<!-- TODO: Things I'm considering -->

- Kubernetes vs. Docker Compose
- More edge compute
- Better automation

## Getting Started Recommendations

### For Beginners

<!-- TODO: Advice for those starting out -->

1. Start small - one service at a time
2. Document everything
3. Plan your backups before storing important data
4. Learn networking basics

### Essential First Services

<!-- TODO: Recommended starter services -->

1. Pi-hole/AdGuard - immediate value
2. Password manager - essential security
3. File sync/backup - protect your data

## Resources

### Useful Communities

<!-- TODO: Communities I recommend -->

- r/homelab
- r/selfhosted
- Self-Hosted Podcast

### Documentation I Maintain

<!-- TODO: Reference to any docs -->

## Conclusion

<!-- TODO: Summary and philosophy -->

A homelab is never "done" - it evolves with your needs and skills. The key is balancing the urge to tinker with the need for stability. Every component should either solve a real problem or teach you something valuable.

---

*Questions about my setup? Happy to discuss specifics - the homelab community is always generous with knowledge, and I try to pay it forward.*
