/**
 * Utilitas kontras WCAG.
 * Dipakai oleh pengecekan otomatis (unit test token + e2e dark mode)
 * supaya semua pasangan warna di aplikasi konsisten lolos WCAG AA.
 */

export type RGB = { r: number; g: number; b: number };

/** Parse "140 38% 17%" (format token CSS) atau "hsl(140 38% 17%)" jadi RGB 0-255. */
export function hslTokenToRgb(token: string): RGB {
  const nums = token.match(/-?[\d.]+/g);
  if (!nums || nums.length < 3) throw new Error(`Token HSL tidak valid: ${token}`);
  const [h, s, l] = [Number(nums[0]), Number(nums[1]) / 100, Number(nums[2]) / 100];
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = ((h % 360) + 360) % 360 / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  const [r1, g1, b1] =
    hp < 1 ? [c, x, 0] :
    hp < 2 ? [x, c, 0] :
    hp < 3 ? [0, c, x] :
    hp < 4 ? [0, x, c] :
    hp < 5 ? [x, 0, c] : [c, 0, x];
  const m = l - c / 2;
  return { r: (r1 + m) * 255, g: (g1 + m) * 255, b: (b1 + m) * 255 };
}

/** Parse "rgb(r, g, b)" / "rgba(r, g, b, a)" hasil getComputedStyle. */
export function parseRgbString(value: string): (RGB & { a: number }) | null {
  const nums = value.match(/-?[\d.]+/g);
  if (!nums || nums.length < 3) return null;
  return {
    r: Number(nums[0]),
    g: Number(nums[1]),
    b: Number(nums[2]),
    a: nums.length > 3 ? Number(nums[3]) : 1,
  };
}

/** Komposit warna semi-transparan di atas background solid. */
export function blend(fg: RGB & { a: number }, bg: RGB): RGB {
  return {
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
  };
}

export function relativeLuminance({ r, g, b }: RGB): number {
  const f = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function contrastRatio(a: RGB, b: RGB): number {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

/** Ambang WCAG AA: 4.5 teks kecil, 3 teks besar / elemen UI & border. */
export const AA = { text: 4.5, large: 3, ui: 3 } as const;

/** Ambil semua custom property dari sebuah blok selector di file CSS. */
export function extractCssVars(css: string, selector: string): Record<string, string> {
  const idx = css.indexOf(selector);
  if (idx === -1) throw new Error(`Selector ${selector} tidak ditemukan di CSS`);
  const start = css.indexOf("{", idx);
  let depth = 0;
  let end = start;
  for (let i = start; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}") {
      depth--;
      if (depth === 0) { end = i; break; }
    }
  }
  const body = css.slice(start + 1, end);
  const vars: Record<string, string> = {};
  for (const m of body.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
    vars[m[1].trim()] = m[2].split("/*")[0].trim();
  }
  return vars;
}
