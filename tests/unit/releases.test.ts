import { describe, expect, it } from "vitest";
import {
  buildSnapshot,
  isTrustedAssetUrl,
  matchAssetName,
  normalizeArch,
  selectReleaseSnapshot,
  type ReleaseInput,
} from "../../src/lib/releases";

const TAG = "v0.0.17";
const BASE = `https://github.com/SavageCore/RoNModManager/releases/download/${TAG}`;

function asset(name: string, size = 1000) {
  return { name, size, browser_download_url: `${BASE}/${name}` };
}

/** Shape mirrors the observed v0.0.17 release (fixture data, not live evidence). */
function v0017Release(): ReleaseInput {
  return {
    tag_name: TAG,
    draft: false,
    prerelease: false,
    published_at: "2026-09-17T04:53:27Z",
    assets: [
      asset("latest.json"),
      asset("ron-mod-manager-userscript.user.js", 27654),
      asset("RoN.Mod.Manager-0.0.17-1.x86_64.rpm", 15542386),
      asset("RoN.Mod.Manager-0.0.17-1.x86_64.rpm.sig", 428),
      asset("RoN.Mod.Manager_0.0.17_amd64.AppImage", 92113400),
      asset("RoN.Mod.Manager_0.0.17_amd64.AppImage.sig", 432),
      asset("RoN.Mod.Manager_0.0.17_amd64.deb", 15540714),
      asset("RoN.Mod.Manager_0.0.17_amd64.deb.sig", 424),
      asset("RoN.Mod.Manager_0.0.17_x64-setup.exe", 10236957),
      asset("RoN.Mod.Manager_0.0.17_x64-setup.exe.sig", 428),
      {
        name: "ronmodmanager.flatpak",
        size: 10732688,
        browser_download_url: `${BASE}/ronmodmanager.flatpak`,
      },
    ],
  };
}

describe("matchAssetName", () => {
  it("classifies v0.0.17-style installer names", () => {
    expect(matchAssetName("RoN.Mod.Manager_0.0.17_x64-setup.exe")).toBe(
      "windows-setup",
    );
    expect(matchAssetName("RoN.Mod.Manager_0.0.17_amd64.AppImage")).toBe(
      "linux-appimage",
    );
    expect(matchAssetName("RoN.Mod.Manager_0.0.17_amd64.deb")).toBe(
      "linux-deb",
    );
    expect(matchAssetName("RoN.Mod.Manager-0.0.17-1.x86_64.rpm")).toBe(
      "linux-rpm",
    );
    expect(matchAssetName("ronmodmanager.flatpak")).toBe("flatpak");
    expect(matchAssetName("ron-mod-manager-userscript.user.js")).toBe(
      "userscript",
    );
  });

  it("excludes signatures, updater JSON and unknown files", () => {
    expect(
      matchAssetName("RoN.Mod.Manager_0.0.17_x64-setup.exe.sig"),
    ).toBeNull();
    expect(matchAssetName("latest.json")).toBeNull();
    expect(matchAssetName("README.md")).toBeNull();
    expect(matchAssetName("RoN.Mod.Manager_0.0.17_amd64.deb.sig")).toBeNull();
  });
});

describe("normalizeArch", () => {
  it("normalises arches and falls back to unknown", () => {
    expect(normalizeArch("RoN.Mod.Manager-0.0.17-1.x86_64.rpm")).toBe("x86_64");
    expect(normalizeArch("RoN.Mod.Manager_0.0.17_amd64.deb")).toBe("x86_64");
    expect(normalizeArch("RoN.Mod.Manager_0.0.17_x64-setup.exe")).toBe("x64");
    expect(normalizeArch("ronmodmanager.flatpak")).toBe("unknown");
  });
});

describe("isTrustedAssetUrl", () => {
  it("accepts same-tag github release URLs and rejects the rest", () => {
    expect(isTrustedAssetUrl(`${BASE}/a.deb`, TAG)).toBe(true);
    expect(isTrustedAssetUrl(`${BASE}/a.deb`, "v0.0.16")).toBe(false);
    expect(
      isTrustedAssetUrl(
        "http://github.com/SavageCore/RoNModManager/releases/download/v0.0.17/a.deb",
        TAG,
      ),
    ).toBe(false);
    expect(
      isTrustedAssetUrl(
        "https://evil.example/SavageCore/RoNModManager/releases/download/v0.0.17/a.deb",
        TAG,
      ),
    ).toBe(false);
    expect(
      isTrustedAssetUrl(
        "https://github.com/Other/RoNModManager/releases/download/v0.0.17/a.deb",
        TAG,
      ),
    ).toBe(false);
    expect(isTrustedAssetUrl("not a url", TAG)).toBe(false);
  });
});

describe("buildSnapshot", () => {
  it("accepts a complete v0.0.17-style release", () => {
    const snapshot = buildSnapshot(v0017Release());
    expect(snapshot).not.toBeNull();
    expect(snapshot?.tag).toBe(TAG);
    expect(snapshot?.version).toBe("0.0.17");
    expect(Object.keys(snapshot?.assets ?? {}).sort()).toEqual(
      [
        "flatpak",
        "linux-appimage",
        "linux-deb",
        "linux-rpm",
        "userscript",
        "windows-setup",
      ].sort(),
    );
    expect(snapshot?.assets["linux-deb"].arch).toBe("x86_64");
    expect(snapshot?.assets["windows-setup"].url).toContain(TAG);
  });

  it("rejects drafts and prereleases", () => {
    expect(buildSnapshot({ ...v0017Release(), draft: true })).toBeNull();
    expect(buildSnapshot({ ...v0017Release(), prerelease: true })).toBeNull();
  });

  it("rejects releases missing any payload", () => {
    const release = v0017Release();
    release.assets = release.assets.filter((a) => !a.name.endsWith(".flatpak"));
    expect(buildSnapshot(release)).toBeNull();
  });

  it("rejects duplicate matches for one slot", () => {
    const release = v0017Release();
    release.assets = [...release.assets, asset("extra_0.0.17_amd64.deb", 1500)];
    expect(buildSnapshot(release)).toBeNull();
  });

  it("rejects hostile or cross-tag URLs", () => {
    const release = v0017Release();
    release.assets = release.assets.map((a) =>
      a.name.endsWith(".deb") && !a.name.endsWith(".sig")
        ? { ...a, browser_download_url: "https://evil.example/a.deb" }
        : a,
    );
    expect(buildSnapshot(release)).toBeNull();
  });
});

describe("selectReleaseSnapshot", () => {
  it("falls back to the newest complete release when latest is incomplete", () => {
    const incomplete = v0017Release();
    incomplete.tag_name = "v0.0.18";
    incomplete.assets = incomplete.assets.filter(
      (a) => !a.name.endsWith(".rpm") || a.name.endsWith(".sig"),
    );
    const fallback = selectReleaseSnapshot([incomplete, v0017Release()]);
    expect(fallback?.tag).toBe(TAG);
  });

  it("returns null when no release is complete", () => {
    expect(selectReleaseSnapshot([])).toBeNull();
    expect(
      selectReleaseSnapshot([{ ...v0017Release(), draft: true }]),
    ).toBeNull();
  });
});
