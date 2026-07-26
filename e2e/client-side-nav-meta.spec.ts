import { test, expect, type Page } from "@playwright/test";

/**
 * Memastikan saat berpindah halaman secara client-side (tanpa hard reload)
 * antara / dan /kalkulator, tag berikut tetap benar dan tidak menumpuk:
 * - <link rel="canonical"> self-reference route saat ini (tepat 1)
 * - <meta property="og:url"> efektif = canonical
 * - og:image = 2 varian ukuran (URL unik) & twitter:image maks 1, semua absolut https
 *
 * Navigasi dilakukan lewat klik pada elemen bernavigasi (BottomNav / link)
 * agar benar-benar client-side (BrowserRouter push), bukan page.goto().
 */

const BASE = "http://localhost:8080";
const SITE = "https://qurban-q.lovable.app";

async function lastAttr(
  page: Page,
  selector: string,
  attr: "content" | "href",
): Promise<string | null> {
  const loc = page.locator(`head >> ${selector}`);
  const n = await loc.count();
  if (n === 0) return null;
  return await loc.nth(n - 1).getAttribute(attr);
}

async function count(page: Page, selector: string): Promise<number> {
  return await page.locator(`head >> ${selector}`).count();
}

async function assertRouteMeta(page: Page, route: "/" | "/kalkulator") {
  const expectedUrl = `${SITE}${route}`;

  // canonical tepat 1 dan self-reference
  const canonicalCount = await count(page, 'link[rel="canonical"]');
  expect(canonicalCount, `canonical harus 1 di ${route}`).toBe(1);
  const canonicalHref = await lastAttr(page, 'link[rel="canonical"]', "href");
  expect(canonicalHref, `canonical self-reference di ${route}`).toBe(expectedUrl);

  // og:url efektif = canonical
  const ogUrl = await lastAttr(page, 'meta[property="og:url"]', "content");
  expect(ogUrl, `og:url efektif di ${route}`).toBe(expectedUrl);

  // og:image multi-size (2 varian, URL unik) & twitter:image tunggal
  const ogImgCount = await count(page, 'meta[property="og:image"]');
  const twImgCount = await count(page, 'meta[name="twitter:image"]');
  expect(ogImgCount, `og:image = 2 varian ukuran di ${route}`).toBe(2);
  expect(twImgCount, `twitter:image maks 1 di ${route}`).toBeLessThanOrEqual(1);

  const ogImgUrls = await page
    .locator('head >> meta[property="og:image"]')
    .evaluateAll((els) => els.map((el) => el.getAttribute("content") ?? ""));
  expect(new Set(ogImgUrls).size, `URL og:image unik di ${route}`).toBe(ogImgUrls.length);
  ogImgUrls.forEach((v, i) => {
    expect(v, `og:image[${i}] absolut https di ${route}`).toMatch(/^https:\/\/[^\s]+$/i);
  });
  if (twImgCount === 1) {
    const v = await lastAttr(page, 'meta[name="twitter:image"]', "content");
    expect(v, `twitter:image absolut https di ${route}`).toMatch(/^https:\/\/[^\s]+$/i);
  }
}

async function clientNavigate(page: Page, targetPath: "/" | "/kalkulator") {
  // Cari link internal ke targetPath (BottomNav / sidebar / link apa pun)
  const link = page.locator(`a[href="${targetPath}"]`).first();
  await expect(link, `link ke ${targetPath} harus ada untuk client-side nav`).toBeVisible();
  await link.click();
  await page.waitForURL(`**${targetPath}`);
  // Beri waktu Helmet untuk apply mutasi head
  await page.waitForFunction(
    (expected) => {
      const c = document.head.querySelector('link[rel="canonical"]');
      return c?.getAttribute("href")?.endsWith(expected) ?? false;
    },
    targetPath,
  );
}

test.describe("Client-side navigation meta consistency (no hard reload)", () => {
  test("/ -> /kalkulator -> / menjaga canonical, og:url, dan tidak duplikat image", async ({ page }) => {
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await assertRouteMeta(page, "/");

    // Client-side nav ke /kalkulator
    await clientNavigate(page, "/kalkulator");
    await assertRouteMeta(page, "/kalkulator");

    // Kembali ke / secara client-side
    await clientNavigate(page, "/");
    await assertRouteMeta(page, "/");
  });

  test("/kalkulator -> / (mulai dari route dalam) tetap benar tanpa reload", async ({ page }) => {
    await page.goto(`${BASE}/kalkulator`, { waitUntil: "networkidle" });
    await assertRouteMeta(page, "/kalkulator");

    await clientNavigate(page, "/");
    await assertRouteMeta(page, "/");
  });
});
