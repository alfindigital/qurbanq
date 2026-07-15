import { test, expect, type Page } from "@playwright/test";

/**
 * Memastikan sitemap.xml memuat route penting (Beranda & Kalkulator)
 * dan setiap <loc> di sitemap konsisten dengan <link rel="canonical">
 * yang dirender route tersebut (self-reference, bukan homepage).
 *
 * Ini menutup celah dimana sitemap dan canonical bisa "menunjuk ke
 * tempat berbeda" - yang membuat crawler mengatribusikan halaman ke
 * URL yang salah.
 */

const BASE = "http://localhost:8080";
const SITE = "https://qurban-q.lovable.app";

// Route yang HARUS ada di sitemap. Beranda & Kalkulator adalah yang
// paling penting untuk request ini; sisanya di-cek juga karena sudah
// bagian dari sitemap saat ini.
const REQUIRED_ROUTES = ["/", "/kalkulator"] as const;
const SECONDARY_ROUTES = ["/tabungan", "/edukasi", "/pengingat"] as const;
const ALL_PUBLIC_ROUTES = ["/", "/kalkulator", ...SECONDARY_ROUTES] as const;

async function readSitemapLocs(page: Page): Promise<string[]> {
  const res = await page.request.get(`${BASE}/sitemap.xml`);
  expect(res.status(), "sitemap.xml harus 200").toBe(200);
  const body = await res.text();
  return [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

async function readCanonical(page: Page, route: string): Promise<string> {
  await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
  const locs = page.locator('head >> link[rel="canonical"]');
  const n = await locs.count();
  expect(n, `canonical harus tepat 1 di ${route}`).toBe(1);
  const href = await locs.first().getAttribute("href");
  expect(href, `canonical harus terisi di ${route}`).toBeTruthy();
  return href!;
}

test.describe("sitemap.xml x canonical consistency", () => {
  test("sitemap memuat Beranda dan Kalkulator sebagai URL absolut https", async ({ page }) => {
    const locs = await readSitemapLocs(page);

    for (const route of REQUIRED_ROUTES) {
      const expected = `${SITE}${route}`;
      expect(locs, `sitemap harus memuat ${route}`).toContain(expected);
      expect(expected).toMatch(/^https:\/\/[^\s]+$/);
    }
  });

  test("semua route publik tercantum di sitemap tanpa duplikat", async ({ page }) => {
    const locs = await readSitemapLocs(page);
    expect(new Set(locs).size, "sitemap tidak boleh duplikat").toBe(locs.length);

    for (const route of ALL_PUBLIC_ROUTES) {
      expect(locs, `sitemap harus memuat ${route}`).toContain(`${SITE}${route}`);
    }
  });

  test("setiap <loc> di sitemap = canonical route tersebut (self-reference)", async ({ page }) => {
    const locs = await readSitemapLocs(page);
    const locSet = new Set(locs);

    for (const route of ALL_PUBLIC_ROUTES) {
      const expected = `${SITE}${route}`;
      expect(locSet.has(expected), `sitemap memuat ${expected}`).toBe(true);

      const canonical = await readCanonical(page, route);
      expect(
        canonical,
        `canonical ${route} harus = <loc> sitemap yang sama (bukan homepage)`,
      ).toBe(expected);
    }
  });

  test("Kalkulator: sitemap loc, canonical, dan URL browser semua konsisten & bukan homepage", async ({ page }) => {
    const locs = await readSitemapLocs(page);
    const kalkLoc = locs.find((l) => l === `${SITE}/kalkulator`);
    expect(kalkLoc, "sitemap harus memuat /kalkulator eksplisit").toBeTruthy();

    const canonical = await readCanonical(page, "/kalkulator");
    expect(canonical).toBe(kalkLoc);
    expect(canonical).not.toBe(`${SITE}/`);

    // URL yang dirender di browser (path) juga harus /kalkulator
    expect(new URL(page.url()).pathname).toBe("/kalkulator");
  });

  test("sitemap tidak berisi route internal (*, /not-found, /lovable)", async ({ page }) => {
    const locs = await readSitemapLocs(page);
    for (const forbidden of ["*", "/not-found", "/lovable"]) {
      expect(
        locs.some((l) => l.includes(forbidden)),
        `sitemap tidak boleh memuat ${forbidden}`,
      ).toBe(false);
    }
  });

  // Verifikasi eksplisit untuk route sekunder: /tabungan, /edukasi, /pengingat.
  // Setiap route harus (a) hadir di sitemap sebagai URL absolut https,
  // dan (b) canonical yang dirender halaman itu sama persis dengan <loc>-nya.
  for (const route of SECONDARY_ROUTES) {
    test(`${route} ada di sitemap dan canonical-nya sama persis`, async ({ page }) => {
      const expected = `${SITE}${route}`;

      const locs = await readSitemapLocs(page);
      expect(locs, `sitemap harus memuat ${route}`).toContain(expected);
      expect(expected, `${route} di sitemap harus URL absolut https`).toMatch(/^https:\/\/[^\s]+$/);

      const canonical = await readCanonical(page, route);
      expect(canonical, `canonical ${route} harus = <loc> sitemap`).toBe(expected);
      expect(canonical, `canonical ${route} tidak boleh = homepage`).not.toBe(`${SITE}/`);
      expect(new URL(page.url()).pathname, `pathname browser ${route}`).toBe(route);
    });
  }

  test("route sekunder (/tabungan, /edukasi, /pengingat) semua hadir tanpa duplikat", async ({ page }) => {
    const locs = await readSitemapLocs(page);
    for (const route of SECONDARY_ROUTES) {
      const expected = `${SITE}${route}`;
      const occurrences = locs.filter((l) => l === expected).length;
      expect(occurrences, `${route} harus muncul tepat 1x di sitemap`).toBe(1);
    }
  });
});
