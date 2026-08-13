import { existsSync, readdirSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

/**
 * Some CI images ship a preinstalled Chromium whose build number differs from the
 * one Playwright expects. When that binary exists, use it directly instead of
 * downloading (which is disabled in those images).
 */
function preinstalledChromium(): string | undefined {
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (!base || !existsSync(base)) return undefined;
  const dirs = readdirSync(base)
    .filter((d) => d.startsWith('chromium-'))
    .sort()
    .reverse();
  for (const d of dirs) {
    const candidate = `${base}/${d}/chrome-linux/chrome`;
    if (existsSync(candidate)) return candidate;
  }
  return undefined;
}

const chromiumExecutable = preinstalledChromium();

// E2E skeleton for Phase 0. Specs are added in later phases (onboarding → game → passport, etc.).
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        ...(chromiumExecutable ? { launchOptions: { executablePath: chromiumExecutable } } : {}),
      },
    },
    {
      name: 'mobile-safari',
      // Mobile viewport, but drive it with the available Chromium engine.
      use: {
        ...devices['iPhone 13'],
        ...(chromiumExecutable
          ? { defaultBrowserType: 'chromium', launchOptions: { executablePath: chromiumExecutable } }
          : {}),
      },
    },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
