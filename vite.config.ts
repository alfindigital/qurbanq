import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { execFileSync } from "child_process";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

/**
 * Validasi saat build: setiap file og-image-* harus cocok dengan
 * og:image:width/height/type yang dideklarasikan (index.html + SEO.tsx).
 * Build gagal bila tidak cocok.
 */
const validateOgImages = (): Plugin => ({
  name: "validate-og-images",
  apply: "build",
  buildStart() {
    try {
      const out = execFileSync(
        process.execPath,
        [path.resolve(__dirname, "scripts/validate-og-images.mjs")],
        { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
      );
      this.info(out.trim());
    } catch (err) {
      const e = err as { stdout?: string; stderr?: string };
      this.error(`og:image validation failed\n${e.stderr ?? ""}${e.stdout ?? ""}`);
    }
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    validateOgImages(),
    mode === "development" && componentTagger(),

    VitePWA({
      registerType: "autoUpdate",
      injectRegister: null, // we register manually in main.tsx with guards
      devOptions: { enabled: false },
      includeAssets: [
        "favicon.ico",
        "icons/*.png",
        "splash/*.png",
      ],
      manifest: false, // we ship our own /manifest.json
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,webp,woff2}"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/~oauth/, /^\/api/],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // HTML navigations: always try network first so new builds win
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "html-cache",
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 32, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          {
            // Google Fonts stylesheets
            urlPattern: ({ url }) => url.origin === "https://fonts.googleapis.com",
            handler: "StaleWhileRevalidate",
            options: { cacheName: "google-fonts-stylesheets" },
          },
          {
            // Google Fonts files
            urlPattern: ({ url }) => url.origin === "https://fonts.gstatic.com",
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: { maxEntries: 32, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Images
            urlPattern: ({ request }) => request.destination === "image",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "image-cache",
              expiration: { maxEntries: 64, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "ui-vendor": ["framer-motion", "@radix-ui/react-accordion", "@radix-ui/react-dialog", "@radix-ui/react-tooltip"],
          "query-vendor": ["@tanstack/react-query"],
        },
      },
    },
  },
}));
