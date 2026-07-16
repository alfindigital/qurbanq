import { test, expect } from "@playwright/test";

/**
 * Memverifikasi tag canonical URL dan meta robots pada halaman Beranda (/)
 * dan Kalkulator (/kalkulator).
 *
 * Kontrak:
 * - Canonical URL:
 *     * Beranda   -> https://qurban-q.lovable.app/
 *     * Kalkulator -> https://qurban-q.lovable.app/kalkulator
 *   Diinject oleh react-helmet-async setelah hydrate, jadi diuji lewat
 *   browser (bukan raw HTTP) agar Helmet sempat berjalan.
 * - Meta robots: server-rendered di index.html dengan content
 *   "index, follow" (crawler diizinkan mengindeks & mengikuti tautan).
 *   Diuji baik di HTML server maupun setelah hydrate.
 */

const BASE = "http://localhost:8080";
const SITE = "https://qurban-q.lovable.app";

const ROUTES: Array<{ path: string; canonical: string; label: string }> = [
  { path: "/", canonical: `${SITE}/`, label: "Beranda" },
  { path: "/kalkulator", canonical: `${SITE}/kalkulator`, label: "Kalkulator" },
];

test.describe("canonical URL & meta robots", () => {
  for (const { path, canonical, label } of ROUTES) {
    test(`${label} (${path}) memiliki canonical & meta robots yang benar`, async ({ page, request }) => {
      // 1) meta robots wajib ada di HTML server (agar crawler non-JS ikut membaca).
      const res = await request.get(`${BASE}${path}`, { maxRedirects: 0 });
      expect(res.status()).toBe(200);
      const html = await res.text();
      const robotsMatch = html.match(
        /<meta[^>]*name=["']robots["'][^>]*content=["']([^"']+)["'][^>]*>/i,
      );
      expect(robotsMatch, `${label}: <meta name="robots"> wajib ada di HTML server`).toBeTruthy();
      const robotsContent = robotsMatch![1].toLowerCase();
      expect(robotsContent, `${label}: robots harus mengizinkan index`).toContain("index");
      expect(robotsContent, `${label}: robots harus mengizinkan follow`).toContain("follow");
      expect(robotsContent, `${label}: robots tidak boleh noindex`).not.toContain("noindex");
      expect(robotsContent, `${label}: robots tidak boleh nofollow`).not.toContain("nofollow");

      // 2) Canonical diinject Helmet; buka via browser lalu tunggu href yang benar.
      await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
      await expect
        .poll(
          async () =>
            await page.evaluate(
              () => document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null,
            ),
          { message: `${label}: canonical harus di-set ke ${canonical}`, timeout: 5000 },
        )
        .toBe(canonical);

      // Pastikan hanya ada satu canonical yang aktif (hindari sinyal ganda).
      const canonicalCount = await page.locator('link[rel="canonical"]').count();
      expect(canonicalCount, `${label}: harus tepat 1 <link rel="canonical">`).toBe(1);

      // Meta robots tetap ada & valid setelah hydrate.
      const robotsAfterHydrate = await page.evaluate(
        () => document.querySelector('meta[name="robots"]')?.getAttribute("content") ?? null,
      );
      expect(robotsAfterHydrate, `${label}: meta robots hilang setelah hydrate`).toBeTruthy();
      expect(robotsAfterHydrate!.toLowerCase()).not.toContain("noindex");
    });
  }
});
