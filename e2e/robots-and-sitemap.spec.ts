import { test, expect } from "@playwright/test";

/**
 * Memastikan robots.txt dan sitemap.xml diserve dengan benar sehingga
 * crawler dapat menemukan route utama, termasuk / dan /kalkulator.
 *
 * Kontrak:
 * robots.txt:
 * - Status 200, content-type text/plain.
 * - Ada blok User-agent: * dengan Allow: / (situs indexable).
 * - Tidak ada Disallow: / global (yang akan memblokir semua crawler).
 * - Ada direktif Sitemap: yang menunjuk ke sitemap.xml domain project.
 * - Blok User-agent untuk Googlebot, Bingbot, Twitterbot, facebookexternalhit
 *   tidak memblokir situs.
 *
 * sitemap.xml:
 * - Status 200, content-type XML.
 * - Merupakan <urlset> valid dengan namespace sitemap 0.9.
 * - Berisi <loc> untuk https://qurban-q.lovable.app/ dan .../kalkulator
 *   (dan route publik lain: /tabungan, /edukasi, /pengingat).
 * - Tidak berisi route internal (*, /not-found, /lovable/*).
 * - Semua <loc> adalah URL absolut https tanpa duplikat.
 *
 * Konsistensi silang:
 * - URL sitemap yang dideklarasikan di robots.txt = URL sitemap.xml
 *   yang benar-benar tersedia.
 * - Setiap route di sitemap dapat diakses di dev (200 via SPA fallback).
 */

const BASE = "http://localhost:8080";
const SITE = "https://qurban-q.lovable.app";

const EXPECTED_ROUTES = ["/", "/kalkulator", "/tabungan", "/edukasi", "/pengingat"] as const;

test.describe("robots.txt", () => {
  test("diserve dengan benar dan tidak memblokir crawler", async ({ request }) => {
    const res = await request.get(`${BASE}/robots.txt`);
    expect(res.status(), "robots.txt harus 200").toBe(200);

    const ct = res.headers()["content-type"] ?? "";
    expect(ct.toLowerCase()).toContain("text/plain");

    const body = await res.text();
    expect(body.trim().length, "robots.txt tidak boleh kosong").toBeGreaterThan(0);

    // Wajib ada blok User-agent: * dengan Allow: /
    // (Allow bisa berada di baris manapun dalam blok tsb.)
    expect(body).toMatch(/User-agent:\s*\*/i);
    expect(body, "harus mengizinkan crawling root").toMatch(/Allow:\s*\//i);

    // Tidak boleh ada Disallow: / global (memblokir seluruh situs)
    const globalDisallow = /User-agent:\s*\*[\s\S]*?Disallow:\s*\/\s*(\n|$)/i.test(body);
    expect(globalDisallow, "tidak boleh Disallow: / global untuk User-agent: *").toBe(false);

    // Direktif Sitemap wajib ada dan menunjuk ke domain project
    const sitemapMatch = body.match(/^Sitemap:\s*(\S+)\s*$/im);
    expect(sitemapMatch, "harus ada direktif Sitemap:").toBeTruthy();
    expect(sitemapMatch![1]).toBe(`${SITE}/sitemap.xml`);

    // Crawler penting tidak diblokir (kalau blocknya ada, harus Allow: /)
    for (const ua of ["Googlebot", "Bingbot", "Twitterbot", "facebookexternalhit"]) {
      const blockRe = new RegExp(`User-agent:\\s*${ua}[\\s\\S]*?(?=\\n\\s*\\n|$)`, "i");
      const m = body.match(blockRe);
      if (m) {
        expect(m[0], `${ua} tidak boleh Disallow: /`).not.toMatch(/Disallow:\s*\/\s*(\n|$)/);
      }
    }
  });
});

test.describe("sitemap.xml", () => {
  test("berisi urlset valid dengan semua route publik (termasuk / dan /kalkulator)", async ({ request }) => {
    const res = await request.get(`${BASE}/sitemap.xml`);
    expect(res.status(), "sitemap.xml harus 200").toBe(200);

    const ct = res.headers()["content-type"] ?? "";
    expect(ct.toLowerCase()).toMatch(/xml/);

    const body = await res.text();
    expect(body).toContain("<?xml");
    expect(body).toMatch(/<urlset[^>]+xmlns=["']http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9["']/);
    expect(body).toContain("</urlset>");

    const locs = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
    expect(locs.length, "sitemap harus punya minimal 1 <loc>").toBeGreaterThan(0);

    // Semua <loc> adalah URL absolut https
    for (const loc of locs) {
      expect(loc, `<loc> harus absolut https: ${loc}`).toMatch(/^https:\/\/[^\s]+$/);
    }

    // Tidak ada duplikat
    const uniq = new Set(locs);
    expect(uniq.size, "sitemap tidak boleh duplikat <loc>").toBe(locs.length);

    // Setiap route publik harus tercantum
    for (const route of EXPECTED_ROUTES) {
      expect(locs, `sitemap harus memuat ${route}`).toContain(`${SITE}${route}`);
    }

    // Route internal / not-found tidak boleh ada
    for (const forbidden of ["/not-found", "/lovable", "*"]) {
      expect(
        locs.some((l) => l.includes(forbidden)),
        `sitemap tidak boleh berisi route internal: ${forbidden}`,
      ).toBe(false);
    }
  });

  test("URL sitemap di robots.txt konsisten dengan sitemap.xml yang tersedia", async ({ request }) => {
    const robots = await (await request.get(`${BASE}/robots.txt`)).text();
    const declared = robots.match(/^Sitemap:\s*(\S+)\s*$/im)?.[1];
    expect(declared, "robots.txt harus mendeklarasikan Sitemap:").toBeTruthy();

    // Path dari URL yang dideklarasikan harus dapat diakses secara lokal
    const path = new URL(declared!).pathname;
    const res = await request.get(`${BASE}${path}`);
    expect(res.status(), `${path} (dari robots.txt) harus 200`).toBe(200);
    const body = await res.text();
    expect(body).toContain("<urlset");
  });

  test("setiap route di sitemap dapat diakses (SPA fallback 200)", async ({ request }) => {
    for (const route of EXPECTED_ROUTES) {
      const res = await request.get(`${BASE}${route}`);
      expect(res.status(), `${route} harus 200 via SPA fallback`).toBe(200);
      const html = await res.text();
      expect(html, `${route} harus HTML dengan #root`).toContain('id="root"');
    }
  });
});
