import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import BottomNav from "@/components/BottomNav";


const Layout = ({ children }: { children: React.ReactNode }) => {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });


  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("theme-switching");
    root.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
    const brandColor = dark ? "#0c1210" : "#1a3c2a";
    document
      .querySelectorAll('meta[name="theme-color"]')
      .forEach((m) => m.setAttribute("content", brandColor));
    // Re-enable transitions on the next frame so the swap is instant
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => root.classList.remove("theme-switching")),
    );
    return () => cancelAnimationFrame(raf);
  }, [dark]);


  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-lg items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[hsl(var(--forest))] shadow-warm dark:from-[hsl(var(--forest))] dark:to-secondary">
              {/* Qurban mark: mosque dome + crescent */}
              <svg viewBox="0 0 32 32" className="h-6 w-6 text-primary-foreground dark:text-foreground" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                {/* crescent moon top-left */}
                <path d="M9 7.5a2.8 2.8 0 1 0 2.6-3.9 2.3 2.3 0 0 1-2.6 3.9z" fill="currentColor" stroke="none" />
                {/* finial */}
                <circle cx="22" cy="5.5" r="0.9" fill="currentColor" stroke="none" />
                <path d="M22 7v2.5" />
                {/* dome */}
                <path d="M16 9.5c-3.6 0-6.5 3-6.5 6.7V18h13v-1.8c0-3.7-2.9-6.7-6.5-6.7z" fill="currentColor" fillOpacity="0.3" />
                {/* base walls */}
                <path d="M7.5 18h17v8h-17z" fill="currentColor" fillOpacity="0.15" />
                {/* arched door */}
                <path d="M13.5 26v-3.2a2.5 2.5 0 0 1 5 0V26" />
                {/* ground */}
                <path d="M5.5 26.5h21" />
              </svg>
            </div>
            <span className="font-display text-2xl font-bold leading-tight text-forest transition-colors dark:text-foreground">
              Qurbanku
            </span>
          </div>
          <button
            onClick={() => setDark(!dark)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-forest transition-colors hover:bg-accent/30"
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun className="h-4 w-4" strokeWidth={1.8} /> : <Moon className="h-4 w-4" strokeWidth={1.8} />}
          </button>
        </div>
      </header>


      <main className="mx-auto max-w-lg px-5 py-4 pb-nav">
        {children}
      </main>

      <BottomNav />
    </div>
  );
};

export default Layout;
