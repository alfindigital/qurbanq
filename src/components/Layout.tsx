import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";


const Layout = ({ children }: { children: React.ReactNode }) => {
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark") ||
        (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-lg items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[hsl(var(--forest))] shadow-warm">
              {/* Stylized ram/qurban mark with crescent */}
              <svg viewBox="0 0 32 32" className="h-6 w-6 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {/* crescent moon */}
                <path d="M24.5 8.5a4.2 4.2 0 1 1-3.8-5.9 3.4 3.4 0 0 0 3.8 5.9z" fill="currentColor" stroke="none" opacity="0.95"/>
                {/* ram horns */}
                <path d="M9 13c-2.2-.4-3.5 1-3.2 2.8.3 1.7 2 2.2 3.2 1.5" />
                <path d="M23 13c2.2-.4 3.5 1 3.2 2.8-.3 1.7-2 2.2-3.2 1.5" />
                {/* head */}
                <path d="M9 16.5c0-3.6 3.1-6 7-6s7 2.4 7 6c0 4-3 7.5-7 7.5s-7-3.5-7-7.5z" fill="currentColor" fillOpacity="0.18"/>
                {/* eyes */}
                <circle cx="13.2" cy="17.5" r="0.9" fill="currentColor" stroke="none"/>
                <circle cx="18.8" cy="17.5" r="0.9" fill="currentColor" stroke="none"/>
                {/* snout */}
                <path d="M14.5 21.2c.7.6 2.3.6 3 0" />
              </svg>
            </div>
            <span className="font-brand text-2xl font-bold tracking-tight text-forest">
              Qurban<span className="italic text-primary">ku</span>
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

      <FloatingWhatsApp />
      <BottomNav />
    </div>
  );
};

export default Layout;
