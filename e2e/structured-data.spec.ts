import { test, expect } from "@playwright/test";

/**
 * Memastikan structured data (schema.org JSON-LD) tersedia dan sesuai untuk
 * Beranda dan Kalkulator, sehingga preview / SEO lebih jelas untuk crawler.
 *
 * Kontrak:
 * - index.html menyertakan sitewide WebSite + Organization JSON-LD.
 * - Setelah hydrate, Beranda "/" harus memiliki JSON-LD dengan @type WebApplication.
 * - Setelah hydrate, "/kalkulator" harus memiliki JSON-LD dengan @type WebApplication
 *   dan BreadcrumbList.
 * - Semua blok JSON-LD valid JSON dan memiliki @context = https://schema.org.
 */

const BASE = "http://localhost:8080";

type Json = Record<string, unknown>;

async function readJsonLd(page: import("@playwright/test").Page): Promise<Json[]> {
  const raw = await page.locator('head >> script[type="application/ld+json"]').allTextContents();
  return raw.map((t) => {
    try {
      return JSON.parse(t) as Json;
    } catch {
      throw new Error(`Invalid JSON-LD block: ${t.slice(0, 120)}`);
    }
  });
}

test.describe("Structured data (JSON-LD)", () => {
  test("index.html source memuat WebSite + Organization", async ({ request }) => {
    const res = await request.get(`${BASE}/`);
    const html = await res.text();
    const matches = [...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)];
    expect(matches.length, "index.html harus memiliki minimal 2 blok JSON-LD sitewide").toBeGreaterThanOrEqual(2);
    const parsed = matches.map((m) => JSON.parse(m[1]) as Json);
    const types = parsed.map((p) => p["@type"]);
    expect(types).toContain("WebSite");
    expect(types).toContain("Organization");
    for (const p of parsed) {
      expect(p["@context"]).toBe("https://schema.org");
    }
  });

  test("Beranda memiliki JSON-LD WebApplication", async ({ page }) => {
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    const blocks = await readJsonLd(page);
    const app = blocks.find((b) => b["@type"] === "WebApplication");
    expect(app, "WebApplication JSON-LD harus ada di Beranda").toBeTruthy();
    expect(app!["@context"]).toBe("https://schema.org");
    expect(app!["name"]).toBeTruthy();
    expect(app!["url"]).toBe("https://qurban-q.lovable.app/");
    // Sitewide juga tetap ada
    const types = blocks.map((b) => b["@type"]);
    expect(types).toContain("WebSite");
    expect(types).toContain("Organization");
  });

  test("Kalkulator memiliki JSON-LD WebApplication + BreadcrumbList", async ({ page }) => {
    await page.goto(`${BASE}/kalkulator`, { waitUntil: "networkidle" });
    const blocks = await readJsonLd(page);
    const app = blocks.find((b) => b["@type"] === "WebApplication");
    const crumbs = blocks.find((b) => b["@type"] === "BreadcrumbList");
    expect(app, "WebApplication JSON-LD harus ada di Kalkulator").toBeTruthy();
    expect(crumbs, "BreadcrumbList JSON-LD harus ada di Kalkulator").toBeTruthy();

    expect(app!["url"]).toBe("https://qurban-q.lovable.app/kalkulator");
    expect(app!["applicationCategory"]).toBeTruthy();

    const items = crumbs!["itemListElement"] as Array<Record<string, unknown>>;
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThanOrEqual(2);
    expect(items[0]["position"]).toBe(1);
    expect(items[items.length - 1]["item"]).toBe("https://qurban-q.lovable.app/kalkulator");
  });
});
