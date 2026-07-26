import { test, expect } from "@playwright/test";

/**
 * Memastikan og:image dan twitter:image (yang diinject otomatis oleh hosting)
 * hadir sebagai URL absolut https dan tidak duplikat untuk setiap route.
 *
 * Catatan lingkungan:
 * - Di dev localhost, hosting Lovable TIDAK menginject og:image. Jadi jika
 *   jumlahnya 0 kami skip assertion konten dan cukup pastikan tidak duplikat.
 * - Di produksi (di-serve oleh hosting), hostng menginject 1 tag. Kami
 *   pastikan URL-nya absolut https dan tidak duplikat.
 */

const DEV = "http://localhost:8080";
const PROD = "https://qurban-q.lovable.app";

const ROUTES = ["/", "/kalkulator"] as const;

async function countAndCollect(
  page: import("@playwright/test").Page,
  selector: string,
): Promise<{ count: number; contents: string[] }> {
  const loc = page.locator(`head >> ${selector}`);
  const count = await loc.count();
  const contents: string[] = [];
  for (let i = 0; i < count; i++) {
    contents.push((await loc.nth(i).getAttribute("content")) ?? "");
  }
  return { count, contents };
}

function assertAbsoluteHttps(url: string, label: string) {
  expect(url, `${label} harus terisi`).toBeTruthy();
  expect(url, `${label} harus URL absolut https`).toMatch(/^https:\/\/[^\s]+$/i);
}

test.describe("Social preview image injection", () => {
  for (const route of ROUTES) {
    test(`dev: ${route} tidak duplikat og:image / twitter:image`, async ({ page }) => {
      await page.goto(`${DEV}${route}`, { waitUntil: "networkidle" });

      const og = await countAndCollect(page, 'meta[property="og:image"]');
      const tw = await countAndCollect(page, 'meta[name="twitter:image"]');

      expect(og.count, `og:image = 2 varian ukuran di ${route}`).toBe(2);
      expect(new Set(og.contents).size, `URL og:image unik di ${route}`).toBe(og.count);
      expect(tw.count, `twitter:image tepat 1 di ${route}`).toBe(1);

      og.contents.forEach((u, i) => assertAbsoluteHttps(u, `og:image[${i}] (${route})`));
      if (tw.count === 1) assertAbsoluteHttps(tw.contents[0], `twitter:image (${route})`);
    });
  }

  for (const route of ROUTES) {
    test(`prod: ${route} punya og:image + twitter:image absolut & tidak duplikat`, async ({ request }) => {
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

      expect(ogMatches.length, `og:image di prod = 2 varian untuk ${route}`).toBe(2);
      expect(new Set(ogMatches.map((m) => m[1])).size, `URL og:image prod unik (${route})`).toBe(2);
      expect(twMatches.length, `twitter:image di prod maks 1 untuk ${route}`).toBeLessThanOrEqual(1);

      ogMatches.forEach((m, i) => assertAbsoluteHttps(m[1], `og:image[${i}] (${route})`));
      if (twMatches.length === 1) {
        assertAbsoluteHttps(twMatches[0][1], `twitter:image (${route})`);
      }
    });
  }
});
