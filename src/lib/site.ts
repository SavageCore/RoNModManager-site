/**
 * Shared project links and base-aware URL helpers. The site deploys under
 * the /RoNModManager-site base, so internal links must respect it.
 */

export const SITE_ORIGIN = "https://savagecore.github.io";
export const SITE_BASE = "/RoNModManager-site";
export const SITE_URL = `${SITE_ORIGIN}${SITE_BASE}/`;

export const APP_REPO = "https://github.com/SavageCore/RoNModManager";
export const APP_RELEASES = `${APP_REPO}/releases`;
export const AUR_PACKAGE =
  "https://aur.archlinux.org/packages/ronmodmanager-bin";
export const FLATPAK_REMOTE = "https://savagecore.github.io/RoNModManager/";

/** Prefix a site-relative path with the deployment base. */
export function withBase(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_BASE}${clean}`;
}
