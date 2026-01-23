---
title: "My Backup Strategy"
description: "A multi-layered backup approach for protecting digital files across family devices and local network"
pubDate: 2025-01-15
tags: ["homelab", "backup", "self-hosted", "infrastructure"]
draft: false
---

I wanted to discuss my backup approach for protecting digital files across my family's devices and local network. We all have important data—family photos, tax documents, hobby projects—that deserves protection.

## The Challenge

Our household uses diverse devices (PCs, Macs, tablets, etc.), and while cloud services are convenient, I prioritize data ownership and privacy. That's why I've built a multi-layered backup system.

## Desktop & Laptop Backups

For computers, I use Backblaze at $6.99/month per machine for unlimited backup storage. The service runs continuously with encryption and zero-knowledge architecture, making it ideal for less technical family members. While it limits manual selection, their AI effectively identifies important files like the home directory while excluding system files.

## Mobile & Tablet Strategy

Phones and tablets sync through iCloud, Google Drive, and Google Photos. Additionally, I run a Synology DS220+ NAS on my home network that backs up photos directly from mobile devices.

## Cloud Data Protection

The Synology uses Cloud Sync to simultaneously back up Apple and Google data to my NAS, Backblaze, and AWS S3 Glacier—creating dual redundancy at minimal cost.

## Server & IoT Backups

For Raspberry Pis and cloud servers, I employ **restic**, which creates encrypted snapshots stored in both Glacier and Backblaze via daily cronjobs.

This approach ensures comprehensive protection across all devices with full data ownership.
