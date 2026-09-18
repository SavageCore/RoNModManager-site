/**
 * Pure release-metadata validation and asset matching for the downloads pages.
 *
 * Everything here is deterministic and network-free so it can be unit tested
 * with fixture data. Live GitHub fetching lives in scripts/fetch-release.mjs,
 * which imports this module and writes a single snapshot to
 * src/data/release.json at build time.
 *
 * Only erasable TypeScript syntax is used (interfaces and type annotations,
 * no enums or namespaces) so the build script can import this file directly
 * under Node type stripping.
 */

export type PayloadKind =
  | "windows-setup"
  | "linux-appimage"
  | "linux-deb"
  | "linux-rpm"
  | "flatpak"
  | "userscript";

/** Desktop installer payloads that must all be present for a release to count. */
export const DESKTOP_PAYLOADS: readonly PayloadKind[] = [
  "windows-setup",
  "linux-appimage",
  "linux-deb",
  "linux-rpm",
  "flatpak",
];

/** Every kind required for a release to be selected, including the userscript. */
export const REQUIRED_KINDS: readonly PayloadKind[] = [
  ...DESKTOP_PAYLOADS,
  "userscript",
];

export interface ReleaseAssetInput {
  name: string;
  size: number;
  browser_download_url: string;
}

export interface ReleaseInput {
  tag_name: string;
  draft: boolean;
  prerelease: boolean;
  published_at: string | null;
  assets: ReleaseAssetInput[];
}

export interface SnapshotAsset {
  name: string;
  size: number;
  url: string;
  arch: string;
}

export interface ReleaseSnapshot {
  tag: string;
  version: string;
  publishedAt: string | null;
  releaseUrl: string;
  assets: Record<PayloadKind, SnapshotAsset>;
}

const OWNER = "SavageCore";
const REPO = "RoNModManager";

/**
 * Classify a release asset filename. Returns null for signatures, the
 * updater JSON and anything we never offer as a download.
 */
export function matchAssetName(name: string): PayloadKind | null {
  if (typeof name !== "string") return null;
  const lower = name.toLowerCase();
  if (lower.endsWith(".sig")) return null;
  if (lower === "latest.json") return null;

  if (lower.endsWith(".user.js")) return "userscript";
  if (lower.endsWith(".flatpak")) return "flatpak";
  if (lower.endsWith(".appimage")) return "linux-appimage";
  if (lower.endsWith(".deb")) return "linux-deb";
  if (lower.endsWith(".rpm")) return "linux-rpm";
  if (lower.endsWith(".exe") && lower.includes("setup")) return "windows-setup";
  return null;
}

/** Normalise an architecture token from a filename; "unknown" when absent. */
export function normalizeArch(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("x86_64") || lower.includes("amd64")) return "x86_64";
  if (lower.includes("x64")) return "x64";
  if (lower.includes("arm64") || lower.includes("aarch64")) return "arm64";
  return "unknown";
}

/**
 * Accept only HTTPS release-download URLs that belong to this repository
 * and to the given tag, so assets can never be mixed across tags or hosts.
 */
export function isTrustedAssetUrl(url: string, tag: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:") return false;
  if (parsed.hostname.toLowerCase() !== "github.com") return false;
  const prefix = `/${OWNER}/${REPO}/releases/download/${tag}/`;
  return (
    parsed.pathname.startsWith(prefix) && parsed.pathname.length > prefix.length
  );
}

/**
 * Build a snapshot for one release, or null when it is a draft, a
 * prerelease, incomplete, ambiguous (two files claiming one slot) or carries
 * an untrusted URL. Null means "skip this release", never "guess".
 */
export function buildSnapshot(release: ReleaseInput): ReleaseSnapshot | null {
  if (!release || release.draft || release.prerelease) return null;
  const tag = release.tag_name;
  if (typeof tag !== "string" || tag.length === 0) return null;
  const version = tag.startsWith("v") ? tag.slice(1) : tag;
  if (version.length === 0) return null;
  if (!Array.isArray(release.assets)) return null;

  const matched = new Map<PayloadKind, SnapshotAsset>();
  for (const asset of release.assets) {
    if (!asset || typeof asset.name !== "string") return null;
    const kind = matchAssetName(asset.name);
    if (kind === null) continue;
    if (matched.has(kind)) return null;
    if (typeof asset.browser_download_url !== "string") return null;
    if (!isTrustedAssetUrl(asset.browser_download_url, tag)) return null;
    if (!Number.isFinite(asset.size) || asset.size <= 0) return null;
    matched.set(kind, {
      name: asset.name,
      size: asset.size,
      url: asset.browser_download_url,
      arch: normalizeArch(asset.name),
    });
  }

  for (const kind of REQUIRED_KINDS) {
    if (!matched.has(kind)) return null;
  }

  return {
    tag,
    version,
    publishedAt:
      typeof release.published_at === "string" ? release.published_at : null,
    releaseUrl: `https://github.com/${OWNER}/${REPO}/releases/tag/${tag}`,
    assets: Object.fromEntries(matched) as Record<PayloadKind, SnapshotAsset>,
  };
}

/**
 * Select the newest complete stable release. Input is expected newest-first
 * (GitHub API order); the first candidate that builds a snapshot wins.
 */
export function selectReleaseSnapshot(
  releases: ReleaseInput[],
): ReleaseSnapshot | null {
  if (!Array.isArray(releases)) return null;
  for (const release of releases) {
    const snapshot = buildSnapshot(release);
    if (snapshot !== null) return snapshot;
  }
  return null;
}
