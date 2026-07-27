import { test, expect, type Page, type APIRequestContext } from "@playwright/test";

/**
 * Kontrak social preview image (multi-size), diverifikasi end-to-end:
 * - Dua varian og:image: 1200x630 (utama) dan 600x315, urut & tanpa duplikat.
 * - Tiap varian punya grup lengkap: type/width/height/alt yang cocok.
 * - twitter:image tunggal, memakai varian utama, dan file-nya benar-benar 1200x630.
 * - File yang diserve (bukan hanya yang ada di repo) berukuran & bertipe sesuai deklarasi.
 * - URL selalu absolut https ke domain produksi.
 */

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:8080";
const PROD_ORIGIN = "https://qurban-q.lovable.app";
const ROUTES = ["/", "/kalkulator", "/tabungan", "/edukasi", "/pengingat", "/donasi"] as const;

const VARIANTS = [
  { path: "/og-image.jpg", width: 1200, height: 630, type: "image/jpeg" },
  { path: "/og-image-600x315.jpg", width: 600, height: 315, type: "image/jpeg" },
] as const;

const PRIMARY = VARIANTS[0];

async function contents(page: Page, selector: string): Promise<string[]> {
  const loc = page.locator(`head >> ${selector}`);
  const n = await loc.count();
  const out: string[] = [];
  for (let i = 0; i < n; i++) out.push((await loc.nth(i).getAttribute("content")) ?? "");
  return out;
}

/** Baca dimensi + tipe intrinsik dari buffer JPEG atau PNG. */
function readImageMeta(buf: Buffer): { width: number; height: number; type: string } | null {
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) {
    return { type: "image/png", width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
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
        return { type: "image/jpeg", width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5) };
      }
      const len = buf.readUInt16BE(i + 2);
      if (len <= 0) break;
      i += 2 + len;
    }
  }
  return null;
}

async function fetchImageMeta(request: APIRequestContext, url: string) {
  const res = await request.get(url, { timeout: 20_000 });
  expect(res.ok(), `gambar ${url} harus dapat diakses (status ${res.status()})`).toBeTruthy();
  const buf = await res.body();
  expect(buf.byteLength, `${url} tidak boleh kosong`).toBeGreaterThan(1024);
  const meta = readImageMeta(buf);
  expect(meta, `format ${url} harus JPEG/PNG yang bisa dibaca dimensinya`).not.toBeNull();
  return meta!;
}

test.describe("og:image / twitter:image multi-size (1200x630 + 600x315)", () => {
  for (const route of ROUTES) {
    test(`${route} - grup og:image lengkap, urut, dan cocok`, async ({ page }) => {
      await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });

      const og = await contents(page, 'meta[property="og:image"]');
      const types = await contents(page, 'meta[property="og:image:type"]');
      const widths = await contents(page, 'meta[property="og:image:width"]');
      const heights = await contents(page, 'meta[property="og:image:height"]');
      const alts = await contents(page, 'meta[property="og:image:alt"]');

      expect(og.length, `og:image harus ${VARIANTS.length} varian di ${route}`).toBe(VARIANTS.length);
      expect(new Set(og).size, `URL og:image tidak boleh duplikat di ${route}`).toBe(og.length);
      expect(types.length, `jumlah og:image:type di ${route}`).toBe(VARIANTS.length);
      expect(widths.length, `jumlah og:image:width di ${route}`).toBe(VARIANTS.length);
      expect(heights.length, `jumlah og:image:height di ${route}`).toBe(VARIANTS.length);
      expect(alts.length, `jumlah og:image:alt di ${route}`).toBe(VARIANTS.length);

      VARIANTS.forEach((v, i) => {
        expect(og[i], `og:image[${i}] harus URL absolut https di ${route}`).toMatch(/^https:\/\/[^\s]+$/i);
        const u = new URL(og[i]);
        expect(u.origin, `origin og:image[${i}] di ${route}`).toBe(PROD_ORIGIN);
        expect(u.pathname, `urutan varian og:image di ${route}`).toBe(v.path);
        expect(types[i], `og:image:type[${i}] di ${route}`).toBe(v.type);
        expect(Number(widths[i]), `og:image:width[${i}] di ${route}`).toBe(v.width);
        expect(Number(heights[i]), `og:image:height[${i}] di ${route}`).toBe(v.height);
        expect(alts[i].trim().length, `og:image:alt[${i}] di ${route} tidak boleh kosong`).toBeGreaterThan(0);
      });
    });

    test(`${route} - twitter:image tunggal & memakai varian utama`, async ({ page }) => {
      await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });

      const tw = await contents(page, 'meta[name="twitter:image"]');
      const card = await contents(page, 'meta[name="twitter:card"]');
      const twAlt = await contents(page, 'meta[name="twitter:image:alt"]');

      expect(tw.length, `twitter:image harus tepat 1 di ${route}, ditemukan ${tw.length}`).toBe(1);
      expect(twAlt.length, `twitter:image:alt harus tepat 1 di ${route}`).toBe(1);
      expect(twAlt[0].trim().length, `twitter:image:alt di ${route} tidak boleh kosong`).toBeGreaterThan(0);
      expect(card, `twitter:card di ${route}`).toEqual(["summary_large_image"]);
      expect(new URL(tw[0]).pathname, `twitter:image harus varian ${PRIMARY.width}x${PRIMARY.height}`).toBe(PRIMARY.path);
    });

    test(`${route} - file di balik tiap og:image sesuai deklarasi`, async ({ page, request }) => {
      await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });

      const og = await contents(page, 'meta[property="og:image"]');
      const types = await contents(page, 'meta[property="og:image:type"]');
      const widths = await contents(page, 'meta[property="og:image:width"]');
      const heights = await contents(page, 'meta[property="og:image:height"]');

      for (let i = 0; i < og.length; i++) {
        // Uji terhadap server lokal supaya deterministik walau build produksi belum ter-publish.
        const pathname = new URL(og[i]).pathname;
        const meta = await fetchImageMeta(request, `${BASE}${pathname}`);
        expect(meta.width, `lebar aktual ${pathname} (${route})`).toBe(Number(widths[i]));
        expect(meta.height, `tinggi aktual ${pathname} (${route})`).toBe(Number(heights[i]));
        expect(meta.type, `tipe aktual ${pathname} (${route})`).toBe(types[i]);
      }
    });
  }

  test("file di balik twitter:image benar-benar varian utama", async ({ page, request }) => {
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    const tw = await contents(page, 'meta[name="twitter:image"]');
    const meta = await fetchImageMeta(request, `${BASE}${new URL(tw[0]).pathname}`);
    expect(meta.width).toBe(PRIMARY.width);
    expect(meta.height).toBe(PRIMARY.height);
    expect(meta.type).toBe(PRIMARY.type);
  });

  for (const v of VARIANTS) {
    test(`file ${v.path} benar-benar ${v.width}x${v.height} ${v.type}`, async ({ request }) => {
      const meta = await fetchImageMeta(request, `${BASE}${v.path}`);
      expect(meta.width, `lebar ${v.path}`).toBe(v.width);
      expect(meta.height, `tinggi ${v.path}`).toBe(v.height);
      expect(meta.type, `tipe ${v.path}`).toBe(v.type);
    });
  }

  test("varian tidak menunjuk file yang sama (aset benar-benar berbeda)", async ({ request }) => {
    const bodies = await Promise.all(
      VARIANTS.map(async (v) => (await request.get(`${BASE}${v.path}`)).body()),
    );
    expect(bodies[0].equals(bodies[1]), "og-image.jpg dan og-image-600x315.jpg tidak boleh identik").toBe(false);
  });
});
