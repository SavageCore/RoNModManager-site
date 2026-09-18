---
title: Mod sources
description: Link mod.io and Nexus Mods accounts and understand free versus premium downloads.
---

RoN Mod Manager installs mods from mod.io and Nexus Mods. Link one or both
accounts in the app; the website never asks for your keys.

## mod.io

1. Create an account at [mod.io](https://mod.io) if you do not have one.
2. Open [mod.io/me/access](https://mod.io/me/access) and copy your API access
   key.
3. On the tokens section of the same page, generate a personal access token
   (name it something like RoNModManager).
4. Paste both into the app setup wizard or settings. The app validates them
   before saving.

If a token expires, regenerate it on the same page and paste the new value
into the app.

## Nexus Mods

1. Create an account at [Nexus Mods](https://www.nexusmods.com) if you do not
   have one.
2. Open your [Nexus API settings](https://www.nexusmods.com/settings/api-keys)
   and generate a personal API key.
3. Paste it into the app setup wizard or settings.

A free Nexus account works: the app opens the file page in your browser and
detects the download once it lands in your Downloads folder. A premium account
skips the manual step with direct downloads.

## Keeping keys safe

Keys live in the app config on your machine. Never paste API keys or tokens
into this website, a screenshot, a modpack description or a chat message. If a
key leaks, revoke it on the source site and generate a new one.
