import { test, expect } from "../playwright-fixture";

// Persistence relies on localStorage writes in Kalkulator.tsx & Tabungan.tsx.
const nav = (page: import("@playwright/test").Page) =>
  page.getByRole("navigation", { name: "Navigasi utama" });

test("Kalkulator & Tabungan state survives repeated BottomNav switches", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  // Seed Kalkulator: sapi + first animal + patungan + participant "Budi"
  await page.goto("/kalkulator");
  await page.getByRole("button", { name: "Sapi" }).click();
  await page.locator("button:has-text('Rp')").first().click();
  await page.getByRole("button", { name: /Patungan/i }).click();
  await page.getByPlaceholder("Nama peserta...").fill("Budi");
  await page.getByRole("button", { name: "Tambah peserta" }).click();
  await expect(page.getByText("Budi", { exact: false })).toBeVisible();

  // Seed Tabungan: pick animal, months=9, saved=500000
  await page.goto("/tabungan");
  await page.locator('button[role="combobox"]').click();
  await page.locator('[role="option"]').first().click();
  const months = page.locator('input[type="number"]').nth(0);
  const saved = page.locator('input[type="number"]').nth(1);
  await months.fill("9");
  await saved.fill("500000");

  // Bounce between menus multiple times
  for (let i = 0; i < 3; i++) {
    await nav(page).getByRole("link", { name: "Halaman utama Qurbanku" }).click();
    await expect(page).toHaveURL(/\/$/);
    await nav(page).getByRole("link", { name: "Materi edukasi qurban" }).click();
    await expect(page).toHaveURL(/\/edukasi$/);
    await nav(page).getByRole("link", { name: "Pengingat qurban" }).click();
    await expect(page).toHaveURL(/\/pengingat$/);
  }

  // Tabungan values retained
  await nav(page).getByRole("link", { name: "Rencana tabungan qurban" }).click();
  await expect(page.locator('input[type="number"]').nth(0)).toHaveValue("9");
  await expect(page.locator('input[type="number"]').nth(1)).toHaveValue("500000");

  // Kalkulator retained in patungan mode with participant
  await nav(page).getByRole("link", { name: "Kalkulator qurban" }).click();
  await expect(page.getByText("Peserta Patungan")).toBeVisible();
  await expect(page.getByText("Budi", { exact: false })).toBeVisible();
});
