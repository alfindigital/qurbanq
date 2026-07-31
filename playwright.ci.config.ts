import { defineConfig, devices } from "@playwright/test";
import { onboardingDismissedState } from "./e2e/storage-state";

/**
 * Konfigurasi Playwright khusus CI (GitHub Actions).
 * Berdiri sendiri (tanpa preset internal Lovable) supaya bisa jalan di runner:
 * build app -> serve via `vite preview` -> jalankan spec.
 */
const PORT = 4173;
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: true,
  retries: 1,
  workers: 2,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    // Lewati modal onboarding supaya klik navigasi tidak terhalang overlay.
    storageState: onboardingDismissedState,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npx vite preview --port ${PORT} --strictPort`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
