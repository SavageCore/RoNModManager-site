---
title: Install on Linux
description: Install RoN Mod Manager on Linux with a native package, AppImage, AUR or Flatpak.
---

All Linux downloads are x86_64 builds. Pick one install method and stick with
it, so updates come from a single place.

## Native packages

- **Debian, Ubuntu and derivatives:** download the `.deb` from the
  [downloads page](/RoNModManager-site/downloads/) and install it with your
  package manager.
- **Fedora, openSUSE and derivatives:** download the `.rpm` instead.
- **Arch:** install
  [ronmodmanager-bin](https://aur.archlinux.org/packages/ronmodmanager-bin)
  from the AUR with your usual AUR helper.

Native packages integrate with your desktop and update through your system or
AUR helper.

## AppImage

Download the `.AppImage` from the
[downloads page](/RoNModManager-site/downloads/), make it executable and run
it. It works on most distributions without installation:

```bash
chmod +x RoN.Mod.Manager_*.AppImage
./RoN.Mod.Manager_*.AppImage
```

Check for new AppImage files on the downloads page when you want to update.

## Flatpak

For a sandboxed install with automatic updates, use the Flatpak remote. See
[Install with Flatpak](/RoNModManager-site/docs/installation/flatpak/).

## After installing

Complete the setup wizard by linking mod.io, Nexus Mods or both. See
[getting started](/RoNModManager-site/docs/getting-started/) for the
walkthrough.
