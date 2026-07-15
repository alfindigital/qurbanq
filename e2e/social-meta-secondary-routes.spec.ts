import { test, expect, type Page } from "@playwright/test";

/**
 * Memastikan untuk /tabungan, /edukasi, dan /pengingat:
 * - <meta property="og:url"> efektif = canonical route (self-reference)
 * - <meta name="twitter:card"> tepat 1 dan bernilai "summary_large_image"
 * - <meta property="og:site_name"> tepat 1 dan bernilai "Qurbanku"
 *   (konsisten branding sitewide, tidak berubah per-route)
 */

const BASE = "http://localhost:8080";
const SITE = "https://qurban-q.lovable.app";
const SITE_NAME = "Qurbanku";

const ROUTES = [
  { path: "/tabungan", label: "Tabungan" },
  { path: "/edukasi", label: "Edukasi" },
  { path: "/pengingat", label: "Pengingat" },
] as const;

async function lastContent(page: Page, selector: string): Promise<string | null> {
  const loc = page.locator(`head >> ${selector}`);
  const n = await loc.count();
  if (n === 0) return null;
  return await loc.nth(n - 1).getAttribute("content");
}

test.describe("og:url, twitter:card, og:site_name per route (Tabungan/Edukasi/Pengingat)", () => {
  for (const { path, label } of ROUTES) {
    test(`${label} (${path}) - og:url = canonical route`, async ({ page }) => {
      await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
      const expected = `${SITE}${path}`;

      const canonicalCount = await page.locator('head >> link[rel="canonical"]').count();
      expect(canonicalCount, `canonical tepat 1 di ${path}`).toBe(1);
      const canonical = await page
        .locator('head >> link[rel="canonical"]')
        .first()
        .getAttribute("href");
      expect(canonical, `canonical di ${path}`).toBe(expected);

      const ogUrl = await lastContent(page, 'meta[property="og:url"]');
      expect(ogUrl, `og:url efektif di ${path} harus = canonical`).toBe(expected);
    });

    test(`${label} (${path}) - twitter:card = summary_large_image dan tepat 1`, async ({ page }) => {
      await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });

      const cards = page.locator('head >> meta[name="twitter:card"]');
      const n = await cards.count();
      expect(n, `twitter:card harus tepat 1 di ${path}`).toBe(1);
      const value = await cards.first().getAttribute("content");
      expect(value, `twitter:card value di ${path}`).toBe("summary_large_image");
    });

    test(`${label} (${path}) - og:site_name = "${SITE_NAME}" dan tepat 1`, async ({ page }) => {
      await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });

      const siteName = page.locator('head >> meta[property="og:site_name"]');
      const n = await siteName.count();
      expect(n, `og:site_name harus tepat 1 di ${path}, ditemukan ${n}`).toBe(1);
      const value = await siteName.first().getAttribute("content");
      expect(value, `og:site_name value di ${path}`).toBe(SITE_NAME);
    });
  }

  test("og:site_name konsisten (nilai sama) di ketiga route sekunder", async ({ page }) => {
    const values: Array<{ path: string; value: string | null }> = [];
    for (const { path } of ROUTES) {
      await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
      values.push({ path, value: await lastContent(page, 'meta[property="og:site_name"]') });
    }
    for (const v of values) {
      expect(v.value, `og:site_name di ${v.path}`).toBe(SITE_NAME);
    }
  });
});
