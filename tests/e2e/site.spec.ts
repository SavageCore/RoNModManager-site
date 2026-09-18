import { test, expect } from "@playwright/test";

// All URLs are base-aware: the site serves under /RoNModManager-site/.

test("homepage links to docs and downloads", async ({ page }) => {
  await page.goto("./");
  await expect(
    page.getByRole("heading", {
      name: "Your mods. Your squad. Ready to deploy.",
    }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: /getting started/i })
    .first()
    .click();
  await expect(page).toHaveURL(/\/docs\/getting-started\/$/);
});

test("hosting route loads directly", async ({ page }) => {
  await page.goto("./docs/modpacks/hosting/");
  await expect(
    page.getByRole("heading", { name: "Hosting modpacks" }).first(),
  ).toBeVisible();
  await expect(page.locator("main").getByText("SFTP").first()).toBeVisible();
});

test("downloads work without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("./downloads/");
  const cards = page.locator("[data-card]");
  await expect(cards).toHaveCount(5);
  for (const card of await cards.all()) {
    await expect(card).toBeVisible();
    const link = card.getByRole("link", { name: /^download/i });
    await expect(link).toBeVisible();
    const href = await link.getAttribute("href");
    expect(href).toMatch(/^https:\/\/github\.com\/SavageCore\/RoNModManager\//);
  }
  await context.close();
});

test("no download starts automatically", async ({ page }) => {
  const downloads: string[] = [];
  page.on("download", (download) => downloads.push(download.url()));
  await page.goto("./downloads/");
  await page.waitForTimeout(1500);
  expect(downloads).toEqual([]);
});

test("manual platform controls filter cards", async ({ page }) => {
  await page.goto("./downloads/");
  await page.getByRole("button", { name: "Linux" }).click();
  await expect(page.locator('[data-card="windows"]')).toBeHidden();
  await expect(page.locator('[data-card="linux-deb"]')).toBeVisible();
  await page.getByRole("button", { name: "All" }).click();
  await expect(page.locator('[data-card="windows"]')).toBeVisible();
});

test("mobile menu and keyboard focus work", async ({ page }) => {
  await page.goto("./");
  await page.keyboard.press("Tab");
  const focused = page.locator(":focus");
  await expect(focused).toBeVisible();
});

test("narrow viewport has no horizontal overflow", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 360, height: 800 },
  });
  const page = await context.newPage();
  for (const route of ["./", "./downloads/", "./docs/modpacks/hosting/"]) {
    await page.goto(route);
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  }
  await context.close();
});

test("reduced motion disables transitions", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");
  const transition = await page.evaluate(() =>
    getComputedStyle(document.body).getPropertyValue("transition-duration"),
  );
  expect(["0s", "0.01ms", ""]).toContain(transition.trim());
});
