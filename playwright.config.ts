import { defineConfig, devices } from "@playwright/test";

const browserPort = process.env.PLAYWRIGHT_TEST_PORT?.trim() || "4173";
const browserBaseUrl = `http://127.0.0.1:${browserPort}/ste-systems/`;

export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  timeout: 90_000,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: browserBaseUrl,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "desktop-chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 1000 },
      },
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 7"] },
    },
    {
      name: "desktop-firefox",
      grep: /@cross-engine/,
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "desktop-webkit",
      grep: /@cross-engine/,
      use: { ...devices["Desktop Safari"] },
    },
  ],
  webServer: {
    command: `npm run preview:prepare && node scripts/serve-preview.mjs .preview ${browserPort}`,
    url: browserBaseUrl,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
