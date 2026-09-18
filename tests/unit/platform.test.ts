import { describe, expect, it } from "vitest";
import { suggestPlatform } from "../../src/lib/platform";

describe("suggestPlatform", () => {
  it("suggests Windows from Chromium hints", () => {
    expect(
      suggestPlatform({
        clientHintPlatform: "Windows",
        clientHintMobile: false,
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36",
      }),
    ).toBe("windows");
  });

  it("suggests Windows from a Firefox-style UA fallback", () => {
    expect(
      suggestPlatform({
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0",
      }),
    ).toBe("windows");
  });

  it("suggests Linux for generic desktop Linux hints", () => {
    expect(
      suggestPlatform({
        clientHintPlatform: "Linux",
        clientHintMobile: false,
        userAgent:
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36",
      }),
    ).toBe("linux");
  });

  it("treats Android (which contains Linux) as unsupported", () => {
    expect(
      suggestPlatform({
        clientHintPlatform: "Android",
        clientHintMobile: true,
        userAgent:
          "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/131.0 Mobile Safari/537.36",
      }),
    ).toBe("unsupported");
  });

  it("treats ChromeOS as unsupported", () => {
    expect(
      suggestPlatform({
        clientHintPlatform: "ChromeOS",
        clientHintMobile: false,
        userAgent:
          "Mozilla/5.0 (X11; CrOS x86_64 16002.0.0) AppleWebKit/537.36 Chrome/131.0 Safari/537.36",
      }),
    ).toBe("unsupported");
    expect(
      suggestPlatform({
        userAgent:
          "Mozilla/5.0 (X11; CrOS x86_64 16002.0.0) AppleWebKit/537.36 Chrome/131.0 Safari/537.36",
      }),
    ).toBe("unsupported");
  });

  it("treats macOS as unsupported", () => {
    expect(
      suggestPlatform({
        clientHintPlatform: "macOS",
        clientHintMobile: false,
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/131.0 Safari/537.36",
      }),
    ).toBe("unsupported");
  });

  it("treats iPhone and desktop-style iPad UAs as unsupported", () => {
    expect(
      suggestPlatform({
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1",
      }),
    ).toBe("unsupported");
    expect(
      suggestPlatform({
        clientHintPlatform: "macOS",
        clientHintMobile: false,
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1",
      }),
    ).toBe("unsupported");
  });

  it("returns unknown for empty hints", () => {
    expect(suggestPlatform({})).toBe("unknown");
    expect(suggestPlatform({ clientHintPlatform: " ", userAgent: " " })).toBe(
      "unknown",
    );
  });

  it("returns unknown for conflicting hints", () => {
    expect(
      suggestPlatform({
        clientHintPlatform: "Windows",
        clientHintMobile: false,
        userAgent:
          "Mozilla/5.0 (X11; Linux x86_64; rv:132.0) Gecko/20100101 Firefox/132.0",
      }),
    ).toBe("unknown");
  });

  it("lets an explicit mobile flag overrule a desktop-looking UA", () => {
    expect(
      suggestPlatform({
        clientHintMobile: true,
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36",
      }),
    ).toBe("unsupported");
  });

  it("returns unknown for unrecognised values that mention no OS", () => {
    expect(suggestPlatform({ userAgent: "curl/8.0" })).toBe("unknown");
    expect(suggestPlatform({ clientHintPlatform: "Fuchsia" })).toBe("unknown");
  });
});
