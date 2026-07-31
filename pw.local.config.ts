import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: 0,
  workers: 4,
  reporter: [["line"]],
  use: { baseURL: "http://localhost:8080" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
