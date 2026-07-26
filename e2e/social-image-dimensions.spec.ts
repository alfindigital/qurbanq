import { test, expect, type Page, type APIRequestContext } from "@playwright/test";

/**
 * Kontrak social preview image (multi-size):
 * - Ada dua varian og:image: 1200x630 (utama) dan 600x315 (fallback), tanpa duplikat URL.
 * - Setiap varian punya tepat satu pasang og:image:width/height yang cocok.
 * - twitter:image tetap satu (Twitter hanya membaca satu gambar) dan memakai varian 1200x630.
 * - File gambar benar-benar berukuran sesuai deklarasi.
 */

const DEV = "http://localhost:8080";
const ROUTES = ["/", "/kalkulator", "/tabungan", "/edukasi", "/pengingat", "/donasi"] as const;

const VARIANTS = [
  { path: "/og-image.jpg", width: 1200, height: 630 },
  { path: "/og-image-600x315.jpg", width: 600, height: 315 },
] as const;

const PRIMARY = VARIANTS[0];

async function contents(page: Page, selector: string): Promise<string[]> {
  const loc = page.locator(`head >> ${selector}`);
  const n = await loc.count();
  const out: string[] = [];
  for (let i = 0; i < n; i++) out.push((await loc.nth(i).getAttribute("content")) ?? "");
  return out;
}

/** Baca dimensi intrinsik dari buffer JPEG atau PNG. */
function readImageSize(buf: Buffer): { width: number; height: number } | null {
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length - 9) {
      if (buf[i] !== 0xff) {
        i++;
        continue;
      }
      const marker = buf[i + 1];
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5) };
      }
      const len = buf.readUInt16BE(i + 2);
      if (len <= 0) break;
      i += 2 + len;
    }
  }
  return null;
}

async function fetchSize(request: APIRequestContext, url: string) {
  const res = await request.get(url, { timeout: 20_000 });
  expect(res.ok(), `gambar ${url} harus dapat diakses (status ${res.status()})`).toBeTruthy();
  const size = readImageSize(await res.body());
  expect(size, `format ${url} harus JPEG/PNG yang bisa dibaca dimensinya`).not.toBeNull();
  return size!;
}

test.describe("og:image / twitter:image multi-size (1200x630 + 600x315)", () => {
  for (const route of ROUTES) {
    test(`${route} - dua varian og:image tanpa duplikat`, async ({ page }) => {
      await page.goto(`${DEV}${route}`, { waitUntil: "networkidle" });

      const og = await contents(page, 'meta[property="og:image"]');
      expect(og.length, `og:image harus 2 varian di ${route}, ditemukan ${og.length}`).toBe(VARIANTS.length);
      expect(new Set(og).size, `URL og:image tidak boleh duplikat di ${route}`).toBe(og.length);

      og.forEach((url, i) => {
        expect(url, `og:image[${i}] harus URL absolut https di ${route}`).toMatch(/^https:\/\/[^\s]+$/i);
        expect(new URL(url).pathname, `urutan varian og:image di ${route}`).toBe(VARIANTS[i].path);
      });
    });

    test(`${route} - width/height cocok untuk tiap varian`, async ({ page }) => {
      await page.goto(`${DEV}${route}`, { waitUntil: "networkidle" });

      const widths = await contents(page, 'meta[property="og:image:width"]');
      const heights = await contents(page, 'meta[property="og:image:height"]');

      expect(widths.length, `jumlah og:image:width di ${route}`).toBe(VARIANTS.length);
      expect(heights.length, `jumlah og:image:height di ${route}`).toBe(VARIANTS.length);

      VARIANTS.forEach((v, i) => {
        expect(Number(widths[i]), `og:image:width[${i}] di ${route}`).toBe(v.width);
        expect(Number(heights[i]), `og:image:height[${i}] di ${route}`).toBe(v.height);
      });
    });

    test(`${route} - twitter:image tunggal & memakai varian utama`, async ({ page }) => {
      await page.goto(`${DEV}${route}`, { waitUntil: "networkidle" });

      const tw = await contents(page, 'meta[name="twitter:image"]');
      const card = await contents(page, 'meta[name="twitter:card"]');
      const twAlt = await contents(page, 'meta[name="twitter:image:alt"]');

      expect(tw.length, `twitter:image harus tepat 1 di ${route}, ditemukan ${tw.length}`).toBe(1);
      expect(twAlt.length, `twitter:image:alt harus tepat 1 di ${route}`).toBe(1);
      expect(card, `twitter:card di ${route}`).toEqual(["summary_large_image"]);
      expect(new URL(tw[0]).pathname, `twitter:image harus varian ${PRIMARY.width}x${PRIMARY.height}`).toBe(PRIMARY.path);
    });
  }

  for (const v of VARIANTS) {
    test(`file ${v.path} benar-benar ${v.width}x${v.height}`, async ({ request }) => {
      const size = await fetchSize(request, `${DEV}${v.path}`);
      expect(size.width, `lebar ${v.path}`).toBe(v.width);
      expect(size.height, `tinggi ${v.path}`).toBe(v.height);
    });
  }

  test("setiap URL og:image menunjuk ke gambar dengan dimensi yang dideklarasikan", async ({ page, request }) => {
    await page.goto(`${DEV}/`, { waitUntil: "networkidle" });
    const og = await contents(page, 'meta[property="og:image"]');
    const widths = await contents(page, 'meta[property="og:image:width"]');
    const heights = await contents(page, 'meta[property="og:image:height"]');

    for (let i = 0; i < og.length; i++) {
      // Uji lokal supaya deterministik walau build produksi belum ter-publish.
      const local = await fetchSize(request, `${DEV}${new URL(og[i]).pathname}`);
      expect(local.width, `lebar aktual varian ${i}`).toBe(Number(widths[i]));
      expect(local.height, `tinggi aktual varian ${i}`).toBe(Number(heights[i]));
    }
  });
});
