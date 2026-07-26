import { test, expect, type Page, type APIRequestContext } from "@playwright/test";

/**
 * Kontrak social preview image:
 * - og:image dan twitter:image tidak duplikat (tepat 1 per route di dev).
 * - og:image:width = 1200, og:image:height = 630 (rekomendasi summary_large_image).
 * - File gambar benar-benar berukuran 1200x630 saat di-fetch.
 */

const DEV = "http://localhost:8080";
const ROUTES = ["/", "/kalkulator", "/tabungan", "/edukasi", "/pengingat", "/donasi"] as const;

const EXPECTED_W = 1200;
const EXPECTED_H = 630;

async function contents(page: Page, selector: string): Promise<string[]> {
  const loc = page.locator(`head >> ${selector}`);
  const n = await loc.count();
  const out: string[] = [];
  for (let i = 0; i < n; i++) out.push((await loc.nth(i).getAttribute("content")) ?? "");
  return out;
}

/** Baca dimensi intrinsik dari buffer JPEG atau PNG. */
function readImageSize(buf: Buffer): { width: number; height: number } | null {
  // PNG: signature 8 byte, IHDR width/height big-endian di offset 16 & 20.
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  // JPEG: cari marker SOFn (0xC0-0xCF kecuali C4/C8/CC).
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
  const buf = await res.body();
  const size = readImageSize(buf);
  expect(size, `format ${url} harus JPEG/PNG yang bisa dibaca dimensinya`).not.toBeNull();
  return size!;
}

test.describe("og:image / twitter:image: tanpa duplikat & 1200x630", () => {
  for (const route of ROUTES) {
    test(`${route} - tepat satu og:image & twitter:image`, async ({ page }) => {
      await page.goto(`${DEV}${route}`, { waitUntil: "networkidle" });

      const og = await contents(page, 'meta[property="og:image"]');
      const tw = await contents(page, 'meta[name="twitter:image"]');

      expect(og.length, `og:image harus tepat 1 di ${route}, ditemukan ${og.length}`).toBe(1);
      expect(tw.length, `twitter:image harus tepat 1 di ${route}, ditemukan ${tw.length}`).toBe(1);
      expect(og[0], `og:image & twitter:image harus sama di ${route}`).toBe(tw[0]);
      expect(og[0], `og:image harus URL absolut https di ${route}`).toMatch(/^https:\/\/[^\s]+$/i);
    });

    test(`${route} - og:image:width/height = ${EXPECTED_W}x${EXPECTED_H}`, async ({ page }) => {
      await page.goto(`${DEV}${route}`, { waitUntil: "networkidle" });

      const widths = await contents(page, 'meta[property="og:image:width"]');
      const heights = await contents(page, 'meta[property="og:image:height"]');

      expect(widths.length, `og:image:width harus tepat 1 di ${route}`).toBe(1);
      expect(heights.length, `og:image:height harus tepat 1 di ${route}`).toBe(1);
      expect(Number(widths[0]), `og:image:width di ${route}`).toBe(EXPECTED_W);
      expect(Number(heights[0]), `og:image:height di ${route}`).toBe(EXPECTED_H);
    });
  }

  test("file og-image.jpg lokal benar-benar 1200x630", async ({ request }) => {
    const size = await fetchSize(request, `${DEV}/og-image.jpg`);
    expect(size.width, "lebar og-image.jpg").toBe(EXPECTED_W);
    expect(size.height, "tinggi og-image.jpg").toBe(EXPECTED_H);
  });

  test("URL pada og:image menunjuk ke gambar 1200x630", async ({ page, request }) => {
    await page.goto(`${DEV}/`, { waitUntil: "networkidle" });
    const [og] = await contents(page, 'meta[property="og:image"]');
    expect(og, "og:image harus terisi").toBeTruthy();

    // Di dev, host produksi bisa belum ter-publish. Uji path yang sama secara lokal
    // supaya test deterministik, lalu cek produksi hanya bila dapat dijangkau.
    const path = new URL(og).pathname;
    const local = await fetchSize(request, `${DEV}${path}`);
    expect(local.width).toBe(EXPECTED_W);
    expect(local.height).toBe(EXPECTED_H);

    let remote;
    try {
      remote = await request.get(og, { timeout: 15_000 });
    } catch {
      test.skip(true, "URL produksi tidak dapat dijangkau dari environment ini");
      return;
    }
    if (!remote.ok()) {
      test.skip(true, `og:image produksi merespon ${remote.status()} (build belum di-publish)`);
      return;
    }
    const size = readImageSize(await remote.body());
    expect(size, "og:image produksi harus JPEG/PNG").not.toBeNull();
    expect(size!.width, "lebar og:image produksi").toBe(EXPECTED_W);
    expect(size!.height, "tinggi og:image produksi").toBe(EXPECTED_H);
  });
});
