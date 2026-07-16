import { test, expect } from "@playwright/test";

/**
 * Memverifikasi bahwa SEMUA rute publik merender blok JSON-LD schema.org
 * yang valid di HTML yang dikirim server (raw response), bukan hanya
 * halaman Beranda dan Kalkulator.
 *
 * Karena aplikasi ini adalah SPA (Vite + React Router), server mengirim
 * index.html yang sama untuk setiap rute publik. Kontrak yang diuji:
 * - GET <route> → status 200 dan Content-Type text/html
 * - Body memuat minimal satu <script type="application/ld+json">
 * - Setiap blok valid JSON dan memiliki @context = "https://schema.org"
 * - Terdapat minimal satu blok bertipe WebSite dan satu blok bertipe WebPage
 */

const BASE = "http://localhost:8080";

const PUBLIC_ROUTES = ["/", "/kalkulator", "/tabungan", "/edukasi", "/pengingat"] as const;

type JsonLd = Record<string, unknown> & {
  "@context"?: string;
  "@type"?: string | string[];
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

test.describe("JSON-LD tersedia di server HTML untuk semua rute publik", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`GET ${route} merender JSON-LD valid`, async ({ request }) => {
      const res = await request.get(`${BASE}${route}`, { maxRedirects: 0 });
      expect(res.status(), `${route} harus 200`).toBe(200);
      const ctype = res.headers()["content-type"] ?? "";
      expect(ctype, `${route} harus text/html`).toMatch(/text\/html/i);

      const html = await res.text();
      const blocks = extractJsonLd(html);

      expect(blocks.length, `${route} wajib memuat minimal 1 blok JSON-LD`).toBeGreaterThan(0);

      for (const b of blocks) {
        expect(b["@context"], `${route}: setiap blok wajib @context schema.org`).toBe("https://schema.org");
        expect(b["@type"], `${route}: setiap blok wajib memiliki @type`).toBeTruthy();
      }

      const hasWebSite = blocks.some((b) => hasType(b, "WebSite"));
      const hasWebPage = blocks.some((b) => hasType(b, "WebPage"));
      expect(hasWebSite, `${route}: minimal 1 blok WebSite`).toBe(true);
      expect(hasWebPage, `${route}: minimal 1 blok WebPage`).toBe(true);
    });
  }
});
