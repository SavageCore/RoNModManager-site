---
title: Troubleshooting
description: Fixes for common RoN Mod Manager problems on Windows and Linux.
---

Fixes for problems users hit most often. Everything below is verified against
the released app; if your problem is not here, report it on
[GitHub](https://github.com/SavageCore/RoNModManager/issues) with your app
version, OS and the steps to reproduce.

## The app window is blank or flickers on Linux

Some GPU and driver combinations misbehave with hardware-accelerated web
views. Launch with software rendering:

```bash
WEBKIT_DISABLE_DMABUF_RENDERER=1 LIBGL_ALWAYS_SOFTWARE=1 ronmodmanager
```

If that fixes it, keep those variables in your launcher or shell profile.

## Mods stay linked after the game exits (Flatpak)

Link-on-launch mode detects when the game exits so mods can be unlinked and
the game folder returned to stock. It needs permission to talk to
`org.freedesktop.Flatpak`. Grant it with:

```bash
flatpak override --user --talk-name=org.freedesktop.Flatpak uk.savagecore.ronmodmanager
```

See [Install with
Flatpak](/RoNModManager-site/docs/installation/flatpak/) for details.

## Flatpak reports nothing to update

If you installed from a local dev build, Origin points at the build
tree instead of the release remote. See the local dev build caveat in
[Install with Flatpak](/RoNModManager-site/docs/installation/flatpak/) to
switch back.

## Nexus download needs a manual click

Free Nexus accounts download through the browser: the app opens the file page
and detects the file once it lands in your Downloads folder. A premium account
skips this with direct downloads. See [mod
sources](/RoNModManager-site/docs/mod-sources/).

## An API key stops working

Tokens expire or get revoked. Regenerate the key on mod.io or Nexus Mods and
paste the new value into the app settings. Never post keys in issue reports.
See [mod sources](/RoNModManager-site/docs/mod-sources/).

## A modpack URL fails

Check the link points at the modpack root or `modpack.json` and that the host
serves both the manifest and the `mods/` directory. Ask the pack author to
re-export if files are missing. See [hosting
modpacks](/RoNModManager-site/docs/modpacks/hosting/).
