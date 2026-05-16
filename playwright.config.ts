import { defineConfig, devices } from "@playwright/test";

const port = process.env.E2E_PORT ?? "3000";
const baseURL = process.env.BASE_URL ?? `http://127.0.0.1:${port}`;
const shouldStartServer = process.env.PLAYWRIGHT_SKIP_WEB_SERVER !== "1";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { outputFolder: "playwright-report" }], ["list"]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 10000,
    navigationTimeout: 30000
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chrome", use: { ...devices["Pixel 5"] } }
  ],
  webServer: shouldStartServer
    ? {
        command: `corepack pnpm exec next dev --hostname 127.0.0.1 --port ${port}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120000
      }
    : undefined
});
