---
title: Browser userscript
description: Install the RoN Mod Manager userscript for one-click mod installs from the browser.
---

The optional userscript adds an **Install via RoN Mod Manager** button on
mod.io and Nexus Mods pages. Choosing it queues the install in the desktop
app without opening extra tabs.

## Prerequisite

Install the desktop app first from the
[downloads page](/RoNModManager-site/downloads/). The buttons hand off to the
app through `ronmm://` links, which do nothing on their own.

## Install the script

1. Install a userscript manager in your browser, such as Greasemonkey or
   Violentmonkey.
2. Download the script from the
   [downloads page](/RoNModManager-site/downloads/): the file is named
   `ron-mod-manager-userscript.user.js`.
3. Your manager should offer to install it. Confirm, then reload a mod page to
   see the new button.

## Updates

The script ships `@downloadURL` and `@updateURL` metadata, so most managers
check for a new copy automatically. If yours does not, download the script
again from the downloads page.

## If the button does nothing

Check the desktop app is installed and that your browser is allowed to open
`ronmm://` links. If the button never appears, confirm the userscript manager
is enabled for the mod site you are visiting.
