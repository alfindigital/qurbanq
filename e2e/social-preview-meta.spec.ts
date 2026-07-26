import { test, expect } from "@playwright/test";

/**
 * Memastikan metadata social preview (og:image & twitter:image) tidak diset
 * secara manual di source, dan tidak ada duplikasi tag setelah hard reload.
 *
 * Kontrak:
 * - index.html memuat og:image multi-size (1200x630 + 600x315) sebagai fallback
 *   crawler non-JS, dan tepat satu twitter:image (varian 1200x630).
 * - twitter:card harus "summary_large_image".
 * - og:title, og:description, og:url, og:type, twitter:title, twitter:description
 *   masing-masing hadir tepat satu kali (tidak ada duplikasi).
 * - Setelah hard reload di browser, jumlah tag tetap sama (client-side tidak
 *   menambah duplikat).
 */

const BASE = "http://localhost:8080";

test.describe("Social preview metadata", () => {
  test("index.html memuat og:image multi-size dan satu twitter:image", async ({ request }) => {
    const res = await request.get(`${BASE}/`);
    const html = await res.text();

    const ogImageMatches = [
      ...html.matchAll(/<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["']/gi),
    ];
    const twImageMatches = [
      ...html.matchAll(/<meta[^>]+name=["']twitter:image["'][^>]*content=["']([^"']+)["']/gi),
    ];

    expect(ogImageMatches.length, "index.html harus punya 2 varian og:image").toBe(2);
    expect(twImageMatches.length, "index.html harus punya tepat 1 twitter:image").toBe(1);

    const ogUrls = ogImageMatches.map((m) => m[1]);
    expect(new Set(ogUrls).size, "URL og:image di index.html tidak boleh duplikat").toBe(2);
    expect(ogUrls[0]).toMatch(/og-image\.jpg$/);
    expect(ogUrls[1]).toMatch(/og-image-600x315\.jpg$/);

    // Deklarasi ukuran harus lengkap untuk kedua varian.
    const widths = [...html.matchAll(/property=["']og:image:width["'][^>]*content=["'](\d+)["']/gi)].map(
      (m) => Number(m[1]),
    );
    const heights = [...html.matchAll(/property=["']og:image:height["'][^>]*content=["'](\d+)["']/gi)].map(
      (m) => Number(m[1]),
    );
    expect(widths).toEqual([1200, 600]);
    expect(heights).toEqual([630, 315]);
  });

  test("twitter:card = summary_large_image dan tag preview tidak duplikat", async ({ page }) => {
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });

    const countMeta = async (selector: string) =>
      await page.locator(`head >> ${selector}`).count();

    // twitter:card wajib summary_large_image
    const card = await page.locator('head >> meta[name="twitter:card"]').getAttribute("content");
    expect(card).toBe("summary_large_image");

    // Tag inti hanya boleh satu
    const uniqueTags: Array<[string, string]> = [
      ["og:type", 'meta[property="og:type"]'],
      ["og:title", 'meta[property="og:title"]'],
      ["og:description", 'meta[property="og:description"]'],
      ["og:url", 'meta[property="og:url"]'],
      ["twitter:card", 'meta[name="twitter:card"]'],
      ["twitter:title", 'meta[name="twitter:title"]'],
      ["twitter:description", 'meta[name="twitter:description"]'],
    ];

    for (const [label, sel] of uniqueTags) {
      const n = await countMeta(sel);
      expect(n, `${label} harus muncul tepat 1x, ditemukan ${n}`).toBe(1);
    }

    // Manual og:image / twitter:image harus 0 di source awal.
    // Hosting bisa menyuntik satu saat serve; kalau begitu maksimal 1, tidak duplikat.
    const ogImage = await countMeta('meta[property="og:image"]');
    const twImage = await countMeta('meta[name="twitter:image"]');
    expect(ogImage, "og:image = 2 varian ukuran").toBe(2);
    expect(twImage, "twitter:image tepat 1").toBe(1);
  });

  test("hard reload tidak menambahkan duplikat meta preview", async ({ page }) => {
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });

    const snapshot = async () => ({
      ogType: await page.locator('head >> meta[property="og:type"]').count(),
      ogTitle: await page.locator('head >> meta[property="og:title"]').count(),
      ogDesc: await page.locator('head >> meta[property="og:description"]').count(),
      ogUrl: await page.locator('head >> meta[property="og:url"]').count(),
      ogImage: await page.locator('head >> meta[property="og:image"]').count(),
      twCard: await page.locator('head >> meta[name="twitter:card"]').count(),
      twTitle: await page.locator('head >> meta[name="twitter:title"]').count(),
      twDesc: await page.locator('head >> meta[name="twitter:description"]').count(),
      twImage: await page.locator('head >> meta[name="twitter:image"]').count(),
    });

    const before = await snapshot();

    // Hard reload (bypass cache)
    await page.reload({ waitUntil: "networkidle" });
    const after = await snapshot();

    expect(after).toEqual(before);

    // Sanity: tidak ada tag preview yang jumlahnya > 1
    for (const [k, v] of Object.entries(after)) {
      expect(v, `${k} tidak boleh duplikat (found ${v})`).toBeLessThanOrEqual(1);
    }
  });
});
