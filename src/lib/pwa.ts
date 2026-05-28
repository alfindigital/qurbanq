// Registers the PWA service worker for offline support.
// Guarded so it never runs inside the Lovable editor preview/iframe,
// where a SW would serve stale content and break navigation.

export function registerPWA() {
  if (typeof window === "undefined") return;

  const isInIframe = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();

  const host = window.location.hostname;
  const isPreviewHost =
    host.includes("id-preview--") ||
    host.includes("lovableproject.com") ||
    host === "localhost" ||
    host === "127.0.0.1";

  if (isInIframe || isPreviewHost) {
    // Make sure any previously-registered SW is removed in preview contexts
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister());
      });
    }
    return;
  }

  if (!("serviceWorker" in navigator)) return;

  // Dynamic import so workbox-window is only loaded in production runtimes
  import("workbox-window")
    .then(({ Workbox }) => {
      const wb = new Workbox("/sw.js", { scope: "/" });

      wb.addEventListener("waiting", () => {
        // New SW is waiting — activate it on next reload automatically
        wb.messageSkipWaiting();
      });

      wb.addEventListener("controlling", () => {
        // Reload once the new SW takes control so users get the fresh build
        window.location.reload();
      });

      wb.register().catch((err) => {
        console.warn("[PWA] Service worker registration failed:", err);
      });
    })
    .catch(() => {
      /* workbox-window not available — skip silently */
    });
}
