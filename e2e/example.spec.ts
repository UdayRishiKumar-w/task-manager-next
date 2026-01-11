import { expect, test } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("http://localhost:3000/");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Task Manager/);
});

test("get login", async ({ page }) => {
  await page.goto("http://localhost:3000/");

  // Click the login link.
  await page.getByRole("link", { name: "Log in" }).click();

  // Expects page to have a button with the name of Log in.
  await expect(page.getByRole("button", { name: "Log in" })).toBeVisible();
});
