import { test, expect } from "../playwright-fixture";

// Contract: every custom outline icon (BottomNav MosqueIcon + AnimalIcons)
// must render with stroke-width="1.8" at every breakpoint. Lucide icons
// aren't checked here — they're built-in and set via the strokeWidth prop.
const viewports = [
  { name: "mobile", width: 390, height: 780 },
  { name: "tablet", width: 820, height: 1180 },
  { name: "desktop", width: 1280, height: 800 },
];

const readStrokes = (page: import("@playwright/test").Page, selector: string) =>
  page.locator(selector).evaluateAll((svgs) =>
    svgs.map((svg) => ({
      attr: svg.getAttribute("stroke-width"),
      computed: getComputedStyle(svg).strokeWidth,
    }))
  );

test.describe("Outline icons always use strokeWidth 1.8", () => {
  for (const vp of viewports) {
    test(`BottomNav MosqueIcon @ ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/");

      // The Beranda link is the first NavLink; MosqueIcon is its <svg>.
      const beranda = page.locator('a[aria-label="Halaman utama Qurbanku"] svg');
      await expect(beranda).toHaveCount(1);
      const [mosque] = await readStrokes(page, 'a[aria-label="Halaman utama Qurbanku"] svg');
      expect(mosque.attr).toBe("1.8");
    });

    test(`AnimalIcons on Kalkulator @ ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/kalkulator");

      // 4 animal buttons in step 1 — each hosts one custom outline svg.
      // Tunggu semua tombol ter-render sebelum membaca atribut.
      await expect(page.locator('button[aria-pressed] svg[role="img"]')).toHaveCount(4);
      const svgs = await readStrokes(page, 'button[aria-pressed] svg[role="img"]');
      expect(svgs.length).toBe(4);
      for (const s of svgs) expect(s.attr).toBe("1.8");
    });

    test(`AnimalIcons on Beranda @ ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/");

      await expect(page.locator('button[aria-pressed] svg[role="img"]')).toHaveCount(4);
      const svgs = await readStrokes(page, 'button[aria-pressed] svg[role="img"]');
      expect(svgs.length).toBe(4);
      for (const s of svgs) expect(s.attr).toBe("1.8");
    });
  }

  test("aria-label & <title> exposed on every AnimalIcon", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 780 });
    await page.goto("/kalkulator");

    const labels = await page
      .locator('button[aria-pressed] svg[role="img"]')
      .evaluateAll((svgs) =>
        svgs.map((svg) => ({
          ariaLabel: svg.getAttribute("aria-label"),
          titleText: svg.querySelector("title")?.textContent ?? null,
        }))
      );
    expect(labels).toEqual([
      { ariaLabel: "Ikon kambing", titleText: "Ikon kambing" },
      { ariaLabel: "Ikon domba", titleText: "Ikon domba" },
      { ariaLabel: "Ikon sapi", titleText: "Ikon sapi" },
      { ariaLabel: "Ikon unta", titleText: "Ikon unta" },
    ]);
  });
});
