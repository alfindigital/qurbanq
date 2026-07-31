import { test, expect } from "../playwright-fixture";
import { devices } from "@playwright/test";

// Focus order must remain stable when the device rotates (portrait ↔ landscape)
// on iPhone (notch) and Android (gesture bar) form factors.
const rigs = [
  {
    name: "iPhone 14 Pro",
    portrait: { width: 393, height: 852 },
    landscape: { width: 852, height: 393 },
    userAgent: devices["iPhone 13 Pro"].userAgent,
  },
  {
    name: "Pixel 7",
    portrait: { width: 412, height: 915 },
    landscape: { width: 915, height: 412 },
    userAgent: devices["Pixel 7"]?.userAgent ?? devices["Pixel 5"].userAgent,
  },
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

const assertForwardOrder = async (page: import("@playwright/test").Page) => {
  const links = nav(page).getByRole("link");
  await links.first().focus();
  for (let i = 0; i < ariaLabels.length; i++) {
    const active = await page.evaluate(
      () => document.activeElement?.getAttribute("aria-label") ?? ""
    );
    expect(active).toBe(ariaLabels[i]);
    if (i < ariaLabels.length - 1) await page.keyboard.press("Tab");
  }
};

for (const rig of rigs) {
  test(`focus order survives rotation on ${rig.name}`, async ({ browser }) => {
    const context = await browser.newContext({
      viewport: rig.portrait,
      userAgent: rig.userAgent,
      hasTouch: true,
      isMobile: true,
      deviceScaleFactor: 3,
    });
    const page = await context.newPage();

    await page.goto("/");
    await expect(nav(page)).toBeVisible();
    await assertForwardOrder(page);

    // Rotate to landscape
    await page.setViewportSize(rig.landscape);
    await expect(nav(page)).toBeVisible();
    await assertForwardOrder(page);

    // Rotate back to portrait
    await page.setViewportSize(rig.portrait);
    await assertForwardOrder(page);

    await context.close();
  });
}
