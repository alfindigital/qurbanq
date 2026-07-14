import { test, expect, type Page } from "@playwright/test";

/**
 * Memastikan og:image dan twitter:image (jika ada) selalu:
 * - URL absolut dengan skema https
 * - Berakhiran ekstensi gambar valid: png / jpg / jpeg / webp
 *   (query string / fragment diabaikan saat pengecekan ekstensi)
 * - Tidak duplikat (maks 1 tag per route)
 *
 * Catatan lingkungan:
 * - Di dev localhost, hosting Lovable TIDAK menginject og:image, jadi
 *   assertion konten hanya berjalan bila tag ditemukan.
 * - Di produksi, hosting menginject 1 tag; assertion berjalan penuh.
 */

const DEV = "http://localhost:8080";
const PROD = "https://qurban-q.lovable.app";

const ROUTES = ["/", "/kalkulator", "/tabungan", "/edukasi", "/pengingat"] as const;

const IMG_EXT_RE = /\.(png|jpe?g|webp)$/i;

function assertValidImageUrl(url: string, label: string) {
  expect(url, `${label} harus terisi`).toBeTruthy();
  expect(url, `${label} harus URL absolut https`).toMatch(/^https:\/\/[^\s]+$/i);
  // Buang query & fragment sebelum cek ekstensi
  const clean = url.split("#")[0].split("?")[0];
  expect(clean, `${label} harus berakhiran .png/.jpg/.jpeg/.webp`).toMatch(IMG_EXT_RE);
}

async function collect(page: Page, selector: string): Promise<string[]> {
  const loc = page.locator(`head >> ${selector}`);
  const n = await loc.count();
  const out: string[] = [];
  for (let i = 0; i < n; i++) out.push((await loc.nth(i).getAttribute("content")) ?? "");
  return out;
}

test.describe("Social image URL format (https + ekstensi valid + no dup)", () => {
  for (const route of ROUTES) {
    test(`dev: ${route} - og/twitter image valid & unik jika ada`, async ({ page }) => {
      await page.goto(`${DEV}${route}`, { waitUntil: "networkidle" });

      const ogs = await collect(page, 'meta[property="og:image"]');
      const tws = await collect(page, 'meta[name="twitter:image"]');

      expect(ogs.length, `og:image maks 1 di ${route}`).toBeLessThanOrEqual(1);
      expect(tws.length, `twitter:image maks 1 di ${route}`).toBeLessThanOrEqual(1);

      if (ogs.length === 1) assertValidImageUrl(ogs[0], `og:image (${route})`);
      if (tws.length === 1) assertValidImageUrl(tws[0], `twitter:image (${route})`);
    });
  }

  for (const route of ROUTES) {
    test(`prod: ${route} - og:image absolut https + ekstensi valid + no dup`, async ({ request }) => {
      let res;
      try {
        res = await request.get(`${PROD}${route}`, { timeout: 15_000 });
      } catch {
        test.skip(true, "Produksi tidak dapat dijangkau dari environment ini");
        return;
      }
      if (!res.ok()) {
        test.skip(true, `Produksi merespon ${res.status()}`);
        return;
      }
      const html = await res.text();

      const ogMatches = [...html.matchAll(/<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["']/gi)];
      const twMatches = [...html.matchAll(/<meta[^>]+name=["']twitter:image["'][^>]*content=["']([^"']+)["']/gi)];

      expect(ogMatches.length, `og:image tepat 1 di prod (${route})`).toBe(1);
      expect(twMatches.length, `twitter:image maks 1 di prod (${route})`).toBeLessThanOrEqual(1);

      assertValidImageUrl(ogMatches[0][1], `og:image prod (${route})`);
      if (twMatches.length === 1) {
        assertValidImageUrl(twMatches[0][1], `twitter:image prod (${route})`);
      }
    });
  }
});
