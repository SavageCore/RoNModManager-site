---
title: Install with Flatpak
description: Add the RoN Mod Manager Flatpak remote, install the app and keep it updated.
---

Flatpak gives a sandboxed install with automatic updates through GNOME
Software, Flatpost or `flatpak update`. The remote lives at
`https://savagecore.github.io/RoNModManager/`.

## Add the remote and install

Run these once:

```bash
# Import the signing key and add the remote (once)
curl -sL https://savagecore.github.io/RoNModManager/ronmodmanager-flatpak.gpg \
  -o /tmp/ronmodmanager-flatpak.gpg
flatpak remote-add --user \
  --gpg-import=/tmp/ronmodmanager-flatpak.gpg \
  ronmodmanager https://savagecore.github.io/RoNModManager/

# Install
flatpak install ronmodmanager uk.savagecore.ronmodmanager
```

## Update

```bash
flatpak update uk.savagecore.ronmodmanager
```

GNOME Software and Flatpost offer the same update graphically.

## Install from a bundle file

Alternatively, download `ronmodmanager.flatpak` from the
[downloads page](/RoNModManager-site/downloads/) and install it directly:

```bash
flatpak install --user --bundle ronmodmanager.flatpak
```

A bundle install does not add the update remote. Prefer the remote above so
updates arrive automatically.

## Permissions

The Flatpak build needs permission to talk to `org.freedesktop.Flatpak` for
spawning host commands. Link-on-launch mode uses this to detect when the game
exits, so mods can be unlinked and the game folder returned to stock. New
installs get this permission automatically.

If you installed before this permission was added, grant it manually, either
in Flatseal (enable Talk on `org.freedesktop.Flatpak` under Session Bus) or
via:

```bash
flatpak override --user --talk-name=org.freedesktop.Flatpak uk.savagecore.ronmodmanager
```

## Local dev build origin caveat

Local dev builds installed with `make flatpak` come from a local
`ronmodmanager-local` remote, which pins Origin to the build tree and opts out
of automatic updates (`flatpak update` will report nothing to do). Check with:

```bash
flatpak info uk.savagecore.ronmodmanager | grep Origin
```

To switch back to release updates:

```bash
make flatpak-install-remote
# or manually:
# flatpak uninstall --user -y uk.savagecore.ronmodmanager
# flatpak install --user -y ronmodmanager uk.savagecore.ronmodmanager
```

## After installing

Complete the setup wizard by linking mod.io, Nexus Mods or both. See
[getting started](/RoNModManager-site/docs/getting-started/).
