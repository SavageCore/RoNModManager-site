// Fetches public releases from GitHub, selects the newest complete stable
// release via src/lib/releases.ts and atomically writes src/data/release.json.
//
// Uses GITHUB_TOKEN when present (CI) and falls back to unauthenticated
// requests locally. The token never appears in output or in the written JSON.
// Any failure exits non-zero so a deploy can never publish guessed URLs.

import { mkdir, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { selectReleaseSnapshot } from "../src/lib/releases.ts";

const OWNER = "SavageCore";
const REPO = "RoNModManager";
const PER_PAGE = 100;
const MAX_PAGES = 5;
const REQUEST_TIMEOUT_MS = 15000;

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outPath = join(root, "src", "data", "release.json");

async function fetchReleasesPage(page) {
  const url =
    `https://api.github.com/repos/${OWNER}/${REPO}/releases` +
    `?per_page=${PER_PAGE}&page=${page}`;
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "RoNModManager-site-build",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  const response = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`GitHub API returned ${response.status} for ${url}`);
  }
  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error(`Unexpected GitHub API response for ${url}`);
  }
  const hasNext = (response.headers.get("link") ?? "").includes('rel="next"');
  return {
    releases: data.map((r) => ({
      tag_name: r.tag_name,
      draft: r.draft === true,
      prerelease: r.prerelease === true,
      published_at: typeof r.published_at === "string" ? r.published_at : null,
      assets: Array.isArray(r.assets)
        ? r.assets.map((a) => ({
            name: a.name,
            size: a.size,
            browser_download_url: a.browser_download_url,
          }))
        : [],
    })),
    hasNext,
  };
}

const releases = [];
for (let page = 1; page <= MAX_PAGES; page += 1) {
  const { releases: batch, hasNext } = await fetchReleasesPage(page);
  releases.push(...batch);
  const snapshot = selectReleaseSnapshot(releases);
  if (snapshot) {
    const payload = { ...snapshot, fetchedAt: new Date().toISOString() };
    await mkdir(dirname(outPath), { recursive: true });
    const tmpPath = `${outPath}.${process.pid}.tmp`;
    await writeFile(tmpPath, `${JSON.stringify(payload, null, 2)}\n`);
    await rename(tmpPath, outPath);
    console.log(`Release metadata: selected ${snapshot.tag} -> ${outPath}`);
    process.exit(0);
  }
  if (!hasNext || batch.length === 0) break;
}

console.error(
  `No complete stable release found after scanning ${releases.length} release(s). ` +
    "Refusing to write release metadata.",
);
process.exit(1);
