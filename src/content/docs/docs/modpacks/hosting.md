---
title: Hosting modpacks
description: Export a modpack, host it on your own web space and share it with one link.
---

Export your installed mods and collections as a self-hostable modpack, then
share one link so others install the same set through RoN Mod Manager.

Only share mods you have the right to redistribute. Many mod authors allow
sharing inside a pack but forbid re-uploading files elsewhere; check each
mod's permissions before you publish.

## Export a modpack

1. Open **Settings** and choose **Export Modpack**.
2. Fill in the modpack name, version, description and author in the export
   dialog.
3. Choose **Export**. The app writes a `modpack.json` manifest and a `mods/`
   directory of mod files to your `~/Downloads` folder by default.

## Host the files

Upload both to your web server or file host, keeping the structure:

```text
modpack-root/
  modpack.json   # The exported manifest
  mods/          # Directory containing all .pak mod files
```

- The manifest describes collections, mod subscriptions (mod.io, Nexus,
  manual) and metadata.
- The `mods/` directory holds the referenced mod files.
- To update the pack later, export again and re-upload both.

## Share the link

Give others the URL to the modpack root (for example
`https://example.com/modpack`) or directly to `modpack.json`. In the app they
paste it into the **modpack URL** field and choose **Start**. The app reads
the manifest, subscribes to mod.io and Nexus mods, and downloads and enables
the matching mods and collections.

Share only packs from people you trust. A modpack can enable arbitrary mod
files on your machine.

### One-click install link

Anyone with RoN Mod Manager installed can open your modpack directly via a
`ronmm://` URL:

```text
ronmm://modpack/https://example.com/modpack
```

The app resolves the base URL to `modpack.json` automatically. Share this link
in Discord, on a website or in a README; opening it prompts the user to sync
the modpack immediately.

## Updating from a pack

When the host publishes a new version, reopen the modpack panel: it detects
the configured URL has a newer version and offers an update that applies the
changes. See the panel's Update button and version comparison before you
confirm.

## Publishing over SFTP

The app supports syncing the most recently exported modpack to an SFTP
destination, pushing both `modpack.json` and the `mods/` directory without
manual uploading. Configure the host, path and credentials once, then sync.

SFTP always syncs whichever modpack was most recently exported. If you work
with multiple modpacks, confirm the destination path before each sync so you
do not overwrite the wrong remote directory.
