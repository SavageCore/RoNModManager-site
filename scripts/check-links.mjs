// Checks internal href/src targets in the built site (dist/). Respects the
// project base and trailing slashes, validates anchors against generated
// element IDs, and ignores external/protocol links. Exits non-zero on any
// missing page, asset or anchor.

import { readFile, readdir, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const BASE = "/RoNModManager-site";

const IGNORE_PROTOCOLS = new Set([
  "http:",
  "https:",
  "mailto:",
  "tel:",
  "ronmm:",
  "data:",
  "blob:",
]);

function stripBase(pathname) {
  if (pathname === BASE || pathname === `${BASE}/`) return "/";
  if (pathname.startsWith(`${BASE}/`)) return pathname.slice(BASE.length);
  return null;
}

async function collectHtml(dir, out = []) {
  for (const entry of await readdir(dir)) {
    const full = join(dir, entry);
    const info = await stat(full);
    if (info.isDirectory()) await collectHtml(full, out);
    else if (entry.endsWith(".html")) out.push(full);
  }
  return out;
}

function extractTargets(html) {
  const targets = [];
  const attrRe = /(?:href|src)="([^"]*)"/g;
  let match;
  while ((match = attrRe.exec(html)) !== null) {
    const raw = match[1].trim();
    if (!raw || raw.startsWith("#")) {
      targets.push({
        raw,
        page: null,
        anchor: raw.startsWith("#") ? raw.slice(1) : null,
      });
      continue;
    }
    let url;
    try {
      url = new URL(raw, "https://example.invalid/");
    } catch {
      continue;
    }
    if (IGNORE_PROTOCOLS.has(url.protocol)) continue;
    targets.push({
      raw,
      page: url.pathname,
      anchor: url.hash ? decodeURIComponent(url.hash.slice(1)) : null,
    });
  }
  return targets;
}

function extractIds(html) {
  const ids = new Set();
  const idRe = / id="([^"]+)"/g;
  let match;
  while ((match = idRe.exec(html)) !== null) ids.add(match[1]);
  return ids;
}

async function pageExists(pagePath) {
  const candidates = [
    join(dist, pagePath, "index.html"),
    join(dist, `${pagePath.replace(/\/$/, "")}.html`),
  ];
  if (pagePath === "/") candidates.unshift(join(dist, "index.html"));
  for (const candidate of candidates) {
    try {
      const info = await stat(candidate);
      if (info.isFile()) return candidate;
    } catch {
      // try next candidate
    }
  }
  return null;
}

async function assetExists(pagePath) {
  const relative = pagePath.startsWith("/") ? pagePath.slice(1) : pagePath;
  const full = resolve(dist, relative);
  if (!full.startsWith(dist)) return false;
  try {
    return (await stat(full)).isFile();
  } catch {
    return false;
  }
}

const files = await collectHtml(dist);
const idCache = new Map();
let failures = 0;

for (const file of files) {
  const html = await readFile(file, "utf8");
  const display = file.slice(dist.length);
  for (const { raw, page, anchor } of extractTargets(html)) {
    if (page === null) {
      // Same-page anchor.
      if (anchor) {
        const ids = extractIds(html);
        if (!ids.has(anchor)) {
          console.error(`${display}: missing anchor #${anchor}`);
          failures += 1;
        }
      }
      continue;
    }
    const internal = stripBase(page);
    if (internal === null) {
      console.error(`${display}: link ${raw} escapes the ${BASE} base`);
      failures += 1;
      continue;
    }
    // Heuristic: paths with a file extension are assets, the rest are pages.
    const last = internal.split("/").pop() ?? "";
    const isAsset = last.includes(".");
    if (isAsset) {
      if (!(await assetExists(internal))) {
        console.error(`${display}: missing asset ${raw}`);
        failures += 1;
      }
      continue;
    }
    const targetFile = await pageExists(internal);
    if (!targetFile) {
      console.error(`${display}: missing page ${raw}`);
      failures += 1;
      continue;
    }
    if (anchor) {
      let ids = idCache.get(targetFile);
      if (!ids) {
        ids = extractIds(await readFile(targetFile, "utf8"));
        idCache.set(targetFile, ids);
      }
      if (!ids.has(anchor)) {
        console.error(`${display}: missing anchor #${anchor} in ${raw}`);
        failures += 1;
      }
    }
  }
}

if (failures > 0) {
  console.error(
    `check-links: ${failures} failure(s) in ${files.length} page(s)`,
  );
  process.exit(1);
}
console.log(`check-links: OK (${files.length} pages)`);
