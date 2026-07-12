import { test, expect } from "@playwright/test";

/**
 * Memastikan metadata social preview (og:image & twitter:image) tidak diset
 * secara manual di source, dan tidak ada duplikasi tag setelah hard reload.
 *
 * Kontrak:
 * - Tidak boleh ada <meta property="og:image"> atau <meta name="twitter:image">
 *   di dalam index.html yang di-build (dibiarkan diinject otomatis oleh hosting).
 * - twitter:card harus "summary_large_image".
 * - og:title, og:description, og:url, og:type, twitter:title, twitter:description
 *   masing-masing hadir tepat satu kali (tidak ada duplikasi).
 * - Setelah hard reload di browser, jumlah tag tetap sama (client-side tidak
 *   menambah duplikat).
 */

const BASE = "http://localhost:8080";

test.describe("Social preview metadata", () => {
  test("index.html tidak memiliki og:image atau twitter:image manual", async ({ request }) => {
    const res = await request.get(`${BASE}/`);
    const html = await res.text();

    // Hitung kemunculan tag yang seharusnya tidak ada di source.
    const ogImageMatches = html.match(/<meta[^>]+property=["']og:image["']/gi) ?? [];
    const twImageMatches = html.match(/<meta[^>]+name=["']twitter:image["']/gi) ?? [];

    expect(ogImageMatches.length, "og:image tidak boleh diset manual di index.html").toBe(0);
    expect(twImageMatches.length, "twitter:image tidak boleh diset manual di index.html").toBe(0);
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
    expect(ogImage, "og:image maksimal 1 (0 di dev, 1 setelah hosting inject)").toBeLessThanOrEqual(1);
    expect(twImage, "twitter:image maksimal 1 (0 di dev, 1 setelah hosting inject)").toBeLessThanOrEqual(1);
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
