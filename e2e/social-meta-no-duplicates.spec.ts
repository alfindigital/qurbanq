import { test, expect } from "@playwright/test";

/**
 * Regression guard: memastikan tidak ada tag og:* dan twitter:* yang muncul
 * lebih dari sekali di <head> pada setiap rute publik.
 *
 * Duplikat bisa terjadi bila tag statis di index.html tumpang tindih dengan
 * tag yang diinject oleh react-helmet-async per-route. Helmet dedupe hanya
 * atas tag yang ia kelola sendiri, sehingga tag statis yang lupa dihapus
 * akan menghasilkan dua tag dengan property/name yang sama.
 */

const BASE = "http://localhost:8080";

const ROUTES = ["/", "/kalkulator", "/tabungan", "/edukasi", "/pengingat"] as const;

// Semua kunci og:* dan twitter:* yang mungkin muncul di project ini.
// og:image sengaja multi-size (1200x630 + 600x315), jadi dicek terpisah:
// URL-nya harus unik, bukan maksimal 1. twitter:image tetap tunggal.
const OG_PROPERTIES = [
  "og:title",
  "og:description",
  "og:url",
  "og:type",
  "og:site_name",
  "og:locale",
] as const;

const TWITTER_NAMES = [
  "twitter:card",
  "twitter:title",
  "twitter:description",
  "twitter:image",
] as const;

test.describe("Tidak ada duplikat tag og:* dan twitter:* per rute publik", () => {
  for (const path of ROUTES) {
    test(`${path} - setiap tag og:* dan twitter:* muncul maksimal 1x`, async ({ page }) => {
      await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });

      for (const prop of OG_PROPERTIES) {
        const count = await page
          .locator(`head >> meta[property="${prop}"]`)
          .count();
        expect(
          count,
          `meta[property="${prop}"] di ${path} tidak boleh dobel (ditemukan ${count})`,
        ).toBeLessThanOrEqual(1);
      }

      for (const name of TWITTER_NAMES) {
        const count = await page
          .locator(`head >> meta[name="${name}"]`)
          .count();
        expect(
          count,
          `meta[name="${name}"] di ${path} tidak boleh dobel (ditemukan ${count})`,
        ).toBeLessThanOrEqual(1);
      }

      // og:image multi-size: 2 varian dengan URL unik (bukan duplikat).
      const ogImages = page.locator('head >> meta[property="og:image"]');
      const ogImageCount = await ogImages.count();
      expect(ogImageCount, `og:image di ${path} harus 2 varian ukuran`).toBe(2);
      const urls = await ogImages.evaluateAll((els) =>
        els.map((el) => el.getAttribute("content") ?? ""),
      );
      expect(new Set(urls).size, `URL og:image di ${path} tidak boleh duplikat`).toBe(urls.length);

      // description dan canonical juga rentan duplikasi dengan pola yang sama.
      const descCount = await page.locator('head >> meta[name="description"]').count();
      expect(
        descCount,
        `meta[name="description"] di ${path} harus tepat 1 (ditemukan ${descCount})`,
      ).toBe(1);

      const canonicalCount = await page.locator('head >> link[rel="canonical"]').count();
      expect(
        canonicalCount,
        `link[rel="canonical"] di ${path} harus tepat 1 (ditemukan ${canonicalCount})`,
      ).toBe(1);
    });
  }
});
