import { test, expect } from "@playwright/test";

/**
 * Pengecekan otomatis kontras WCAG pada komponen yang benar-benar ter-render
 * di dark mode. Berbeda dari unit test token (yang menguji palet), spec ini
 * memindai setiap elemen teks di semua halaman utama, mengkomposit warna
 * semi-transparan ke background efektifnya, lalu menghitung rasio kontras.
 */

const ROUTES = ["/", "/kalkulator", "/tabungan", "/pengingat", "/edukasi", "/donasi"];

const SCAN = `() => {
  const parse = (v) => {
    const n = (v || "").match(/-?[\\d.]+/g);
    if (!n || n.length < 3) return null;
    return { r: +n[0], g: +n[1], b: +n[2], a: n.length > 3 ? +n[3] : 1 };
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => {
    const l1 = lum(a), l2 = lum(b);
    const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
    return (hi + 0.05) / (lo + 0.05);
  };
  const blend = (fg, bg) => ({
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  });
  const effectiveBg = (el) => {
    let node = el;
    let acc = null;
    while (node) {
      const c = parse(getComputedStyle(node).backgroundColor);
      if (c && c.a > 0) acc = acc ? blend(acc, c) : c;
      if (acc && acc.a >= 0.999) return acc;
      node = node.parentElement;
    }
    const base = { r: 255, g: 255, b: 255, a: 1 };
    return acc ? blend(acc, base) : base;
  };

  const failures = [];
  const els = Array.from(document.querySelectorAll("body *"));
  for (const el of els) {
    const hasText = Array.from(el.childNodes).some(
      (n) => n.nodeType === 3 && n.textContent && n.textContent.trim().length > 1
    );
    if (!hasText) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || +cs.opacity < 0.15) continue;
    const fgRaw = parse(cs.color);
    if (!fgRaw || fgRaw.a === 0) continue;
    const bg = effectiveBg(el);
    const fg = blend({ ...fgRaw, a: fgRaw.a * Math.min(1, +cs.opacity || 1) }, bg);
    const size = parseFloat(cs.fontSize);
    const weight = parseInt(cs.fontWeight, 10) || 400;
    const isLarge = size >= 24 || (size >= 18.66 && weight >= 700);
    const min = isLarge ? 3 : 4.5;
    const r = ratio(fg, bg);
    if (r + 0.01 < min) {
      failures.push({
        text: (el.textContent || "").trim().slice(0, 45),
        tag: el.tagName.toLowerCase(),
        cls: (el.className && el.className.toString().slice(0, 70)) || "",
        ratio: Math.round(r * 100) / 100,
        min,
        size: Math.round(size),
      });
    }
  }
  return failures;
}`;

for (const route of ROUTES) {
  test(`kontras dark mode lolos WCAG AA di ${route}`, async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("theme", "dark"));
    await page.goto(route, { waitUntil: "networkidle" });
    await expect(page.locator("html.dark")).toHaveCount(1);
    await page.waitForTimeout(400); // tunggu animasi framer-motion selesai

    const failures = await page.evaluate(SCAN);
    expect(
      failures,
      `Kontras di bawah ambang WCAG AA pada ${route}:\n` +
        failures.map((f) => `  ${f.ratio}:1 (min ${f.min}) <${f.tag}> ${f.size}px "${f.text}" [${f.cls}]`).join("\n"),
    ).toEqual([]);
  });
}
