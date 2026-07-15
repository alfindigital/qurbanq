import { test, expect } from "@playwright/test";

/**
 * Mengambil semua URL <loc> dari sitemap.xml, lalu untuk setiap URL:
 * - Akses langsung dari origin dev (localhost) pada path yang sama
 * - Pastikan status akhir 200
 * - Pastikan tidak ada redirect berantai (chain kosong dengan maxRedirects=0
 *   → response awal HARUS 200, bukan 3xx)
 * - Pastikan Content-Type HTML (SPA fallback mengembalikan index.html)
 *
 * Kenapa origin dev, bukan domain produksi di <loc>? Test berjalan di
 * sandbox tanpa akses keluar yang dijamin. Yang ingin kami buktikan
 * adalah: "path yang diiklankan sitemap benar-benar dapat dijangkau
 * (200, tanpa hop redirect)" — kontrak SPA fallback Lovable menjamin
 * perilaku ini identik antara dev dan hosting.
 */

const BASE = "http://localhost:8080";
const SITE = "https://qurban-q.lovable.app";

test.describe("Sitemap URLs: 200 tanpa redirect chain", () => {
  test("setiap <loc> di sitemap dapat diakses (200) tanpa redirect", async ({ request }) => {
    const sitemapRes = await request.get(`${BASE}/sitemap.xml`);
    expect(sitemapRes.status(), "sitemap.xml harus 200").toBe(200);

    const body = await sitemapRes.text();
    const locs = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
    expect(locs.length, "sitemap harus memuat minimal 1 <loc>").toBeGreaterThan(0);

    // Semua <loc> harus URL absolut https pada domain project
    for (const loc of locs) {
      expect(loc, `<loc> harus absolut https: ${loc}`).toMatch(/^https:\/\/[^\s]+$/i);
      expect(loc.startsWith(`${SITE}/`) || loc === `${SITE}`, `<loc> harus pada domain project: ${loc}`)
        .toBe(true);
    }

    // Uji setiap URL: ambil path dan akses via origin dev dengan maxRedirects=0
    const failures: string[] = [];
    for (const loc of locs) {
      const path = new URL(loc).pathname || "/";
      const target = `${BASE}${path}`;

      let res;
      try {
        res = await request.get(target, { maxRedirects: 0 });
      } catch (err) {
        failures.push(`${path}: request error (${(err as Error).message})`);
        continue;
      }

      const status = res.status();
      // Deteksi redirect berantai: 3xx berarti server memaksa hop lagi
      if (status >= 300 && status < 400) {
        const loc2 = res.headers()["location"] ?? "(no Location)";
        failures.push(`${path}: redirect ${status} -> ${loc2} (harus 200 langsung, tanpa hop)`);
        continue;
      }
      if (status !== 200) {
        failures.push(`${path}: status ${status} (harus 200)`);
        continue;
      }

      const ct = (res.headers()["content-type"] ?? "").toLowerCase();
      if (!ct.includes("text/html")) {
        failures.push(`${path}: content-type "${ct}" (harus text/html)`);
        continue;
      }

      const html = await res.text();
      if (!/<div\s+id=["']root["']/i.test(html)) {
        failures.push(`${path}: body tidak berisi <div id="root"> (SPA shell tidak ter-serve)`);
      }
    }

    expect(
      failures,
      `URL sitemap yang gagal akses langsung:\n${failures.join("\n")}`,
    ).toEqual([]);
  });

  test("tidak ada <loc> yang berujung redirect (jejak Playwright redirectedFrom kosong)", async ({ page }) => {
    const sitemapRes = await page.request.get(`${BASE}/sitemap.xml`);
    const body = await sitemapRes.text();
    const paths = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)]
      .map((m) => new URL(m[1].trim()).pathname || "/");

    const redirected: string[] = [];
    for (const path of paths) {
      const resp = await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
      expect(resp, `respon harus ada untuk ${path}`).not.toBeNull();
      expect(resp!.status(), `status akhir ${path}`).toBe(200);

      // Playwright: request.redirectedFrom() != null → ada hop redirect sebelumnya
      if (resp!.request().redirectedFrom() !== null) {
        redirected.push(`${path} (final URL: ${page.url()})`);
      }

      // URL akhir di browser harus sama persis dengan path sitemap (bukan di-rewrite)
      expect(
        new URL(page.url()).pathname,
        `${path} tidak boleh di-redirect ke path lain`,
      ).toBe(path);
    }

    expect(
      redirected,
      `URL sitemap yang mengalami redirect chain:\n${redirected.join("\n")}`,
    ).toEqual([]);
  });
});
