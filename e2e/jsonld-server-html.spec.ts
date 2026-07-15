import { test, expect } from "@playwright/test";

/**
 * Memverifikasi JSON-LD schema.org untuk halaman Beranda dan Kalkulator
 * benar-benar ada dan valid di HTML yang dikirim server (raw response),
 * bukan hanya diinject client-side via Helmet.
 *
 * Kontrak:
 * - GET / dan GET /kalkulator sama-sama status 200 dengan Content-Type text/html.
 * - Response body memuat blok <script type="application/ld+json"> untuk:
 *     * WebPage Beranda   -> url https://qurban-q.lovable.app/
 *     * WebPage Kalkulator -> url https://qurban-q.lovable.app/kalkulator
 * - Setiap blok JSON-LD parse sebagai JSON valid dan memiliki
 *   @context = "https://schema.org".
 */

const BASE = "http://localhost:8080";
const SITE = "https://qurban-q.lovable.app";

type JsonLd = Record<string, unknown> & {
  "@context"?: string;
  "@type"?: string | string[];
  url?: string;
};

function extractJsonLd(html: string): JsonLd[] {
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const blocks: JsonLd[] = [];
  for (const match of html.matchAll(re)) {
    const raw = match[1].trim();
    expect(raw.length, "blok JSON-LD tidak boleh kosong").toBeGreaterThan(0);
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      throw new Error(`JSON-LD tidak valid JSON: ${(err as Error).message}\nBody: ${raw.slice(0, 200)}`);
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
  return Array.isArray(t) ? t.includes(type) : t === type;
}

async function fetchHtml(request: import("@playwright/test").APIRequestContext, path: string) {
  const res = await request.get(`${BASE}${path}`, { maxRedirects: 0 });
  expect(res.status(), `${path} harus 200`).toBe(200);
  const ctype = res.headers()["content-type"] ?? "";
  expect(ctype, `${path} harus text/html`).toMatch(/text\/html/i);
  return res.text();
}

test.describe("JSON-LD di server-rendered HTML", () => {
  test("index.html memuat WebPage Beranda + Kalkulator yang valid", async ({ request }) => {
    const html = await fetchHtml(request, "/");
    const blocks = extractJsonLd(html);

    expect(blocks.length, "minimal 3 blok JSON-LD (WebSite/Organization + 2 WebPage)").toBeGreaterThanOrEqual(3);

    for (const b of blocks) {
      expect(b["@context"], "setiap blok JSON-LD wajib @context schema.org").toBe("https://schema.org");
    }

    const webPages = blocks.filter((b) => hasType(b, "WebPage"));
    expect(webPages.length, "harus ada 2 WebPage (Beranda + Kalkulator)").toBeGreaterThanOrEqual(2);

    const beranda = webPages.find((b) => b.url === `${SITE}/`);
    const kalkulator = webPages.find((b) => b.url === `${SITE}/kalkulator`);
    expect(beranda, "WebPage Beranda wajib ada").toBeTruthy();
    expect(kalkulator, "WebPage Kalkulator wajib ada").toBeTruthy();

    for (const wp of [beranda!, kalkulator!]) {
      expect(typeof wp["name"]).toBe("string");
      expect((wp["name"] as string).length).toBeGreaterThan(0);
      expect(typeof wp["description"]).toBe("string");
      expect((wp["description"] as string).length).toBeGreaterThan(0);
    }
  });

  test("GET /kalkulator (raw) juga mengirim JSON-LD Beranda + Kalkulator", async ({ request }) => {
    const html = await fetchHtml(request, "/kalkulator");
    const blocks = extractJsonLd(html);
    const urls = blocks.filter((b) => hasType(b, "WebPage")).map((b) => b.url);
    expect(urls).toContain(`${SITE}/`);
    expect(urls).toContain(`${SITE}/kalkulator`);
    for (const b of blocks) {
      expect(b["@context"]).toBe("https://schema.org");
    }
  });
});
