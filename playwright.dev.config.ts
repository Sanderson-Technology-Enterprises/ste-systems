import { defineConfig, devices } from "@playwright/test";

const devPort = process.env.PLAYWRIGHT_DEV_PORT?.trim() || "4176";
const devBaseUrl = `http://127.0.0.1:${devPort}/`;

export default defineConfig({
  testDir: "./tests/dev-browser",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  timeout: 120_000,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: devBaseUrl,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "turbopack-chromium",
      use: {
        ...devices["Desktop Chrome"],
        ...(!process.env.CI ? { channel: "chrome" } : {}),
        viewport: { width: 1440, height: 1000 },
      },
    },
  ],
  webServer: process.env.PLAYWRIGHT_EXTERNAL_DEV_SERVER
    ? undefined
    : {
        command: `node node_modules/next/dist/bin/next dev --turbopack --hostname 127.0.0.1 --port ${devPort}`,
        env: {
          NEXT_DIST_DIR: ".qa/next-dev-hydration",
        },
        url: devBaseUrl,
        reuseExistingServer: false,
        timeout: 180_000,
      },
});
