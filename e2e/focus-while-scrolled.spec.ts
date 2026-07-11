import { test, expect } from "../playwright-fixture";

// BottomNav is position:fixed, so Tab/Shift+Tab focus order must not skip or
// stall while the underlying page is scrolled to arbitrary offsets.
const ariaLabels = [
  "Halaman utama Qurbanku",
  "Kalkulator qurban",
  "Rencana tabungan qurban",
  "Materi edukasi qurban",
  "Pengingat qurban",
];

const nav = (page: import("@playwright/test").Page) =>
  page.getByRole("navigation", { name: "Navigasi utama" });

test.describe("BottomNav focus order while page is scrolled", () => {
  const offsets = [0, 400, 1200];

  for (const offset of offsets) {
    test(`Tab walks all 5 links at scrollY=${offset}`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 780 });
      await page.goto("/edukasi");

      // Ensure content is tall enough, then set scroll offset
      await page.evaluate((y) => {
        document.body.style.minHeight = "3000px";
        window.scrollTo(0, y);
      }, offset);
      await page.waitForFunction((y) => window.scrollY === y, offset);

      const links = nav(page).getByRole("link");
      await links.first().focus();

      for (let i = 0; i < ariaLabels.length; i++) {
        const active = await page.evaluate(
          () => document.activeElement?.getAttribute("aria-label") ?? ""
        );
        expect(active, `at index ${i} (scrollY=${offset})`).toBe(ariaLabels[i]);

        // Focus indicator must remain visible mid-scroll
        const shadow = await page.evaluate(
          () => getComputedStyle(document.activeElement as Element).boxShadow
        );
        expect(shadow).not.toBe("none");
        expect(shadow).toContain("inset");

        // Scroll offset must not be perturbed by focus (no scroll-jack)
        const scrollY = await page.evaluate(() => window.scrollY);
        expect(scrollY).toBe(offset);

        if (i < ariaLabels.length - 1) await page.keyboard.press("Tab");
      }
    });

    test(`Shift+Tab walks all 5 links in reverse at scrollY=${offset}`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 780 });
      await page.goto("/edukasi");

      await page.evaluate((y) => {
        document.body.style.minHeight = "3000px";
        window.scrollTo(0, y);
      }, offset);
      await page.waitForFunction((y) => window.scrollY === y, offset);

      const links = nav(page).getByRole("link");
      await links.last().focus();

      for (let i = ariaLabels.length - 1; i >= 0; i--) {
        const active = await page.evaluate(
          () => document.activeElement?.getAttribute("aria-label") ?? ""
        );
        expect(active, `reverse at index ${i} (scrollY=${offset})`).toBe(ariaLabels[i]);
        if (i > 0) await page.keyboard.press("Shift+Tab");
      }
    });
  }
});
