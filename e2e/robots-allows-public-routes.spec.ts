import { test, expect } from "@playwright/test";

/**
 * Memastikan robots.txt:
 * - Ada (status 200) dan Content-Type text/plain
 * - Mengandung direktif Sitemap: yang menunjuk ke sitemap.xml absolut https
 *   dan sitemap tersebut dapat diakses (200)
 * - Mengizinkan akses (Allow: /) untuk User-agent: * dan tidak
 *   memblokir global (tidak ada "Disallow: /" tanpa path lebih spesifik)
 * - Setiap route publik saya (/, /kalkulator, /tabungan, /edukasi, /pengingat)
 *   tidak di-Disallow untuk User-agent: * maupun untuk crawler utama
 *   (Googlebot, Bingbot, Twitterbot, facebookexternalhit)
 */

const BASE = "http://localhost:8080";
const SITEMAP_URL = "https://qurban-q.lovable.app/sitemap.xml";

const PUBLIC_ROUTES = ["/", "/kalkulator", "/tabungan", "/edukasi", "/pengingat"] as const;
const CRAWLERS = ["*", "Googlebot", "Bingbot", "Twitterbot", "facebookexternalhit"] as const;

interface UaBlock {
  userAgent: string;
  allow: string[];
  disallow: string[];
}

/** Parse robots.txt jadi grup per User-agent (case-insensitive pada direktif). */
function parseRobots(body: string): UaBlock[] {
  const lines = body
    .split(/\r?\n/)
    .map((l) => l.replace(/#.*$/, "").trim())
    .filter(Boolean);

  const blocks: UaBlock[] = [];
  let current: UaBlock | null = null;
  for (const line of lines) {
    const m = line.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const key = m[1].toLowerCase();
    const value = m[2].trim();
    if (key === "user-agent") {
      current = { userAgent: value, allow: [], disallow: [] };
      blocks.push(current);
    } else if (key === "allow" && current) {
      current.allow.push(value);
    } else if (key === "disallow" && current) {
      current.disallow.push(value);
    }
  }
  return blocks;
}

function blocksFor(blocks: UaBlock[], ua: string): UaBlock[] {
  return blocks.filter((b) => b.userAgent.toLowerCase() === ua.toLowerCase());
}

/**
 * Cek apakah suatu path diizinkan untuk UA tertentu.
 * Aturan sederhana yang cukup untuk kontrak ini:
 * - Jika ada Disallow yang cocok (prefix match) dan lebih spesifik dari
 *   Allow yang cocok, path dianggap diblokir.
 * - Disallow kosong ("Disallow:") artinya tidak memblokir apa-apa.
 */
function isAllowed(block: UaBlock, path: string): boolean {
  const matches = (rule: string) => rule !== "" && path.startsWith(rule);
  const longest = (rules: string[]) =>
    rules.filter(matches).reduce((max, r) => (r.length > max ? r.length : max), -1);

  const disMax = longest(block.disallow);
  const allowMax = longest(block.allow);
  if (disMax === -1) return true; // tidak ada aturan disallow yang cocok
  return allowMax >= disMax; // allow yang sama/lebih spesifik menang
}

test.describe("robots.txt: ada, referensi sitemap, dan izinkan route publik", () => {
  test("robots.txt merespon 200 dengan Content-Type text/plain", async ({ request }) => {
    const res = await request.get(`${BASE}/robots.txt`);
    expect(res.status(), "robots.txt harus 200").toBe(200);
    const ct = (res.headers()["content-type"] ?? "").toLowerCase();
    expect(ct, `content-type robots.txt: "${ct}"`).toContain("text/plain");

    const body = (await res.text()).trim();
    expect(body.length, "robots.txt tidak boleh kosong").toBeGreaterThan(0);
    expect(body, "harus memuat minimal 1 User-agent").toMatch(/user-agent\s*:/i);
  });

  test("robots.txt memuat direktif Sitemap: absolut https dan sitemap dapat diakses", async ({ request }) => {
    const res = await request.get(`${BASE}/robots.txt`);
    const body = await res.text();

    const sitemapMatches = [...body.matchAll(/^\s*sitemap\s*:\s*(\S+)\s*$/gim)].map((m) => m[1]);
    expect(sitemapMatches.length, "harus ada minimal 1 direktif Sitemap:").toBeGreaterThan(0);

    for (const url of sitemapMatches) {
      expect(url, "Sitemap URL harus absolut https").toMatch(/^https:\/\/[^\s]+\.xml$/i);
    }
    expect(sitemapMatches, "harus memuat sitemap.xml project").toContain(SITEMAP_URL);

    // Verifikasi sitemap yang dirujuk benar-benar bisa dijangkau (via origin dev)
    const sitemapRes = await request.get(`${BASE}/sitemap.xml`);
    expect(sitemapRes.status(), "sitemap.xml yang dirujuk robots.txt harus 200").toBe(200);
  });

  test("User-agent: * ada, mengizinkan /, dan tidak memblokir global", async ({ request }) => {
    const body = await (await request.get(`${BASE}/robots.txt`)).text();
    const blocks = parseRobots(body);
    const starBlocks = blocksFor(blocks, "*");

    expect(starBlocks.length, 'harus ada blok User-agent: *').toBeGreaterThan(0);

    // Tidak boleh ada global block "Disallow: /"
    for (const b of starBlocks) {
      expect(
        b.disallow.includes("/"),
        `User-agent: * tidak boleh memiliki "Disallow: /" (memblokir seluruh situs)`,
      ).toBe(false);
    }

    // Minimal salah satu Allow: / (atau tidak ada disallow sama sekali) sehingga "/" diizinkan
    const allowsRoot = starBlocks.some((b) => isAllowed(b, "/"));
    expect(allowsRoot, "User-agent: * harus mengizinkan /").toBe(true);
  });

  test("semua route publik saya diizinkan untuk crawler utama", async ({ request }) => {
    const body = await (await request.get(`${BASE}/robots.txt`)).text();
    const blocks = parseRobots(body);

    for (const ua of CRAWLERS) {
      const uaBlocks = blocksFor(blocks, ua);
      // Jika crawler tidak punya blok eksplisit (kecuali "*"), fallback ke "*"
      const applicable = uaBlocks.length > 0 ? uaBlocks : blocksFor(blocks, "*");
      expect(applicable.length, `tidak ada blok yang berlaku untuk ${ua}`).toBeGreaterThan(0);

      for (const route of PUBLIC_ROUTES) {
        const allowed = applicable.some((b) => isAllowed(b, route));
        expect(
          allowed,
          `route publik ${route} harus diizinkan untuk User-agent: ${ua}`,
        ).toBe(true);
      }
    }
  });
});
