import { expect, test } from "@playwright/test";

test("public landing page shows login and five day preview", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "AI Edutainment" })).toBeVisible();
  await expect(page.getByRole("link", { name: /^Log in$/ }).first()).toBeVisible();
  await expect(page.getByText(/^Day \d$/)).toHaveCount(5);
});

test("mobile landing page has no horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(hasOverflow).toBe(false);
});

test("mobile public header keeps logos and controls separated", async ({ page }) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");

    const brand = page.getByRole("link", { name: "TUM.ai home" });
    const partnerLogo = page.getByRole("link", { name: "Schloss Elmau website" });
    const language = page.getByRole("button", { name: "English" });
    const login = page.getByRole("link", { name: /^Log in$/ }).first();

    await expect(brand).toBeVisible();
    await expect(partnerLogo).toBeVisible();
    await expect(language).toBeVisible();
    await expect(login).toBeVisible();

    const boxes = await Promise.all([
      brand.boundingBox(),
      partnerLogo.boundingBox(),
      language.boundingBox(),
      login.boundingBox(),
    ]);

    const [brandBox, partnerLogoBox, languageBox, loginBox] = boxes;
    expect(brandBox).not.toBeNull();
    expect(partnerLogoBox).not.toBeNull();
    expect(languageBox).not.toBeNull();
    expect(loginBox).not.toBeNull();

    const logo = partnerLogoBox!;
    const minimumGap = 8;
    expect(brandBox!.x + brandBox!.width + minimumGap).toBeLessThanOrEqual(logo.x);
    expect(logo.x + logo.width + minimumGap).toBeLessThanOrEqual(languageBox!.x);
    expect(loginBox!.x + loginBox!.width).toBeLessThanOrEqual(width);
  }
});
