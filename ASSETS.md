# Website asset sources and licences

## Fonts

- Rajdhani (headings), weights 600 and 700, latin subset, via
  `@fontsource/rajdhani`. Licence: SIL Open Font License 1.1 (see
  `node_modules/@fontsource/rajdhani/LICENSE.md`). Self-hosted, no webfont CDN.
- Body text uses the system sans-serif stack, so no additional font download.

## Icons

- Windows mark and Tux penguin on the downloads filter pills are inline SVG
  paths from Simple Icons (https://simpleicons.org), which releases its icon
  data under CC0 1.0 Universal. No icon package dependency; the paths are
  inlined in `src/components/DownloadChooser.astro` and inherit
  `currentColor`. If they need updating, fetch fresh paths from the
  `simple-icons` npm package or CDN.

## Screenshots

Copies of released-app screenshots from the app repository
(`docs/screenshots/dark/`), same project, same licence (MIT):

- `src/assets/screenshots/mods-dark.png` (1280x840)
- `src/assets/screenshots/collections-dark.png` (1280x840)
- `src/assets/screenshots/profiles-dark.png` (1280x840)

Copies are cropped to the 1280x840 app window: `make screenshots` in the app
repo captures at 1280x840 then adds a 40px border for README display
(`take-screenshots.mjs` adds `-border 40`), producing 1360x920 files. When
refreshing, strip exactly 40px from each edge before saving here.

Do not hotlink the app repository's `main` branch images; update these copies
when the app UI changes materially.

## Social preview

`public/social-preview.png` is a copy of the mods screenshot. Replace with
original artwork before launch if a dedicated preview image is produced.

## Branding

No third-party logos, game art, trailers or videos are used. The wordmark is
plain text. This is an unofficial community project, not affiliated with or
endorsed by VOID Interactive.
