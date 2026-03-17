---
title: "Removing Secrets from Dotfiles with 1Password"
description: "How I replaced hardcoded credentials in my bashrc with 1Password service accounts, setec, and automated provisioning"
pubDate: 2026-03-17
tags: ["security", "homelab", "devops", "1password", "tailscale"]
draft: true
---

I use [chezmoi](https://www.chezmoi.io/) to manage my dotfiles across multiple machines. It works great — until it catches you trying to commit API keys.

I was adding some changes to my chezmoi source directory when the built-in secret scanner blocked me:

```text
chezmoi: /home/bscott/.bashrc:12: Detected a Generic API Key
```

Fair enough. My `.bashrc` had Backblaze B2 credentials and a restic password sitting right there in plain text:

```bash
export RESTIC_PASSWORD=mySecretPassword
export RESTIC_REPOSITORY=b2:mybucket:Backups
export B2_ACCOUNT_ID="your-account-id-here"
export B2_ACCOUNT_KEY="your-account-key-here"
```

These had been there for months. They worked. But they were also in my dotfiles git repo, which meant every machine I provisioned got a copy, and every commit included them in the history.

Time to fix it properly.

## The Goal

1. No secrets in dotfiles or git repos
2. Interactive shells (terminals) can access secrets without friction
3. Cron jobs can access secrets without a human present
4. New machines get set up automatically

## Step 1: Store Secrets in 1Password

I created an API Credential item called "Backblaze B2" in my 1Password **Automation** vault with fields for each credential: `restic_password`, `restic_repository`, `account_id`, and `account_key`.

Why a separate Automation vault? The Personal vault requires the 1Password desktop agent and biometric authentication. That's fine for interactive use, but cron jobs and scripts need to run unattended. A service account can only access vaults you explicitly grant — keeping automation credentials isolated is good practice.

## Step 2: Replace Hardcoded Values in bashrc

The `op` CLI can read individual fields from 1Password using a URI format:

```bash
op read 'op://VaultName/ItemName/FieldName'
```

My `.bashrc` now looks like this:

```bash
# 1Password service account for non-interactive access
export OP_SERVICE_ACCOUNT_TOKEN="$(cat ~/.config/op/service-account-token)"

# Restic environment variables
export RESTIC_PASSWORD="$(op read 'op://Automation/Backblaze B2/restic_password')"
export RESTIC_REPOSITORY="$(op read 'op://Automation/Backblaze B2/restic_repository')"
export B2_ACCOUNT_ID="$(op read 'op://Automation/Backblaze B2/account_id')"
export B2_ACCOUNT_KEY="$(op read 'op://Automation/Backblaze B2/account_key')"
```

The key detail: `OP_SERVICE_ACCOUNT_TOKEN` must be set **before** any `op read` calls. Without it, the `op` CLI falls back to the desktop agent and prompts for biometric auth every time you open a terminal. With the service account token, it authenticates silently.

## Step 3: Create a 1Password Service Account

Service accounts are designed for exactly this — non-interactive, machine-to-machine access. I created one in the 1Password web console under Developer settings and granted it access to just the Automation vault.

The token goes in a local file with restrictive permissions:

```bash
mkdir -p ~/.config/op
cat > ~/.config/op/service-account-token << 'EOF'
<your-service-account-token>
EOF
chmod 600 ~/.config/op/service-account-token
```

## Step 4: Update Cron Scripts

My restic backup runs daily at 2 AM via cron. Cron doesn't source `.bashrc`, so the backup script needs to load the token itself:

```bash
#!/bin/bash
# Load 1Password service account for non-interactive access
export OP_SERVICE_ACCOUNT_TOKEN="$(cat ~/.config/op/service-account-token)"
export RESTIC_PASSWORD="$(op read 'op://Automation/Backblaze B2/restic_password')"
export RESTIC_REPOSITORY="$(op read 'op://Automation/Backblaze B2/restic_repository')"
export B2_ACCOUNT_ID="$(op read 'op://Automation/Backblaze B2/account_id')"
export B2_ACCOUNT_KEY="$(op read 'op://Automation/Backblaze B2/account_key')"

restic backup "$HOME" --tag omarchy-fw13 --exclude-caches
```

No secrets in the script. If someone reads the file, they see 1Password URIs, not credentials.

## Step 5: Back Up the Token to Setec

I run [setec](https://github.com/tailscale/setec) on my Tailscale network — it's a secret management server from Tailscale that uses your tailnet for authentication. Any machine on my network can retrieve secrets without additional credentials.

Storing the service account token in setec means I can provision new machines without manually copying tokens around:

```bash
# Store the token
TOKEN=$(cat ~/.config/op/service-account-token)
VALUE_B64=$(echo -n "$TOKEN" | base64 -w0)
curl -s -X POST https://setec.my-tailnet.ts.net/api/put \
  -H 'Content-Type: application/json' \
  -H 'Sec-X-Tailscale-No-Browsers: setec' \
  -d "{\"Name\": \"op/service-account-token\", \"Value\": \"$VALUE_B64\"}"

# Retrieve it on a new machine
curl -s -X POST https://setec.my-tailnet.ts.net/api/get \
  -H 'Content-Type: application/json' \
  -H 'Sec-X-Tailscale-No-Browsers: setec' \
  -d '{"Name": "op/service-account-token"}' | \
  python3 -c "import sys,json,base64; print(base64.b64decode(json.load(sys.stdin)['Value']).decode(), end='')" \
  > ~/.config/op/service-account-token
chmod 600 ~/.config/op/service-account-token
```

Setec authenticates via Tailscale identity — if you're on the tailnet, you can access secrets based on ACL rules. No API keys needed to access the secret store itself.

## Step 6: Automate Provisioning

I use [pyinfra](https://pyinfra.com/) to provision my machines (Arch Linux desktops and a MacBook). Adding the 1Password setup as a provisioning task means new machines get the token automatically:

```python
"""1Password service account setup for non-interactive secret access."""
from pyinfra import host
from pyinfra.operations import files, server

home = host.data.get("home_dir", f"/home/{host.data.user}")
setec_server = host.data.get("setec_server", "https://setec.my-tailnet.ts.net")

# Ensure directory exists with correct permissions
files.directory(
    name="Ensure ~/.config/op exists",
    path=f"{home}/.config/op",
    user=host.data.user,
    mode="700",
    present=True,
)

# Pull token from setec and deploy locally
server.shell(
    name="Deploy 1Password service account token from setec",
    commands=[
        f"test -s {home}/.config/op/service-account-token || "
        f"curl -sf -X POST {setec_server}/api/get "
        f"-H 'Content-Type: application/json' "
        f"-H 'Sec-X-Tailscale-No-Browsers: setec' "
        f"-d '{{\"Name\": \"op/service-account-token\"}}' | "
        f"python3 -c \"import sys,json,base64; "
        f"print(base64.b64decode(json.load(sys.stdin)['Value']).decode(), end='')\" "
        f"> {home}/.config/op/service-account-token && "
        f"chmod 600 {home}/.config/op/service-account-token"
    ],
)
```

Run `pyinfra inventory/ deploy.py` and every machine in my fleet gets the token from setec, with chezmoi handling the rest of the dotfiles.

## How It All Fits Together

```text
┌──────────────┐     ┌──────────────┐     ┌─────────────────┐
│  New Machine │────▶│   Setec      │────▶│  1Password      │
│  (pyinfra)   │     │  (Tailscale) │     │  Automation     │
│              │     │              │     │  Vault          │
│  Gets token  │     │  Stores      │     │                 │
│  from setec  │     │  service     │     │  B2 creds       │
│              │     │  account     │     │  Restic password │
│  chezmoi     │     │  token       │     │  Other secrets  │
│  deploys     │     │              │     │                 │
│  dotfiles    │     └──────────────┘     └─────────────────┘
└──────────────┘
        │
        ▼
┌──────────────┐
│  ~/.bashrc   │
│  op read ... │──── shells get secrets at startup
│              │
│  cron script │
│  op read ... │──── backups get secrets at runtime
└──────────────┘
```

## Trade-offs

**Shell startup is slightly slower.** Four `op read` calls add about 1-2 seconds to opening a new terminal. I don't open terminals frequently enough for this to bother me, but if it did, I could lazy-load the exports or use `op run` only when invoking restic.

**You need network access.** If 1Password's servers are unreachable, `op read` fails and those environment variables won't be set. In practice, this hasn't been an issue.

**The service account token is still a secret on disk.** It's protected by file permissions (`600`) and only accessible to my user. If someone has local access as my user, they already have my SSH keys and browser sessions — the 1Password token isn't meaningfully expanding the attack surface.

## What I'd Do Differently

If I were starting fresh, I'd skip putting secrets in `.bashrc` entirely and use `op run` to inject environment variables only when needed:

```bash
alias restic='op run --env-file=~/.config/restic/env -- restic'
```

With an env file containing 1Password references instead of values. This avoids the shell startup delay and keeps secrets out of the process environment entirely. But the current approach works, and the migration from hardcoded values was straightforward.

## Key Takeaways

- **Chezmoi's secret scanner is doing you a favor.** Don't bypass it — fix the underlying problem.
- **1Password service accounts** are the right tool for scripts and cron jobs. Don't try to use the desktop agent non-interactively.
- **Set `OP_SERVICE_ACCOUNT_TOKEN` before any `op read` calls.** This is the #1 gotcha.
- **Use a dedicated vault for automation.** Keep script-accessible secrets separate from your personal passwords.
- **Back up your service account token** somewhere your machines can reach it. Setec on Tailscale works great for this, but any secret store your fleet can access will do.
- **Automate the setup.** If you're managing more than one machine, provisioning tools like pyinfra turn a manual process into a repeatable one.
