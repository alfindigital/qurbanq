import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  AA,
  contrastRatio,
  extractCssVars,
  hslTokenToRgb,
} from "@/lib/contrast";

const css = readFileSync(resolve(process.cwd(), "src/index.css"), "utf8");

/** Pasangan token yang benar-benar dipakai di UI (foreground di atas background). */
const PAIRS: Array<{ fg: string; bg: string; min: number; note: string }> = [
  { fg: "foreground", bg: "background", min: AA.text, note: "teks utama di atas background" },
  { fg: "card-foreground", bg: "card", min: AA.text, note: "teks di atas kartu" },
  { fg: "popover-foreground", bg: "popover", min: AA.text, note: "teks di atas popover" },
  { fg: "muted-foreground", bg: "background", min: AA.text, note: "teks muted di atas background" },
  { fg: "muted-foreground", bg: "card", min: AA.text, note: "teks muted di atas kartu" },
  { fg: "muted-foreground", bg: "muted", min: AA.text, note: "teks muted di atas surface muted" },
  { fg: "primary-foreground", bg: "primary", min: AA.text, note: "teks tombol primary" },
  { fg: "secondary-foreground", bg: "secondary", min: AA.text, note: "teks blok secondary" },
  { fg: "accent-foreground", bg: "accent", min: AA.text, note: "teks di atas accent" },
  { fg: "destructive-foreground", bg: "destructive", min: AA.text, note: "teks destructive" },
  { fg: "foreground", bg: "muted", min: AA.text, note: "teks utama di atas muted" },
  { fg: "foreground", bg: "peach-soft", min: AA.text, note: "teks utama di atas surface lembut" },
  { fg: "foreground", bg: "sage-soft", min: AA.text, note: "teks utama di atas sage soft" },
  { fg: "foreground", bg: "terracotta-soft", min: AA.text, note: "teks utama di atas state aktif" },
  { fg: "forest", bg: "card", min: AA.text, note: "heading di atas kartu" },
  { fg: "primary", bg: "card", min: AA.text, note: "teks/ikon primary di atas kartu" },
  { fg: "primary", bg: "background", min: AA.text, note: "teks/ikon primary di atas background" },
  { fg: "destructive", bg: "card", min: AA.text, note: "pesan error di atas kartu" },
  // Elemen non-teks. Border/input murni dekoratif (bukan satu-satunya penanda
  // komponen), jadi hanya dijaga tetap terlihat. Focus ring wajib 3:1 (WCAG 2.4.11).
  { fg: "border", bg: "background", min: AA.decorative, note: "border di atas background" },
  { fg: "border", bg: "card", min: AA.decorative, note: "border di atas kartu" },
  { fg: "input", bg: "background", min: AA.decorative, note: "outline input" },
  { fg: "ring", bg: "background", min: AA.ui, note: "focus ring" },
  { fg: "sidebar-foreground", bg: "sidebar-background", min: AA.text, note: "teks sidebar" },
  { fg: "sidebar-primary-foreground", bg: "sidebar-primary", min: AA.text, note: "teks aktif sidebar" },
  { fg: "sidebar-accent-foreground", bg: "sidebar-accent", min: AA.text, note: "teks accent sidebar" },
];

/** CTA WhatsApp selalu memakai teks putih di atas --wa-green. */
const WHITE = "0 0% 100%";


const THEMES: Array<{ name: string; selector: string }> = [
  { name: "dark", selector: ".dark" },
  { name: "light", selector: ":root" },
];

describe.each(THEMES)("Kontras WCAG token tema $name", ({ name, selector }) => {
  const vars = extractCssVars(css, selector);

  it("mendefinisikan semua token warna yang diuji", () => {
    const needed = new Set(PAIRS.flatMap((p) => [p.fg, p.bg]));
    const missing = [...needed].filter((t) => !vars[t]);
    expect(missing, `token hilang di ${selector}`).toEqual([]);
  });

  it.each(PAIRS)(`$note ($fg / $bg) lolos ambang`, ({ fg, bg, min }) => {
    const ratio = contrastRatio(hslTokenToRgb(vars[fg]), hslTokenToRgb(vars[bg]));
    expect(
      Number(ratio.toFixed(2)),
      `[${name}] --${fg} di atas --${bg} = ${ratio.toFixed(2)}:1, minimal ${min}:1`,
    ).toBeGreaterThanOrEqual(min);
  });

  it("CTA WhatsApp (teks putih di atas --wa-green) lolos AA", () => {
    const waGreen = vars["wa-green"] ?? extractCssVars(css, ":root")["wa-green"];
    const ratio = contrastRatio(hslTokenToRgb(WHITE), hslTokenToRgb(waGreen));
    expect(
      Number(ratio.toFixed(2)),
      `[${name}] putih di atas --wa-green = ${ratio.toFixed(2)}:1`,
    ).toBeGreaterThanOrEqual(AA.text);
  });
});

