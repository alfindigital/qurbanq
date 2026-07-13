import { test, expect, type Page } from "@playwright/test";

/**
 * Memastikan tag <link rel="canonical"> dan <meta property="og:url">
 * terisi benar dan self-reference untuk setiap route, sehingga preview
 * saat dibagikan (WhatsApp, Twitter, LinkedIn, dsb.) tidak ambigu.
 *
 * Kontrak:
 * - Setiap route punya tepat 1 <link rel="canonical"> yang menunjuk
 *   ke URL route tersebut (bukan homepage).
 * - og:url terakhir di <head> (yang menang untuk crawler JS) sama
 *   dengan canonical route.
 * - twitter:card = "summary_large_image" pada semua route.
 * - Konten og:title/og:description dan twitter:title/twitter:description
 *   yang efektif (tag terakhir di head) identik pasangannya - tidak
 *   ada mismatch antara Open Graph dan Twitter Card.
 */

const BASE = "http://localhost:8080";
const SITE = "https://qurban-q.lovable.app";

const ROUTES: Array<{ path: string; label: string }> = [
  { path: "/", label: "Beranda" },
  { path: "/kalkulator", label: "Kalkulator" },
  { path: "/tabungan", label: "Tabungan" },
  { path: "/edukasi", label: "Edukasi" },
  { path: "/pengingat", label: "Pengingat" },
];

async function lastContent(page: Page, selector: string): Promise<string | null> {
  const loc = page.locator(`head >> ${selector}`);
  const n = await loc.count();
  if (n === 0) return null;
  return await loc.nth(n - 1).getAttribute("content");
}

async function lastHref(page: Page, selector: string): Promise<string | null> {
  const loc = page.locator(`head >> ${selector}`);
  const n = await loc.count();
  if (n === 0) return null;
  return await loc.nth(n - 1).getAttribute("href");
}

test.describe("Canonical & social URL metadata", () => {
  for (const { path, label } of ROUTES) {
    test(`${label} (${path}) - canonical & og:url self-reference route`, async ({ page }) => {
      await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
      const expectedUrl = `${SITE}${path}`;

      // Canonical wajib ada, tepat 1x, dan menunjuk ke route ini.
      const canonicalLocs = page.locator('head >> link[rel="canonical"]');
      const canonicalCount = await canonicalLocs.count();
      expect(canonicalCount, `canonical harus tepat 1x di ${path}, ditemukan ${canonicalCount}`).toBe(1);
      const canonical = await canonicalLocs.first().getAttribute("href");
      expect(canonical, `canonical di ${path} harus self-reference`).toBe(expectedUrl);

      // og:url terakhir di head (yang menang) harus sama dengan canonical.
      const effectiveOgUrl = await lastContent(page, 'meta[property="og:url"]');
      expect(effectiveOgUrl, `og:url efektif di ${path} harus = canonical`).toBe(expectedUrl);

      // twitter:card konsisten
      const card = await lastContent(page, 'meta[name="twitter:card"]');
      expect(card, `twitter:card di ${path}`).toBe("summary_large_image");

      // og:title == twitter:title, og:description == twitter:description (tag efektif)
      const ogTitle = await lastContent(page, 'meta[property="og:title"]');
      const twTitle = await lastContent(page, 'meta[name="twitter:title"]');
      expect(ogTitle, `og:title kosong di ${path}`).toBeTruthy();
      expect(twTitle, `og:title & twitter:title harus sama di ${path}`).toBe(ogTitle);

      const ogDesc = await lastContent(page, 'meta[property="og:description"]');
      const twDesc = await lastContent(page, 'meta[name="twitter:description"]');
      expect(ogDesc, `og:description kosong di ${path}`).toBeTruthy();
      expect(twDesc, `og:description & twitter:description harus sama di ${path}`).toBe(ogDesc);

      // <title> dokumen dan og:title efektif harus sama (konsisten branding).
      const docTitle = await page.title();
      expect(ogTitle, `og:title efektif harus = <title> di ${path}`).toBe(docTitle);
    });
  }

  test("index.html source tidak memiliki <link rel=canonical> (dikelola Helmet per-route)", async ({ request }) => {
    const res = await request.get(`${BASE}/`);
    const html = await res.text();
    const canonicalMatches = html.match(/<link[^>]+rel=["']canonical["']/gi) ?? [];
    expect(
      canonicalMatches.length,
      "canonical tidak boleh diset statis di index.html - harus dari Helmet agar per-route benar"
    ).toBe(0);
  });

  test("kalkulator canonical berbeda dari beranda (bukan homepage yang ter-atribut)", async ({ page }) => {
    await page.goto(`${BASE}/kalkulator`, { waitUntil: "networkidle" });
    const canonical = await page.locator('head >> link[rel="canonical"]').first().getAttribute("href");
    expect(canonical).toBe(`${SITE}/kalkulator`);
    expect(canonical).not.toBe(`${SITE}/`);
  });
});
