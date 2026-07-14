import { test, expect, type Page } from "@playwright/test";

/**
 * Memastikan schema.org JSON-LD tetap benar setelah navigasi client-side
 * antara / dan /kalkulator (tanpa hard reload):
 *
 * Kontrak per route:
 * - / : minimal ada blok Organization + WebSite (sitewide dari index.html)
 *       dan blok WebApplication (dari <SEO> Beranda).
 * - /kalkulator : Organization + WebSite tetap ada, ditambah
 *                 WebApplication dan BreadcrumbList (dari <SEO> Kalkulator).
 * - Setelah kembali ke /, blok BreadcrumbList milik Kalkulator TIDAK
 *   boleh menempel (Helmet harus melepasnya).
 * - Semua blok punya @context = "https://schema.org".
 * - Tidak ada duplikasi tipe yang seharusnya tunggal per route
 *   (WebApplication, BreadcrumbList).
 */

const BASE = "http://localhost:8080";

type JsonLd = Record<string, unknown> & { "@type"?: string | string[]; "@context"?: string };

async function readJsonLdBlocks(page: Page): Promise<JsonLd[]> {
  const raws = await page.locator('head >> script[type="application/ld+json"]').allTextContents();
  const blocks: JsonLd[] = [];
  for (const raw of raws) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    let parsed: unknown;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      throw new Error(`JSON-LD tidak valid JSON: ${trimmed.slice(0, 120)}`);
    }
    if (Array.isArray(parsed)) {
      for (const p of parsed) blocks.push(p as JsonLd);
    } else if (parsed && typeof parsed === "object") {
      blocks.push(parsed as JsonLd);
    }
  }
  return blocks;
}

function hasType(block: JsonLd, type: string): boolean {
  const t = block["@type"];
  if (Array.isArray(t)) return t.includes(type);
  return t === type;
}

function countType(blocks: JsonLd[], type: string): number {
  return blocks.filter((b) => hasType(b, type)).length;
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

async function assertHomeJsonLd(page: Page) {
  const blocks = await readJsonLdBlocks(page);
  expect(blocks.length, "JSON-LD Beranda minimal 3 blok").toBeGreaterThanOrEqual(3);

  for (const b of blocks) {
    expect(b["@context"], "setiap blok harus @context schema.org").toBe("https://schema.org");
  }

  expect(countType(blocks, "Organization"), "Organization sitewide").toBeGreaterThanOrEqual(1);
  expect(countType(blocks, "WebSite"), "WebSite sitewide").toBeGreaterThanOrEqual(1);
  expect(countType(blocks, "WebApplication"), "WebApplication di Beranda").toBe(1);
  expect(countType(blocks, "BreadcrumbList"), "BreadcrumbList tidak boleh ada di Beranda").toBe(0);
}

async function assertKalkulatorJsonLd(page: Page) {
  const blocks = await readJsonLdBlocks(page);
  expect(blocks.length, "JSON-LD Kalkulator minimal 4 blok").toBeGreaterThanOrEqual(4);

  for (const b of blocks) {
    expect(b["@context"], "setiap blok harus @context schema.org").toBe("https://schema.org");
  }

  expect(countType(blocks, "Organization"), "Organization tetap ada di Kalkulator").toBeGreaterThanOrEqual(1);
  expect(countType(blocks, "WebSite"), "WebSite tetap ada di Kalkulator").toBeGreaterThanOrEqual(1);
  expect(countType(blocks, "WebApplication"), "WebApplication di Kalkulator").toBe(1);
  expect(countType(blocks, "BreadcrumbList"), "BreadcrumbList di Kalkulator").toBe(1);

  // BreadcrumbList harus punya item ke Kalkulator
  const bc = blocks.find((b) => hasType(b, "BreadcrumbList"));
  expect(bc, "blok BreadcrumbList wajib ada").toBeTruthy();
  const items = (bc as { itemListElement?: Array<Record<string, unknown>> }).itemListElement ?? [];
  expect(items.length, "BreadcrumbList minimal 2 item (Beranda -> Kalkulator)").toBeGreaterThanOrEqual(2);
  const flat = JSON.stringify(items).toLowerCase();
  expect(flat).toContain("beranda");
  expect(flat).toContain("kalkulator");
}

test.describe("JSON-LD persistence across client-side navigation", () => {
  test("/ -> /kalkulator -> / menjaga JSON-LD sesuai per route", async ({ page }) => {
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await assertHomeJsonLd(page);

    await clientNavigate(page, "/kalkulator");
    await assertKalkulatorJsonLd(page);

    // Balik ke Beranda - BreadcrumbList milik Kalkulator harus lepas
    await clientNavigate(page, "/");
    await assertHomeJsonLd(page);
  });

  test("/kalkulator -> / (mulai dari route dalam) tetap benar tanpa reload", async ({ page }) => {
    await page.goto(`${BASE}/kalkulator`, { waitUntil: "networkidle" });
    await assertKalkulatorJsonLd(page);

    await clientNavigate(page, "/");
    await assertHomeJsonLd(page);
  });

  test("bolak-balik / <-> /kalkulator tidak menggandakan WebApplication/BreadcrumbList", async ({ page }) => {
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });

    for (let i = 0; i < 3; i++) {
      await clientNavigate(page, "/kalkulator");
      const kBlocks = await readJsonLdBlocks(page);
      expect(countType(kBlocks, "WebApplication"), `WebApplication iter ${i} /kalkulator`).toBe(1);
      expect(countType(kBlocks, "BreadcrumbList"), `BreadcrumbList iter ${i} /kalkulator`).toBe(1);

      await clientNavigate(page, "/");
      const hBlocks = await readJsonLdBlocks(page);
      expect(countType(hBlocks, "WebApplication"), `WebApplication iter ${i} /`).toBe(1);
      expect(countType(hBlocks, "BreadcrumbList"), `BreadcrumbList iter ${i} / harus 0`).toBe(0);
    }
  });
});
