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
const STATIC_SELECTORS = [
  'meta[name="description"]',
  'meta[property="og:title"]',
  'meta[property="og:description"]',
  'meta[name="twitter:title"]',
  'meta[name="twitter:description"]',
];

const stripStaticDuplicates = () => {
  STATIC_SELECTORS.forEach((sel) => {
    document.head.querySelectorAll(sel).forEach((el) => {
      if (!el.hasAttribute("data-rh")) el.parentNode?.removeChild(el);
    });
  });
};

const SEO = ({ title, description, path, jsonLd }: SEOProps) => {
  const url = `${SITE}${path}`;
  const blocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  useEffect(() => {
    // Wait one microtask so Helmet has flushed its tags to the DOM.
    const id = window.setTimeout(stripStaticDuplicates, 0);
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
      {blocks.map((b, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(b)}</script>
      ))}
    </Helmet>
  );
};

export default SEO;
