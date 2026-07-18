import { test, expect } from "../playwright-fixture";

// Both pages persist to localStorage (see Kalkulator.tsx STORAGE_KEY and
// Tabungan.tsx TABUNGAN_KEY). A hard reload must NOT clear that state.
const nav = (page: import("@playwright/test").Page) =>
  page.getByRole("navigation", { name: "Navigasi utama" });

test("Kalkulator & Tabungan survive a hard reload", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  // ── Seed Kalkulator ────────────────────────────────────────────────
  await page.goto("/kalkulator");
  await page.getByRole("button", { name: "Sapi" }).click();
  await page.locator("button:has-text('Rp')").first().click();
  await page.getByPlaceholder("Nama peserta...").fill("Fatimah");
  await page.getByRole("button", { name: "Tambah peserta" }).click();
  await expect(page.getByText("Fatimah", { exact: false })).toBeVisible();

  // ── Seed Tabungan ──────────────────────────────────────────────────
  await page.goto("/tabungan");
  await page.locator('button[role="combobox"]').click();
  await page.locator('[role="option"]').first().click();
  await page.locator('input[type="number"]').nth(0).fill("11");
  await page.locator('input[type="number"]').nth(1).fill("750000");

  // ── Hard reload (bypass cache) ─────────────────────────────────────
  await page.reload({ waitUntil: "domcontentloaded" });

  // Tabungan retains its inputs after reload
  await expect(page.locator('input[type="number"]').nth(0)).toHaveValue("11");
  await expect(page.locator('input[type="number"]').nth(1)).toHaveValue("750000");

  // Navigate back via BottomNav → Kalkulator state still intact
  await nav(page).getByRole("link", { name: "Kalkulator qurban" }).click();
  await expect(page).toHaveURL(/\/kalkulator$/);
  await expect(page.getByText("Daftar Peserta")).toBeVisible();
  await expect(page.getByText("Fatimah", { exact: false })).toBeVisible();

  // Second hard reload on Kalkulator itself
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByText("Daftar Peserta")).toBeVisible();
  await expect(page.getByText("Fatimah", { exact: false })).toBeVisible();

  // And Tabungan is still intact when we come back
  await nav(page).getByRole("link", { name: "Rencana tabungan qurban" }).click();
  await expect(page.locator('input[type="number"]').nth(0)).toHaveValue("11");
  await expect(page.locator('input[type="number"]').nth(1)).toHaveValue("750000");
});
