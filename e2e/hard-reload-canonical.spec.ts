import { test, expect, type Page } from "@playwright/test";

/**
 * Memastikan saat pengguna mengakses langsung (hard reload / direct navigation)
 * ke / dan /kalkulator:
 * - Server merespon 200 (SPA fallback bekerja untuk deep link)
 * - <link rel="canonical"> tepat 1 dan self-reference ke route tersebut
 *   (bukan homepage saat mengakses /kalkulator)
 * - og:url efektif = canonical
 * - Konsistensi tetap terjaga setelah page.reload() berulang
 */

const BASE = "http://localhost:8080";
const SITE = "https://qurban-q.lovable.app";

const ROUTES = [
  { path: "/", label: "Beranda" },
  { path: "/kalkulator", label: "Kalkulator" },
] as const;

async function readCanonical(page: Page): Promise<string> {
  const locs = page.locator('head >> link[rel="canonical"]');
  const n = await locs.count();
  expect(n, "canonical harus tepat 1").toBe(1);
  const href = await locs.first().getAttribute("href");
  expect(href, "canonical harus terisi").toBeTruthy();
  return href!;
}

async function readOgUrl(page: Page): Promise<string> {
  const locs = page.locator('head >> meta[property="og:url"]');
  const n = await locs.count();
  expect(n, "og:url minimal 1").toBeGreaterThanOrEqual(1);
  const content = await locs.nth(n - 1).getAttribute("content");
  expect(content, "og:url harus terisi").toBeTruthy();
  return content!;
}

test.describe("Hard reload: status 200 & canonical self-reference", () => {
  for (const { path, label } of ROUTES) {
    test(`${label} (${path}) - direct access merespon 200 dengan HTML`, async ({ request }) => {
      const res = await request.get(`${BASE}${path}`);
      expect(res.status(), `status ${path} harus 200`).toBe(200);
      const ct = res.headers()["content-type"] ?? "";
      expect(ct.toLowerCase(), `content-type ${path} harus text/html`).toContain("text/html");
      const body = await res.text();
      expect(body.length, `body ${path} tidak boleh kosong`).toBeGreaterThan(0);
      expect(body).toMatch(/<div\s+id=["']root["']/i);
    });

    test(`${label} (${path}) - canonical self-reference setelah hard reload`, async ({ page }) => {
      // Hard load pertama (bukan client-side nav)
      const resp = await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
      expect(resp?.status(), `initial load ${path} = 200`).toBe(200);

      // Tunggu Helmet menerapkan canonical route
      await page.waitForFunction(
        (expected) => {
          const c = document.head.querySelector('link[rel="canonical"]');
          return c?.getAttribute("href") === expected;
        },
        `${SITE}${path}`,
      );

      const expected = `${SITE}${path}`;
      expect(await readCanonical(page), `canonical setelah load ${path}`).toBe(expected);
      expect(await readOgUrl(page), `og:url setelah load ${path}`).toBe(expected);
      expect(new URL(page.url()).pathname, `pathname browser ${path}`).toBe(path);
    });

    test(`${label} (${path}) - hard reload berulang menjaga canonical & 200`, async ({ page }) => {
      await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
      const expected = `${SITE}${path}`;

      for (let i = 0; i < 3; i++) {
        const resp = await page.reload({ waitUntil: "networkidle" });
        expect(resp?.status(), `reload ke-${i} ${path} = 200`).toBe(200);

        await page.waitForFunction(
          (exp) => {
            const c = document.head.querySelector('link[rel="canonical"]');
            return c?.getAttribute("href") === exp;
          },
          expected,
        );

        expect(await readCanonical(page), `canonical setelah reload ke-${i} ${path}`).toBe(expected);
        expect(await readOgUrl(page), `og:url setelah reload ke-${i} ${path}`).toBe(expected);
      }
    });
  }

  test("/kalkulator hard reload tidak jatuh ke canonical homepage", async ({ page }) => {
    const resp = await page.goto(`${BASE}/kalkulator`, { waitUntil: "networkidle" });
    expect(resp?.status()).toBe(200);

    await page.waitForFunction(() => {
      const c = document.head.querySelector('link[rel="canonical"]');
      return c?.getAttribute("href") === "https://qurban-q.lovable.app/kalkulator";
    });

    const canonical = await readCanonical(page);
    expect(canonical).toBe(`${SITE}/kalkulator`);
    expect(canonical, "canonical /kalkulator tidak boleh = homepage").not.toBe(`${SITE}/`);
  });
});
