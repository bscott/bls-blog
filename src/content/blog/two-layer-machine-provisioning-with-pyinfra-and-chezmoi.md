---
title: "Two-Layer Machine Provisioning with Pyinfra and Chezmoi"
description: "How I split machine setup into infrastructure provisioning and dotfile management, and why the separation makes everything easier"
pubDate: 2026-03-01
tags: ["automation", "pyinfra", "chezmoi", "dotfiles", "homelab"]
draft: false
---

I manage three machines: two Arch Linux desktops and a MacBook Pro. Every time I set up a new machine or rebuild one, the same question comes up: how much of this can I automate, and how do I keep them all in sync without losing the flexibility to customize each one?

I've landed on a two-layer approach that cleanly separates infrastructure (packages, services, system configuration) from user-facing dotfiles. The first layer is [Pyinfra](https://pyinfra.com/), a Python-based provisioning tool. The second is [chezmoi](https://www.chezmoi.io/), a dotfile manager with built-in templating. They complement each other well, and the boundary between them is natural.

## Why Two Tools Instead of One?

Provisioning tools like Ansible and Pyinfra are great at installing packages, enabling services, and running idempotent shell commands across machines. But they're clunky for managing dotfiles. You end up with a `files/` directory full of static configs, Jinja2 templates that fight with the config format they're generating, and a deploy step that overwrites files you might have edited locally.

Chezmoi is purpose-built for dotfiles. It understands file permissions, supports Go templates natively, integrates with password managers, and has a workflow for editing files in place and syncing changes back to the source repo. But it doesn't install packages or enable systemd services.

The two-layer approach gives each tool the job it's good at:

- **Pyinfra**: packages, services, git config, dev tool installs, and bootstrapping chezmoi itself
- **Chezmoi**: starship prompt, mise config, SSH config, editor settings, shell customizations

## The Infrastructure Layer: Pyinfra

The provisioning repo uses Pyinfra's inventory system to define machines and group data to handle OS differences.

### Project structure

```text
deploy.py              # Main entrypoint
local-deploy.sh        # Wrapper for local runs
group_data/
  all.py               # Shared: git config, mise tools, npm packages
  arch_desktops.py     # Arch: pacman/AUR packages, systemd services
  mac_laptops.py       # macOS: brew formulas/casks
tasks/
  git.py               # Git configuration
  shell.py             # Shell functions, atuin
  chezmoi.py           # Deploy chezmoi config, init, and apply
  dev_tools.py         # mise, go install, npm globals
  arch_packages.py     # pacman + yay
  mac_packages.py      # Homebrew
templates/
  chezmoi.toml.j2      # Bridge group_data into chezmoi variables
```

### How group data handles machine differences

Pyinfra loads variables from `group_data/` files that match the inventory filename. All machines get `all.py`, and then OS-specific files add their own:

```python
# group_data/all.py — shared across all machines
user = "bscott"
git_name = "Brian Scott"
chezmoi_dotfiles_repo = "git@github.com:bscott/dotfiles.git"
```

```python
# group_data/arch_desktops.py
home_dir = "/home/bscott"
os_type = "arch"
shell = "bash"
pacman_packages = ["chezmoi", "starship", "mise", "neovim", ...]
ssh_1password_agent = True
```

```python
# group_data/mac_laptops.py
home_dir = "/Users/bscott"
os_type = "macos"
shell = "zsh"
brew_packages = ["chezmoi", "starship", "mise", "neovim", ...]
```

### The chezmoi bootstrap task

The key piece that connects the two layers is `tasks/chezmoi.py`. It does three things:

1. Deploys `chezmoi.toml` from a Jinja2 template, bridging pyinfra's group data into chezmoi's template variable system
2. Initializes chezmoi from the dotfiles repo (guarded to skip if already initialized)
3. Runs `chezmoi apply --force` to deploy all managed dotfiles

```python
# tasks/chezmoi.py
files.template(
    name="Deploy chezmoi.toml",
    src="templates/chezmoi.toml.j2",
    dest=f"{home}/.config/chezmoi/chezmoi.toml",
)

server.shell(
    name="Initialize chezmoi from dotfiles repo",
    commands=[
        f'which chezmoi > /dev/null 2>&1 '
        f'&& [ ! -d "{home}/.local/share/chezmoi/.git" ] '
        f'&& chezmoi init {dotfiles_repo} || true',
    ],
)

server.shell(
    name="Apply chezmoi dotfiles",
    commands=[
        "which chezmoi > /dev/null 2>&1 && chezmoi apply --force || true",
    ],
)
```

The `chezmoi.toml.j2` template translates pyinfra variables into chezmoi's `[data]` section:

```toml
[data]
    os_type = "{{ host.data.get('os_type', 'arch') }}"
    shell = "{{ host.data.get('shell', 'bash') }}"
    git_name = "{{ host.data.get('git_name', 'Brian Scott') }}"
    ssh_1password_agent = {{ 'true' if host.data.get('ssh_1password_agent')
                             else 'false' }}
```

