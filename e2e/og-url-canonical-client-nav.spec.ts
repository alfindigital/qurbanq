import { test, expect, type Page } from "@playwright/test";

/**
 * Memastikan <meta property="og:url"> yang efektif (tag terakhir di head)
 * SELALU sama dengan <link rel="canonical"> route saat ini selama
 * navigasi client-side (tanpa hard reload) antara / dan /kalkulator.
 *
 * Ini menutup celah dimana og:url bisa "tertinggal" di URL route sebelumnya
 * saat berpindah halaman via BrowserRouter — yang membuat crawler
 * mengatribusikan preview ke URL yang salah.
 */

const BASE = "http://localhost:8080";
const SITE = "https://qurban-q.lovable.app";

async function readCanonical(page: Page): Promise<string> {
  const locs = page.locator('head >> link[rel="canonical"]');
  const n = await locs.count();
  expect(n, "canonical harus tepat 1").toBe(1);
  const href = await locs.first().getAttribute("href");
  expect(href, "canonical harus terisi").toBeTruthy();
  return href!;
}

async function readEffectiveOgUrl(page: Page): Promise<string> {
  const locs = page.locator('head >> meta[property="og:url"]');
  const n = await locs.count();
  expect(n, "og:url minimal 1").toBeGreaterThanOrEqual(1);
  const content = await locs.nth(n - 1).getAttribute("content");
  expect(content, "og:url harus terisi").toBeTruthy();
  return content!;
}

async function assertOgUrlEqualsCanonical(page: Page, route: "/" | "/kalkulator") {
  const expected = `${SITE}${route}`;
  const canonical = await readCanonical(page);
  const ogUrl = await readEffectiveOgUrl(page);
  expect(canonical, `canonical di ${route}`).toBe(expected);
  expect(ogUrl, `og:url efektif di ${route} harus = canonical`).toBe(canonical);
}

async function clientNavigate(page: Page, targetPath: "/" | "/kalkulator") {
  const link = page.locator(`a[href="${targetPath}"]`).first();
  await expect(link, `link ke ${targetPath} harus ada`).toBeVisible();
  await link.click();
  await page.waitForURL(`**${targetPath}`);
  await page.waitForFunction(
    (expected) => {
      const c = document.head.querySelector('link[rel="canonical"]');
      return c?.getAttribute("href")?.endsWith(expected) ?? false;
    },
    targetPath,
  );
}

test.describe("og:url = canonical selama client-side nav", () => {
  test("/ -> /kalkulator -> / : og:url selalu = canonical route saat ini", async ({ page }) => {
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await assertOgUrlEqualsCanonical(page, "/");

    await clientNavigate(page, "/kalkulator");
    await assertOgUrlEqualsCanonical(page, "/kalkulator");

    await clientNavigate(page, "/");
    await assertOgUrlEqualsCanonical(page, "/");
  });

  test("/kalkulator -> / (mulai dari route dalam) : og:url tidak tertinggal", async ({ page }) => {
    await page.goto(`${BASE}/kalkulator`, { waitUntil: "networkidle" });
    await assertOgUrlEqualsCanonical(page, "/kalkulator");

    await clientNavigate(page, "/");
    await assertOgUrlEqualsCanonical(page, "/");
  });

  test("bolak-balik cepat / <-> /kalkulator: og:url tidak duplikat & selalu = canonical", async ({ page }) => {
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });

    for (let i = 0; i < 3; i++) {
      await clientNavigate(page, "/kalkulator");
      await assertOgUrlEqualsCanonical(page, "/kalkulator");

      await clientNavigate(page, "/");
      await assertOgUrlEqualsCanonical(page, "/");
    }

    // Setelah banyak transisi, og:url TIDAK boleh menumpuk (Helmet dedupe by property)
    const ogUrlCount = await page.locator('head >> meta[property="og:url"]').count();
    expect(ogUrlCount, "og:url tidak boleh menumpuk setelah banyak nav").toBeLessThanOrEqual(1);

    const canonicalCount = await page.locator('head >> link[rel="canonical"]').count();
    expect(canonicalCount, "canonical tidak boleh menumpuk setelah banyak nav").toBe(1);
  });
});
