import { test, expect } from "../playwright-fixture";

// Verifies hover/active/selected visual contract on BottomNav icons is
// consistent across mobile, tablet, and desktop breakpoints.
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

// The active NavLink applies `bg-muted text-primary`; hover applies
// `bg-muted/50 text-foreground`; idle is `text-muted-foreground`.
// We assert *distinct* colours between the three states rather than exact
// hex, so token changes don't invalidate the test.
const getColors = (page: import("@playwright/test").Page, label: string) =>
  page.evaluate((lbl) => {
    const el = document.querySelector(`a[aria-label="${lbl}"]`) as HTMLElement | null;
    if (!el) return null;
    const s = getComputedStyle(el);
    // Icon inherits `currentColor` so link color === svg stroke color.
    const svg = el.querySelector("svg");
    const svgColor = svg ? getComputedStyle(svg).color : "";
    return { color: s.color, bg: s.backgroundColor, svgColor };
  }, label);

test.describe("BottomNav hover/active/selected consistency", () => {
  for (const vp of viewports) {
    test(`state transitions on ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/edukasi"); // start on non-Beranda so Beranda is idle

      const beranda = nav(page).getByRole("link", { name: ariaLabels[0] });
      const hitung = nav(page).getByRole("link", { name: ariaLabels[1] });

      // Idle Beranda
      const idle = await getColors(page, ariaLabels[0]);
      expect(idle).not.toBeNull();

      // Selected — Edukasi is active on this route
      const selected = await getColors(page, ariaLabels[3]);
      expect(selected).not.toBeNull();
      // Selected must differ from idle in text/icon color
      expect(selected!.color).not.toBe(idle!.color);
      // SVG inherits the link's color
      expect(selected!.svgColor).toBe(selected!.color);
      // aria-current is set by react-router NavLink on the active link
      await expect(nav(page).getByRole("link", { name: ariaLabels[3] })).toHaveAttribute(
        "aria-current",
        "page"
      );

      // Hover — force :hover pseudo, background must gain a fill
      await hitung.hover();
      const hovered = await page.evaluate((lbl) => {
        const el = document.querySelector(`a[aria-label="${lbl}"]`) as HTMLElement;
        return {
          bg: getComputedStyle(el).backgroundColor,
          color: getComputedStyle(el).color,
        };
      }, ariaLabels[1]);
      // Hovered background should not be fully transparent
      expect(hovered.bg).not.toBe("rgba(0, 0, 0, 0)");
      // Hover color should differ from idle
      expect(hovered.color).not.toBe(idle!.color);

      // Active indicator bar exists exactly once (only on the selected link)
      const activeBars = await nav(page).locator("span.bg-primary").count();
      expect(activeBars).toBe(1);

      // Every icon in the nav renders at the standardized h-6 w-6 box
      const sizes = await nav(page).locator("svg").evaluateAll((els) =>
        els.map((e) => ({ w: (e as SVGElement).getBoundingClientRect().width, h: (e as SVGElement).getBoundingClientRect().height }))
      );
      expect(sizes.length).toBe(ariaLabels.length);
      for (const s of sizes) {
        // Tailwind h-6/w-6 = 1.5rem; with root 17px = 25.5px, allow tolerance
        expect(s.w).toBeGreaterThan(20);
        expect(s.w).toBeLessThan(32);
        expect(Math.abs(s.w - s.h)).toBeLessThan(1);
      }

      // Navigating changes which link owns the selected treatment
      await beranda.click();
      await expect(page).toHaveURL(/\/$/);
      await expect(nav(page).getByRole("link", { name: ariaLabels[0] })).toHaveAttribute(
        "aria-current",
        "page"
      );
      const newSelected = await getColors(page, ariaLabels[0]);
      expect(newSelected!.color).toBe(selected!.color);
    });
  }
});
