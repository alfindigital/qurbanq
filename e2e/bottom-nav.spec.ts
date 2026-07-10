import { test, expect } from "../playwright-fixture";

// Accessible name for each link comes from aria-label in BottomNav.tsx.
const items = [
  { label: "Beranda", ariaLabel: "Halaman utama Qurbanku", path: "/" },
  { label: "Hitung", ariaLabel: "Kalkulator qurban", path: "/kalkulator" },
  { label: "Tabung", ariaLabel: "Rencana tabungan qurban", path: "/tabungan" },
  { label: "Edukasi", ariaLabel: "Materi edukasi qurban", path: "/edukasi" },
  { label: "Ingat", ariaLabel: "Pengingat qurban", path: "/pengingat" },
];

const nav = (page: import("@playwright/test").Page) =>
  page.getByRole("navigation", { name: "Navigasi utama" });

test.describe("BottomNav — routing & scroll-to-top", () => {
  test("switches route for every menu item", async ({ page }) => {
    await page.goto("/");
    await expect(nav(page)).toBeVisible();

    for (const item of items) {
      await nav(page).getByRole("link", { name: item.ariaLabel }).click();
      await expect(page).toHaveURL(new RegExp(`${item.path.replace(/\//g, "\\/")}$`));
    }
  });

  test("scrolls to top after route change", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 780 });
    await page.goto("/edukasi");
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForFunction(() => window.scrollY > 100);

    await nav(page).getByRole("link", { name: "Kalkulator qurban" }).click();
    await expect(page).toHaveURL(/\/kalkulator$/);
    await page.waitForFunction(() => window.scrollY === 0);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });
});

test.describe("BottomNav — keyboard navigation & focus", () => {
  for (const viewport of [
    { name: "mobile", width: 390, height: 780 },
    { name: "tablet", width: 820, height: 1180 },
    { name: "desktop", width: 1280, height: 800 },
  ]) {
    test(`focus order matches menu order on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto("/");

      const links = nav(page).getByRole("link");
      await expect(links).toHaveCount(items.length);

      await links.first().focus();
      for (let i = 0; i < items.length; i++) {
        const active = await page.evaluate(
          () => document.activeElement?.getAttribute("aria-label") ?? ""
        );
        expect(active).toBe(items[i].ariaLabel);
        if (i < items.length - 1) await page.keyboard.press("Tab");
      }
    });

    test(`Shift+Tab reverses focus order on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto("/");

      const links = nav(page).getByRole("link");
      await links.last().focus();

      for (let i = items.length - 1; i >= 0; i--) {
        const active = await page.evaluate(
          () => document.activeElement?.getAttribute("aria-label") ?? ""
        );
        expect(active).toBe(items[i].ariaLabel);

        // Focus ring must be present on every stop, not just the first
        const shadow = await page.evaluate(
          () => getComputedStyle(document.activeElement as Element).boxShadow
        );
        expect(shadow).not.toBe("none");
        expect(shadow).toContain("inset");

        if (i > 0) await page.keyboard.press("Shift+Tab");
      }
    });

    test(`Tab past last item leaves the nav on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto("/");

      await nav(page).getByRole("link").last().focus();
      await page.keyboard.press("Tab");

      const stillInNav = await page.evaluate(() =>
        !!document
          .querySelector('nav[aria-label="Navigasi utama"]')
          ?.contains(document.activeElement)
      );
      expect(stillInNav).toBe(false);
    });

    test(`focus ring visible & Enter activates link on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto("/");

      const target = nav(page).getByRole("link", { name: "Rencana tabungan qurban" });
      await target.focus();

      const shadow = await target.evaluate((el) => getComputedStyle(el).boxShadow);
      // Tailwind ring-* renders as an inset box-shadow; must not be "none".
      expect(shadow).not.toBe("none");
      expect(shadow).toContain("inset");

      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(/\/tabungan$/);
    });
  }
});
