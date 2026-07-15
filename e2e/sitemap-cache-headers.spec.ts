import { test, expect } from "@playwright/test";

/**
 * Memverifikasi sitemap.xml mengirim header cache yang wajar
 * (ETag atau Last-Modified) dan nilainya konsisten saat hard reload.
 */

const BASE = "http://localhost:8080";

test.describe("sitemap.xml: cache headers dan konsistensi hard reload", () => {
  test("sitemap.xml mengirim ETag atau Last-Modified", async ({ request }) => {
    const res = await request.get(`${BASE}/sitemap.xml`);
    expect(res.status(), "sitemap.xml harus 200").toBe(200);

    const headers = res.headers();
    const etag = headers["etag"] ?? headers["ETag"] ?? "";
    const lastModified = headers["last-modified"] ?? headers["Last-Modified"] ?? "";

    expect(
      etag || lastModified,
      "sitemap.xml harus mengirim ETag atau Last-Modified",
    ).toBeTruthy();

    if (etag) {
      expect(etag.trim().length, "ETag tidak boleh kosong").toBeGreaterThan(0);
    }
    if (lastModified) {
      expect(lastModified.trim().length, "Last-Modified tidak boleh kosong").toBeGreaterThan(0);
      expect(
        new Date(lastModified).toString(),
        "Last-Modified harus berupa tanggal valid",
      ).not.toBe("Invalid Date");
    }
  });

  test("ETag dan Last-Modified tetap konsisten saat hard reload", async ({ request }) => {
    const first = await request.get(`${BASE}/sitemap.xml`);
    expect(first.status(), "request pertama harus 200").toBe(200);

    const firstHeaders = first.headers();
    const firstEtag = (firstHeaders["etag"] ?? "").toLowerCase();
    const firstLastModified = (firstHeaders["last-modified"] ?? "").toLowerCase();

    expect(
      firstEtag || firstLastModified,
      "sitemap.xml harus memiliki ETag atau Last-Modified pada request pertama",
    ).toBeTruthy();

    // Simulasikan hard reload: paksa revalidasi cache dengan header no-cache
    const second = await request.get(`${BASE}/sitemap.xml`, {
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });
    expect(second.status(), "request kedua (hard reload) harus 200").toBe(200);

    const secondHeaders = second.headers();
    const secondEtag = (secondHeaders["etag"] ?? "").toLowerCase();
    const secondLastModified = (secondHeaders["last-modified"] ?? "").toLowerCase();

    expect(
      secondEtag || secondLastModified,
      "sitemap.xml harus mempertahankan ETag atau Last-Modified saat hard reload",
    ).toBeTruthy();

    if (firstEtag) {
      expect(
        secondEtag,
        `ETag harus konsisten: pertama "${firstEtag}", kedua "${secondEtag}"`,
      ).toBe(firstEtag);
    }

    if (firstLastModified) {
      expect(
        secondLastModified,
        `Last-Modified harus konsisten: pertama "${firstLastModified}", kedua "${secondLastModified}"`,
      ).toBe(firstLastModified);
    }
  });
});
