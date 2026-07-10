import { test, expect } from "../playwright-fixture";

const items = [
  { label: "Beranda", path: "/" },
  { label: "Hitung", path: "/kalkulator" },
  { label: "Tabung", path: "/tabungan" },
  { label: "Edukasi", path: "/edukasi" },
  { label: "Ingat", path: "/pengingat" },
];

test.describe("BottomNav — routing & scroll-to-top", () => {
  test("switches route for every menu item", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Navigasi utama" });
    await expect(nav).toBeVisible();

    for (const item of items) {
      await nav.getByRole("link", { name: new RegExp(item.label, "i") }).click();
      await expect(page).toHaveURL(new RegExp(`${item.path.replace("/", "\\/")}$`));
    }
  });

  test("scrolls to top after route change", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 780 });
    await page.goto("/edukasi");
    // Force scroll down
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForFunction(() => window.scrollY > 100);

    await page
      .getByRole("navigation", { name: "Navigasi utama" })
      .getByRole("link", { name: /Hitung/i })
      .click();

    await expect(page).toHaveURL(/\/kalkulator$/);
    await page.waitForFunction(() => window.scrollY === 0);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });
});

test.describe("BottomNav — keyboard navigation", () => {
  for (const viewport of [
    { name: "mobile", width: 390, height: 780 },
    { name: "tablet", width: 820, height: 1180 },
    { name: "desktop", width: 1280, height: 800 },
  ]) {
    test(`focus order matches menu order on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto("/");

      const nav = page.getByRole("navigation", { name: "Navigasi utama" });
      const links = nav.getByRole("link");
      await expect(links).toHaveCount(items.length);

      // Focus the first nav link directly, then Tab through the rest.
      await links.first().focus();
      for (let i = 0; i < items.length; i++) {
        const active = await page.evaluate(
          () => document.activeElement?.getAttribute("aria-label") ?? ""
        );
        expect(active.toLowerCase()).toContain(items[i].label.toLowerCase().slice(0, 4));
        if (i < items.length - 1) await page.keyboard.press("Tab");
      }
    });

    test(`focus ring is visible & Enter navigates on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto("/");

      const target = page
        .getByRole("navigation", { name: "Navigasi utama" })
        .getByRole("link", { name: /Tabung/i });
      await target.focus();

      // focus-visible must render a ring (box-shadow from Tailwind ring-*)
      const shadow = await target.evaluate(
        (el) => getComputedStyle(el).boxShadow
      );
      expect(shadow).not.toBe("none");

      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(/\/tabungan$/);
    });
  }
});
