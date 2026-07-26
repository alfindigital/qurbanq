import { useEffect } from "react";
import { Helmet } from "react-helmet-async";

const SITE = "https://qurban-q.lovable.app";

interface SEOProps {
  title: string;
  description: string;
  path: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Static fallback meta tags in index.html (og:title, og:description,
 * twitter:title, twitter:description, meta[name=description]) exist for
 * non-JS crawlers. Once Helmet mounts and injects per-route tags, we
 * remove the static ones so there is no duplication in the live DOM.
 * Helmet marks its tags with data-rh="true"; we remove any matching tag
 * without that marker.
 */
/**
 * Varian gambar social preview. Yang pertama adalah varian utama
 * (1200x630, dipakai summary_large_image); varian 600x315 disertakan
 * sebagai fallback untuk platform yang memilih aset lebih kecil.
 */
export const OG_IMAGES = [
  { url: `${SITE}/og-image.jpg`, width: 1200, height: 630 },
  { url: `${SITE}/og-image-600x315.jpg`, width: 600, height: 315 },
] as const;

const OG_IMAGE = OG_IMAGES[0].url;
const IMAGE_ALT = "Qurbanku — Kalkulator Patungan & Tabungan Qurban";
const MANAGED_ATTR = "data-og-images";

const STATIC_SELECTORS = [
  'meta[name="description"]',
  'meta[property="og:title"]',
  'meta[property="og:description"]',
  'meta[property="og:image"]',
  'meta[property="og:image:type"]',
  'meta[property="og:image:width"]',
  'meta[property="og:image:height"]',
  'meta[property="og:image:alt"]',
  'meta[name="twitter:title"]',
  'meta[name="twitter:description"]',
  'meta[name="twitter:image"]',
  'meta[name="twitter:image:alt"]',
];

const stripStaticDuplicates = () => {
  STATIC_SELECTORS.forEach((sel) => {
    document.head.querySelectorAll(sel).forEach((el) => {
      if (!el.hasAttribute("data-rh") && !el.hasAttribute(MANAGED_ATTR)) {
        el.parentNode?.removeChild(el);
      }
    });
  });
};

/**
 * Helmet men-dedupe meta berdasarkan property, jadi beberapa og:image
 * tidak bisa dirender lewat Helmet. Kelompok gambar dikelola manual di
 * sini: satu og:image per ukuran, masing-masing diikuti type/width/height/alt
 * sesuai spesifikasi Open Graph (properti struktural mengikuti og:image
 * terakhir sebelum­nya).
 */
const syncImageTags = () => {
  document.head.querySelectorAll(`meta[${MANAGED_ATTR}]`).forEach((el) => el.remove());

  const tags: Array<[string, string]> = [];
  OG_IMAGES.forEach((img) => {
    tags.push(["og:image", img.url]);
    tags.push(["og:image:type", "image/jpeg"]);
    tags.push(["og:image:width", String(img.width)]);
    tags.push(["og:image:height", String(img.height)]);
    tags.push(["og:image:alt", IMAGE_ALT]);
  });

  tags.forEach(([property, content]) => {
    const el = document.createElement("meta");
    el.setAttribute("property", property);
    el.setAttribute("content", content);
    el.setAttribute(MANAGED_ATTR, "true");
    document.head.appendChild(el);
  });

  const twAlt = document.createElement("meta");
  twAlt.setAttribute("name", "twitter:image:alt");
  twAlt.setAttribute("content", IMAGE_ALT);
  twAlt.setAttribute(MANAGED_ATTR, "true");
  document.head.appendChild(twAlt);
};

const SEO = ({ title, description, path, jsonLd }: SEOProps) => {
  const url = `${SITE}${path}`;
  const blocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  useEffect(() => {
    // Wait one microtask so Helmet has flushed its tags to the DOM.
    const id = window.setTimeout(() => {
      stripStaticDuplicates();
      syncImageTags();
    }, 0);
    return () => window.clearTimeout(id);
  }, [title, description, path]);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={OG_IMAGE} />
      {blocks.map((b, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(b)}</script>
      ))}
    </Helmet>
  );
};

export default SEO;
