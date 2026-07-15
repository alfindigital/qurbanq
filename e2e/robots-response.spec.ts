import { test, expect } from "@playwright/test";

/**
 * Memverifikasi robots.txt ketika diakses langsung:
 * - status 200
 * - Content-Type text/plain
 * - body tidak kosong
 * - memuat aturan Sitemap: yang valid dan mengarah ke sitemap.xml
 */

const BASE = "http://localhost:8080";
const PROJECT_ORIGIN = "https://qurban-q.lovable.app";

test.describe("robots.txt: response dan konten sitemap", () => {
  test("robots.txt merespon 200 dengan Content-Type text/plain dan tidak kosong", async ({ request }) => {
    const res = await request.get(`${BASE}/robots.txt`);

    expect(res.status(), "robots.txt harus merespon 200").toBe(200);

    const contentType = (res.headers()["content-type"] ?? "").toLowerCase();
    expect(contentType, "Content-Type robots.txt harus text/plain").toContain("text/plain");

    const body = await res.text();
    expect(body.trim().length, "isi robots.txt tidak boleh kosong").toBeGreaterThan(0);
  });

  test("robots.txt memuat direktif Sitemap: yang valid ke sitemap.xml", async ({ request }) => {
    const res = await request.get(`${BASE}/robots.txt`);
    const body = await res.text();

    const sitemapUrls = [...body.matchAll(/^\s*[Ss]itemap\s*:\s*(\S+)\s*$/gm)].map((m) => m[1]);

    expect(sitemapUrls.length, "robots.txt harus memuat setidaknya 1 direktif Sitemap:").toBeGreaterThan(0);

    for (const url of sitemapUrls) {
      expect(url, "URL Sitemap harus absolut dan menggunakan https").toMatch(/^https:\/\/.+\.xml$/i);
      expect(url, "URL Sitemap harus mengarah ke sitemap.xml").toMatch(/\/sitemap\.xml$/i);
    }

    expect(sitemapUrls, "robots.txt harus merujuk ke sitemap.xml project").toContain(
      `${PROJECT_ORIGIN}/sitemap.xml`,
    );

    // Pastikan sitemap yang dirujuk dapat diakses langsung
    const sitemapRes = await request.get(`${BASE}/sitemap.xml`);
    expect(sitemapRes.status(), "sitemap.xml yang dirujuk harus dapat diakses (200)").toBe(200);
  });
});
