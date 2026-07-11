import { test, expect } from "../playwright-fixture";

// Guards focus indicator against regressions across viewports via pixel snapshots
// AND a computed-style contract check on each focusable BottomNav link.
const viewports = [
  { name: "mobile", width: 390, height: 780 },
  { name: "tablet", width: 820, height: 1180 },
  { name: "desktop", width: 1280, height: 800 },
];

const ariaLabels = [
  "Halaman utama Qurbanku",
  "Kalkulator qurban",
  "Rencana tabungan qurban",
  "Materi edukasi qurban",
  "Pengingat qurban",
];

const nav = (page: import("@playwright/test").Page) =>
  page.getByRole("navigation", { name: "Navigasi utama" });

test.describe("Focus indicator — consistent across viewports", () => {
  for (const vp of viewports) {
    test(`focus ring visible on every BottomNav item @ ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/");

      for (const label of ariaLabels) {
        const link = nav(page).getByRole("link", { name: label });
        await link.focus();

        // Contract: focus-visible must produce an inset ring (Tailwind ring-inset).
        const shadow = await link.evaluate((el) => getComputedStyle(el).boxShadow);
        expect(shadow, `focus ring missing for "${label}" @ ${vp.name}`).not.toBe("none");
        expect(shadow).toContain("inset");

        // Pixel snapshot of the focused item — regressions in colour/width/offset fail.
        expect(await link.screenshot()).toMatchSnapshot(
          `focus-${vp.name}-${label.replace(/\s+/g, "-").toLowerCase()}.png`,
          { maxDiffPixelRatio: 0.02 }
        );
      }
    });
  }
});
