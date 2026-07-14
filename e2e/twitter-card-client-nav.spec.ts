import { test, expect, type Page } from "@playwright/test";

/**
 * Memastikan <meta name="twitter:card"> tetap:
 * - Tepat 1 tag di <head> (tidak duplikat)
 * - Bernilai "summary_large_image"
 * Selama navigasi client-side (tanpa hard reload) antara / dan /kalkulator.
 *
 * Navigasi menggunakan klik pada <a href="..."> agar benar-benar
 * ditangani oleh BrowserRouter (client-side), bukan full page load.
 */

const BASE = "http://localhost:8080";

async function assertTwitterCard(page: Page, route: string) {
  const loc = page.locator('head >> meta[name="twitter:card"]');
  const n = await loc.count();
  expect(n, `twitter:card harus tepat 1 di ${route}, ditemukan ${n}`).toBe(1);
  const value = await loc.first().getAttribute("content");
  expect(value, `twitter:card value di ${route}`).toBe("summary_large_image");
}

async function clientNavigate(page: Page, targetPath: "/" | "/kalkulator") {
  const link = page.locator(`a[href="${targetPath}"]`).first();
  await expect(link, `link ke ${targetPath} harus ada`).toBeVisible();
  await link.click();
  await page.waitForURL(`**${targetPath}`);
  // Tunggu Helmet menerapkan mutasi head untuk route baru
  await page.waitForFunction(
    (expected) => {
      const c = document.head.querySelector('link[rel="canonical"]');
      return c?.getAttribute("href")?.endsWith(expected) ?? false;
    },
    targetPath,
  );
}

test.describe("twitter:card konsisten saat client-side nav", () => {
  test("/ -> /kalkulator -> / menjaga twitter:card tunggal & benar", async ({ page }) => {
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await assertTwitterCard(page, "/");

    await clientNavigate(page, "/kalkulator");
    await assertTwitterCard(page, "/kalkulator");

    await clientNavigate(page, "/");
    await assertTwitterCard(page, "/ (kembali)");
  });

  test("/kalkulator -> / (mulai dari route dalam) tidak menggandakan twitter:card", async ({ page }) => {
    await page.goto(`${BASE}/kalkulator`, { waitUntil: "networkidle" });
    await assertTwitterCard(page, "/kalkulator");

    await clientNavigate(page, "/");
    await assertTwitterCard(page, "/");
  });

  test("bolak-balik cepat / <-> /kalkulator tidak menumpuk twitter:card", async ({ page }) => {
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });

    for (let i = 0; i < 3; i++) {
      await clientNavigate(page, "/kalkulator");
      await assertTwitterCard(page, `/kalkulator (iter ${i})`);
      await clientNavigate(page, "/");
      await assertTwitterCard(page, `/ (iter ${i})`);
    }
  });
});
