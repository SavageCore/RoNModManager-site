import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("homepage has no axe violations", async ({ page }) => {
  await page.goto("./");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("downloads page has no axe violations", async ({ page }) => {
  await page.goto("./downloads/");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("hosting docs page has no axe violations", async ({ page }) => {
  await page.goto("./docs/modpacks/hosting/");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("downloads show every option regardless of browser hints", async ({
  page,
}) => {
  await page.goto("./downloads/");
  await page.addInitScript(() => {
    Object.defineProperty(window.navigator, "userAgentData", {
      value: { platform: "macOS", mobile: false },
      configurable: true,
    });
    Object.defineProperty(window.navigator, "userAgent", {
      value:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/131.0 Safari/537.36",
      configurable: true,
    });
  });
  await page.reload();
  await expect(page.locator("[data-card]")).toHaveCount(5);
  await expect(page.locator('[data-card="windows"]')).toBeVisible();
  await expect(page.locator('[data-card="linux-deb"]')).toBeVisible();
});
