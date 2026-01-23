---
title: "Securing Your Home Lab: Why Container Scanning Matters"
description: "How a simple addition to my update script revealed over 100 vulnerabilities I didn't know I was hosting"
pubDate: 2025-05-20
tags: ["homelab", "security", "docker", "devops"]
draft: false
---

I've been running Docker containers in my home lab for a while now - Immich for photos, Paperless-ngx for document management, and a handful of other self-hosted services. Like most home labbers, I had a simple update script that pulled the latest images and restarted my containers every week. Set it and forget it, right?

Then I added a vulnerability scanner to my workflow, and what I found was eye-opening.

In a single scan of my running containers, I discovered **13 CRITICAL** and **105 HIGH** severity vulnerabilities. These weren't obscure theoretical issues - they included known exploits in common libraries that ship with nearly every container image.

## The Supply Chain Problem Nobody Talks About

Here's the thing about container images: when you pull `postgres:14` or `redis:8` from Docker Hub, you're not just getting that application. You're getting an entire Linux distribution underneath it, complete with hundreds of packages you never asked for and probably don't need.

Each of those packages is a potential attack vector. And here's the uncomfortable truth - **most container maintainers don't patch their base images frequently enough**.

When I scanned my Immich stack, here's what I found:

| Image | Critical | High |
|-------|----------|------|
| postgres (with extensions) | 6 | 49 |
| immich-machine-learning | 3 | 11 |
| immich-server | 1 | 8 |
| valkey (Redis fork) | 1 | 7 |

That Postgres image alone had 55 known vulnerabilities. Some of these CVEs have public exploits available. On my home network. Where my family photos live.

## "But It's Just My Home Lab"

I hear this a lot, and I used to think the same way. But consider:

- **Your home lab is on your home network.** A compromised container can pivot to attack other devices - your NAS, your smart home hub, your family's computers.
- **You're storing real data.** Family photos, financial documents in Paperless, personal projects. This isn't throwaway test data.
- **Home labs are practice for production.** The habits you build here carry over to your professional work.

Supply chain attacks are increasingly common. Remember the SolarWinds breach? The Log4j vulnerability? These weren't caused by bad code in the target applications - they came from dependencies that everyone trusted implicitly.

## Adding Scanning to My Workflow

The fix was surprisingly simple. I added [Trivy](https://trivy.dev/) to my existing update script. Now, every time I pull new images, they get scanned before the containers restart.

Here's the basic approach:

```bash
# After pulling images, scan each one
for image in $(docker compose config --images); do
    trivy image --severity HIGH,CRITICAL "$image"
done
```

Trivy checks each image against multiple vulnerability databases and reports any known issues. It's fast, free, and runs entirely locally - no data leaves your network.

I configured my script to:
1. **Pull the latest images** as usual
2. **Scan each image** for HIGH and CRITICAL vulnerabilities
3. **Log the findings** to a security report
4. **Continue with the update** (I chose availability over blocking)
5. **Send me a Discord notification** with the results

Now every Sunday at 4 AM, my containers update and I wake up to a security report in Discord. If something concerning shows up, I can investigate before it becomes a problem.

## What Can You Actually Do About Vulnerabilities?

Finding vulnerabilities is one thing. Fixing them is another. Here's my practical approach:

**1. Prioritize by exploitability.** Not all CVEs are equal. A critical vulnerability in a library your container doesn't actually use is less urgent than a medium-severity issue in an exposed service.

**2. Check if patches exist.** Many vulnerabilities in container images are in the base OS packages. Sometimes updating to a newer image tag fixes them. Sometimes you're waiting on the upstream maintainer.

**3. Accept calculated risk.** Some vulnerabilities will persist. Document them, understand the exposure, and mitigate where possible (network segmentation, limiting container privileges).

**4. Use minimal base images when possible.** Alpine-based images have fewer packages and therefore fewer vulnerabilities than Debian or Ubuntu-based images.

**5. Stay informed.** Subscribe to security advisories for your critical applications. Know when updates matter.

## The Bigger Picture: Supply Chain Awareness

This experience changed how I think about container images. I no longer see `docker pull` as a simple, safe operation. Every image I pull is code written by strangers, built on dependencies maintained by other strangers, running with access to my network and data.

That's not a reason to avoid containers - they're incredibly useful. But it is a reason to:

- **Verify what you're running.** Scan images regularly.
- **Minimize your attack surface.** Run only what you need.
- **Stay updated.** Automate updates, but know what's changing.
- **Monitor for issues.** Logging and alerting aren't just for production.

## Getting Started

If you want to add scanning to your home lab, here's what I'd recommend:

1. **Install Trivy** - It's available in most package managers or as a container itself
2. **Run a baseline scan** - `trivy image <your-image>` on each container you're running
3. **Don't panic** - You'll find vulnerabilities. Everyone does.
4. **Integrate into your workflow** - Add scanning to your update process
5. **Set up notifications** - You need to actually see the results to act on them

The goal isn't zero vulnerabilities - that's nearly impossible with modern container images. The goal is *awareness*. Knowing what risks you're accepting and making informed decisions about your home lab security.

## Wrapping Up

My home lab runs the same containers it did before I added scanning. The difference is now I *know* what's running, what risks exist, and I have a system to catch new issues as they emerge.

Supply chain security isn't just an enterprise concern. If you're self-hosting services on your home network, you're part of the software supply chain whether you realize it or not. Taking a few minutes to add vulnerability scanning gives you visibility into risks you're already taking.

Your home lab deserves the same security awareness you'd bring to any system handling important data. Because that's exactly what it is.
