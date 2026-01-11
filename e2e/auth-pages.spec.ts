import { expect, test } from "@playwright/test";

test("login page has form and log in button", async ({ page }) => {
  await page.goto("http://localhost:3000/login");
  await expect(page.getByRole("button", { name: "Log in" })).toBeVisible();
});
