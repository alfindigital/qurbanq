#!/usr/bin/env node
/**
 * Validasi build: pastikan setiap file og-image-* yang dideklarasikan
 * (di index.html dan src/components/SEO.tsx) benar-benar ada di public/,
 * berformat sesuai og:image:type, dan berdimensi sesuai og:image:width/height.
 *
 * Dijalankan otomatis pada `vite build` lewat plugin di vite.config.ts,
 * atau manual: `node scripts/validate-og-images.mjs`
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const notes = [];

/** Baca dimensi + tipe intrinsik dari buffer JPEG/PNG/WebP/GIF. */
function readImageMeta(buf) {
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) {
    return { type: "image/png", width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length - 9) {
      if (buf[i] !== 0xff) {
        i++;
        continue;
      }
      const marker = buf[i + 1];
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { type: "image/jpeg", width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5) };
      }
      const len = buf.readUInt16BE(i + 2);
      if (len <= 0) break;
      i += 2 + len;
    }
    return null;
  }
  if (buf.length > 30 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
    const fmt = buf.toString("ascii", 12, 16);
    if (fmt === "VP8X") {
      return {
        type: "image/webp",
        width: 1 + buf.readUIntLE(24, 3),
        height: 1 + buf.readUIntLE(27, 3),
      };
    }
    if (fmt === "VP8 ") {
      return { type: "image/webp", width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
    }
    if (fmt === "VP8L") {
      const b = buf.readUInt32LE(21);
      return { type: "image/webp", width: (b & 0x3fff) + 1, height: ((b >> 14) & 0x3fff) + 1 };
    }
  }
  if (buf.length > 10 && buf.toString("ascii", 0, 3) === "GIF") {
    return { type: "image/gif", width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
  }
  return null;
}

/**
 * Kelompokkan meta og:image dari HTML: satu og:image diikuti properti
 * struktural (type/width/height/alt) miliknya, sesuai spesifikasi Open Graph.
 */
function parseOgGroups(html) {
  const head = html.slice(0, html.indexOf("</head>") + 1);
  const metaRe = /<meta\s+[^>]*property=["'](og:image(?::\w+)?)["'][^>]*content=["']([^"']*)["'][^>]*>/gi;
  const groups = [];
  let m;
  while ((m = metaRe.exec(head))) {
    const [, prop, content] = m;
    if (prop === "og:image") {
      groups.push({ url: content });
    } else if (groups.length) {
      groups[groups.length - 1][prop.slice("og:image:".length)] = content;
    }
  }
  return groups;
}

/** Ambil daftar OG_IMAGES dari SEO.tsx (url/width/height literal). */
function parseSeoImages(src) {
  const block = src.match(/export const OG_IMAGES\s*=\s*\[([\s\S]*?)\]\s*as const/);
  if (!block) return null;
  const entryRe = /\{\s*url:\s*`\$\{SITE\}([^`]+)`\s*,\s*width:\s*(\d+)\s*,\s*height:\s*(\d+)\s*\}/g;
  const out = [];
  let m;
  while ((m = entryRe.exec(block[1]))) {
    out.push({ pathname: m[1], width: Number(m[2]), height: Number(m[3]) });
  }
  return out;
}

const html = readFileSync(path.join(root, "index.html"), "utf8");
const seoSrc = readFileSync(path.join(root, "src/components/SEO.tsx"), "utf8");

const groups = parseOgGroups(html);
if (groups.length === 0) errors.push("Tidak ada tag og:image di index.html.");

const urls = groups.map((g) => g.url);
if (new Set(urls).size !== urls.length) errors.push(`URL og:image duplikat: ${urls.join(", ")}`);

for (const g of groups) {
  const label = g.url || "(kosong)";
  if (!/^https:\/\/\S+$/i.test(g.url)) {
    errors.push(`og:image "${label}" harus URL absolut https.`);
    continue;
  }
  const pathname = new URL(g.url).pathname;
  const file = path.join(root, "public", pathname);
  if (!existsSync(file)) {
    errors.push(`File tidak ditemukan untuk ${label}: public${pathname}`);
    continue;
  }
  const meta = readImageMeta(readFileSync(file));
  if (!meta) {
    errors.push(`Format public${pathname} tidak dikenali (JPEG/PNG/WebP/GIF).`);
    continue;
  }
  if (!g.width || !g.height) {
    errors.push(`og:image ${label} tidak punya og:image:width/height.`);
  } else {
    if (Number(g.width) !== meta.width || Number(g.height) !== meta.height) {
      errors.push(
        `Dimensi tidak cocok untuk public${pathname}: dideklarasikan ${g.width}x${g.height}, file ${meta.width}x${meta.height}.`,
      );
    }
  }
  if (!g.type) {
    errors.push(`og:image ${label} tidak punya og:image:type.`);
  } else if (g.type !== meta.type) {
    errors.push(`Tipe tidak cocok untuk public${pathname}: dideklarasikan ${g.type}, file ${meta.type}.`);
  }
  if (!g.alt) errors.push(`og:image ${label} tidak punya og:image:alt.`);
  notes.push(`public${pathname} -> ${meta.width}x${meta.height} ${meta.type} OK`);
}

// twitter:image harus tunggal dan memakai varian utama (og:image pertama).
const twMatches = [...html.matchAll(/<meta\s+[^>]*name=["']twitter:image["'][^>]*content=["']([^"']*)["'][^>]*>/gi)];
if (twMatches.length !== 1) {
  errors.push(`twitter:image harus tepat 1 di index.html, ditemukan ${twMatches.length}.`);
} else if (groups.length && twMatches[0][1] !== groups[0].url) {
  errors.push(`twitter:image (${twMatches[0][1]}) harus memakai varian utama ${groups[0].url}.`);
}

// SEO.tsx harus mendeklarasikan varian yang sama dengan index.html.
const seoImages = parseSeoImages(seoSrc);
if (!seoImages || seoImages.length === 0) {
  errors.push("Tidak dapat membaca OG_IMAGES dari src/components/SEO.tsx.");
} else if (seoImages.length !== groups.length) {
  errors.push(`Jumlah varian berbeda: index.html ${groups.length}, SEO.tsx ${seoImages.length}.`);
} else {
  seoImages.forEach((img, i) => {
    const g = groups[i];
    const pathname = g?.url ? new URL(g.url).pathname : "";
    if (img.pathname !== pathname) {
      errors.push(`Varian #${i + 1} berbeda: index.html "${pathname}" vs SEO.tsx "${img.pathname}".`);
    }
    if (g && (Number(g.width) !== img.width || Number(g.height) !== img.height)) {
      errors.push(
        `Ukuran varian #${i + 1} berbeda: index.html ${g.width}x${g.height} vs SEO.tsx ${img.width}x${img.height}.`,
      );
    }
  });
}

if (errors.length) {
  console.error("\n[og-image] Validasi GAGAL:");
  errors.forEach((e) => console.error("  - " + e));
  process.exit(1);
}

console.log(`[og-image] Validasi OK (${groups.length} varian):`);
notes.forEach((n) => console.log("  - " + n));
