import { test, expect } from "@playwright/test";

/**
 * Memastikan sitemap.xml saat diakses langsung:
 * - Merespon status 200
 * - Content-Type XML yang valid (application/xml atau text/xml)
 * - Body adalah XML yang valid dengan namespace sitemap 0.9
 * - Tidak mengandung duplikasi URL pada <loc>
 */

const BASE = "http://localhost:8080";

test.describe("sitemap.xml direct access: status, content-type, no duplicates", () => {
  test("merespon 200 dengan Content-Type XML yang valid", async ({ request }) => {
    const res = await request.get(`${BASE}/sitemap.xml`);
    expect(res.status(), "sitemap.xml harus 200").toBe(200);

    const ct = (res.headers()["content-type"] ?? "").toLowerCase();
    expect(
      ct,
      `content-type sitemap harus application/xml atau text/xml, dapat "${ct}"`,
    ).toMatch(/^(application|text)\/xml(\s*;.*)?$/);
  });

  test("body adalah XML valid dengan namespace sitemap 0.9", async ({ request }) => {
    const res = await request.get(`${BASE}/sitemap.xml`);
    expect(res.status()).toBe(200);

    const body = (await res.text()).trim();
    expect(body.length, "sitemap tidak boleh kosong").toBeGreaterThan(0);
    expect(body, "harus diawali deklarasi XML").toMatch(/^<\?xml\s+version=["']1\.0["']/i);
    expect(body, "harus memakai namespace sitemap 0.9").toContain(
      'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    );
    expect(body, "harus punya <urlset>").toMatch(/<urlset[\s>]/);
    expect(body, "harus menutup </urlset>").toContain("</urlset>");
  });

  test("tidak mengandung duplikasi URL pada <loc>", async ({ request }) => {
    const res = await request.get(`${BASE}/sitemap.xml`);
    expect(res.status()).toBe(200);
    const body = await res.text();

    const locs = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
    expect(locs.length, "sitemap harus memuat minimal 1 <loc>").toBeGreaterThan(0);

    // Cari URL yang muncul lebih dari sekali (jika ada) untuk pesan error yang informatif
    const counts = new Map<string, number>();
    for (const url of locs) counts.set(url, (counts.get(url) ?? 0) + 1);
    const dupes = [...counts.entries()].filter(([, n]) => n > 1);

    expect(
      dupes,
      `sitemap tidak boleh memuat URL duplikat, ditemukan: ${JSON.stringify(dupes)}`,
    ).toEqual([]);

    // Sanity check tambahan: jumlah unik == jumlah total
    expect(new Set(locs).size, "jumlah <loc> unik harus = total <loc>").toBe(locs.length);
  });

  test("akses langsung berulang tetap 200 & konsisten (tidak berubah antar request)", async ({ request }) => {
    const bodies: string[] = [];
    for (let i = 0; i < 3; i++) {
      const res = await request.get(`${BASE}/sitemap.xml`);
      expect(res.status(), `request ke-${i} harus 200`).toBe(200);
      bodies.push((await res.text()).trim());
    }
    // Semua body harus identik (sitemap statis, tidak boleh flap)
    expect(bodies[1], "body request 2 = request 1").toBe(bodies[0]);
    expect(bodies[2], "body request 3 = request 1").toBe(bodies[0]);
  });
});
