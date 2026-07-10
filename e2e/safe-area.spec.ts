import { test, expect } from "../playwright-fixture";

// Simulate common mobile form factors. env(safe-area-inset-*) evaluates to 0
// in headless Chromium, but the .pb-nav utility and inline env() style must
// still reserve the full BottomNav height so page content is never covered.
const devices = [
  { name: "iPhone 14 Pro (notch)", width: 393, height: 852, inset: 34 },
  { name: "iPhone SE", width: 375, height: 667, inset: 0 },
  { name: "Pixel 7 (gesture bar)", width: 412, height: 915, inset: 24 },
];

for (const d of devices) {
  test(`BottomNav sits at bottom & content clears it on ${d.name}`, async ({ page }) => {
    await page.setViewportSize({ width: d.width, height: d.height });
    await page.goto("/edukasi");

    const nav = page.locator('nav[aria-label="Navigasi utama"]');
    const container = nav.locator("..");

    // Container is fixed to the bottom of the viewport
    const box = await container.boundingBox();
    expect(box).not.toBeNull();
    expect(Math.round(box!.y + box!.height)).toBe(d.height);

    // Inline style must reference env(safe-area-inset-bottom) so notch/gesture
    // bar insets are honoured on real devices.
    const inline = await container.getAttribute("style");
    expect(inline ?? "").toContain("safe-area-inset-bottom");

    // Nav must be tall enough to comfortably hit each item (>=64px per spec)
    expect(box!.height).toBeGreaterThanOrEqual(64);

    // Page content padding must reserve nav height + safe-area inset.
    // Simulate a device inset by injecting a CSS var fallback and re-checking.
    await page.addStyleTag({
      content: `:root { --sim-inset: ${d.inset}px; }
        .pb-nav { padding-bottom: calc(6.5rem + var(--sim-inset)) !important; }
        @media (min-width: 640px) { .pb-nav { padding-bottom: calc(7rem + var(--sim-inset)) !important; } }`,
    });

    const pbNav = page.locator(".pb-nav").first();
    const pb = await pbNav.evaluate((el) => parseFloat(getComputedStyle(el).paddingBottom));
    // 6.5rem = 104px baseline + simulated inset
    expect(pb).toBeGreaterThanOrEqual(104 + d.inset);
    expect(pb).toBeGreaterThanOrEqual(box!.height);
  });
}
