import { expect, test } from "@playwright/test";

test("sample data flow reaches workspace screens", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: /Start with sample/ }).click();
  await expect(page.getByRole("heading", { name: /職務経歴と求人票/ })).toBeVisible();

  await page.getByRole("button", { name: /Analyze/ }).click();
  await page.waitForURL(/\/workspace\/.+\/analyze/, { timeout: 15000 });
  await expect(page.getByText("Match Score")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Requirement Coverage" })).toBeVisible();

  await page.getByRole("navigation", { name: "Workspace navigation" }).getByRole("link", { name: "Plan", exact: true }).click();
  await expect(page.getByRole("heading", { name: "12週間の準備計画" })).toBeVisible();

  await page.getByRole("navigation", { name: "Workspace navigation" }).getByRole("link", { name: "Process Trace", exact: true }).click();
  await expect(page.getByRole("heading", { name: "AI pipeline の制御証跡" })).toBeVisible();
});
