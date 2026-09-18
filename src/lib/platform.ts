/**
 * Pure OS suggestion for the downloads chooser.
 *
 * Input is low-entropy browser hints only: navigator.userAgentData.platform,
 * userAgentData.mobile and a navigator.userAgent fallback. The result only
 * highlights one download card; every option stays visible and no download
 * ever starts automatically.
 */

export type PlatformSuggestion =
  "windows" | "linux" | "unsupported" | "unknown";

export interface PlatformHints {
  /** navigator.userAgentData.platform, e.g. "Windows", "macOS", "Linux". */
  clientHintPlatform?: string | null;
  /** navigator.userAgentData.mobile, true when the browser says mobile. */
  clientHintMobile?: boolean | null;
  /** navigator.userAgent fallback string. */
  userAgent?: string | null;
}

function clean(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

/** Order matters: check mobile/ChromeOS before broad Linux/Mac patterns. */
function suggestionFromUserAgent(ua: string): PlatformSuggestion | null {
  if (ua.includes("android")) return "unsupported";
  if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod")) {
    return "unsupported";
  }
  if (ua.includes("cros")) return "unsupported";
  if (ua.includes("windows")) return "windows";
  if (ua.includes("linux")) return "linux";
  if (ua.includes("mac os") || ua.includes("macintosh")) return "unsupported";
  return null;
}

function suggestionFromClientHint(
  platform: string,
  mobile: boolean | null,
): PlatformSuggestion | null {
  if (mobile === true) return "unsupported";
  if (platform === "windows") return "windows";
  if (platform === "linux" || platform === "chromeos") {
    // ChromeOS reports "ChromeOS" here; without a real Linux desktop we
    // claim no native support rather than guessing Crostini works.
    return platform === "linux" ? "linux" : "unsupported";
  }
  if (platform === "macos" || platform === "ios" || platform === "android") {
    return "unsupported";
  }
  return null;
}

export function suggestPlatform(hints: PlatformHints): PlatformSuggestion {
  const ua = clean(hints.userAgent);
  const platform = clean(hints.clientHintPlatform);
  const mobile = hints.clientHintMobile ?? null;

  const hintResult =
    platform.length > 0 ? suggestionFromClientHint(platform, mobile) : null;
  // An explicit mobile flag overrules a desktop-looking UA.
  if (mobile === true) return "unsupported";
  const uaResult = ua.length > 0 ? suggestionFromUserAgent(ua) : null;

  if (hintResult !== null && uaResult !== null) {
    // Contradictory signals (for example a "Windows" client hint with a
    // Linux UA string) resolve to the generic chooser, never a guess.
    return hintResult === uaResult ? hintResult : "unknown";
  }
  return hintResult ?? uaResult ?? "unknown";
}
