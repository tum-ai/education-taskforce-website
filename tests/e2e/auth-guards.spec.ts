import { expect, test } from "@playwright/test";

test("login page renders shared username and password fields", async ({ page }) => {
  await page.goto("/login?u=family-one");

  await expect(page.getByLabel("Username")).toHaveValue("family-one");
  await expect(page.getByLabel("Password")).toBeVisible();
});

test("anonymous portal visitors are redirected to login", async ({ page }) => {
  await page.goto("/portal");

  await expect(page).toHaveURL(/\/login\?next=%2Fportal/);
});

test("anonymous admin visitors are redirected to login", async ({ page }) => {
  await page.goto("/admin");

  await expect(page).toHaveURL(/\/login\?next=%2Fadmin/);
});
