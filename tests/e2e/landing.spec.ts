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