This is where the two layers shake hands. Pyinfra knows what kind of machine it's running on. Chezmoi needs that context to render templates correctly. The `chezmoi.toml` file is the contract between them.

## The Dotfile Layer: Chezmoi

The dotfiles repo uses chezmoi's source directory conventions. Files prefixed with `dot_` map to dotfiles in the home directory. Files ending in `.tmpl` are processed as Go templates. The `private_` prefix sets restrictive file permissions.

### OS-conditional starship config

The starship prompt config is a good example of how templating works. macOS gets a Catppuccin-themed powerline prompt with language version indicators. Arch gets a minimal cyan prompt focused on directory and git status.

```text
{{- if eq .chezmoi.os "darwin" -}}
# macOS: Catppuccin Mocha powerline
format = """
[](fg:color_bg1)\
$os$username$hostname\
[](fg:color_bg1 bg:color_bg2)\
$directory\
...
{{- else -}}
# Arch: minimal cyan
format = "$username$hostname$directory$git_branch$git_status$character"

[character]
success_symbol = "[❯](bold cyan)"
{{- end }}
```

Both configs live in one file (`dot_config/starship.toml.tmpl`), and chezmoi renders the right one based on the OS.

### SSH config with permission handling

SSH configs need 0600 permissions, and the `~/.ssh` directory needs 0700. Chezmoi handles this through filename conventions:

```text
private_dot_ssh/           → ~/.ssh/        (mode 0700)
  private_config.tmpl      → ~/.ssh/config  (mode 0600)
```

The template uses custom data from `chezmoi.toml` to conditionally include the 1Password SSH agent and OS-specific host definitions:

```text
{{- if .ssh_1password_agent }}
Host *
    IdentityAgent ~/.1password/agent.sock
{{ end -}}

{{- if eq .chezmoi.os "darwin" }}
Host github.com
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes
{{ end -}}
```

### OS-specific file exclusion

Some configs only make sense on certain operating systems. Hyprland and Waybar configs are meaningless on macOS. AeroSpace configs are meaningless on Linux. The `.chezmoiignore` file handles this:

```text
{{ if ne .chezmoi.os "linux" }}
.config/hypr
.config/waybar
{{ end }}
{{ if ne .chezmoi.os "darwin" }}
.config/aerospace
{{ end }}
```

## Running It

### Full provisioning (new machine or rebuild)

```bash
# Remote via SSH
pyinfra inventory/arch_desktops.py deploy.py --limit omarchy-gtr

# Local (current machine)
./local-deploy.sh -y
```

This installs all packages, configures git, sets up the shell, deploys `chezmoi.toml`, initializes chezmoi from the dotfiles repo, applies all dotfiles, installs dev tools, and configures Claude Code settings.

### Day-to-day dotfile changes

After the initial provisioning, dotfile edits happen through chezmoi directly:

```bash
# Edit a managed file
chezmoi edit ~/.config/starship.toml

# Or edit in place and sync back
vim ~/.config/starship.toml
chezmoi re-add

# Commit and push
cd ~/src/dotfiles
git add -A && git commit -m "Update starship config" && git push

# Pull changes on another machine
chezmoi update
```

### Verifying everything is in sync

```bash
chezmoi status    # Check for drift
chezmoi diff      # See what would change
chezmoi data      # Verify template variables
chezmoi managed   # List all managed files
```

## What Made This Work

A few decisions that kept things clean:

**One source of truth for machine identity.** Pyinfra's group data defines what each machine is (OS, shell, home directory, packages). Chezmoi's `chezmoi.toml` receives that identity through a template. No duplication.

**Clear ownership boundary.** If it's a package, service, or system-level tool, it belongs in pyinfra. If it's a config file in the home directory, it belongs in chezmoi. There's no overlap.

**Idempotent everything.** Both pyinfra and chezmoi are designed to be run repeatedly without side effects. Every shell command in pyinfra uses `||` guards to skip if the tool is already installed. Chezmoi diffs before applying and only writes files that have changed.

**Graceful degradation.** The chezmoi task checks for the binary before running. If chezmoi isn't installed yet (first run, packages haven't been applied), it skips cleanly and picks it up on the next run.

## What I'd Do Differently

If I were starting fresh, I'd put even more into chezmoi from the beginning. Git config, shell function files, and tmux configs are all good candidates. The less pyinfra has to manage in terms of individual config files, the cleaner both repos stay.

I'd also set up `chezmoi cd` as a shell alias from day one. Being able to jump into the source directory, make edits, and push without thinking about paths removes enough friction to make frequent small commits realistic.

The two-layer approach has held up well across three machines with two different operating systems. The provisioning repo stays focused on what to install, and the dotfiles repo stays focused on how to configure it. Neither repo needs to know much about the other, beyond the `chezmoi.toml` handoff.
