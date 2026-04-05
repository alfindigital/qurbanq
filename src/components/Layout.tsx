import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import InAppReminder from "@/components/InAppReminder";

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
      <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-700 shadow-md shadow-primary/30">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-primary-foreground">
                {/* Crescent moon */}
                <path d="M15.5 4.5c-1.2 0-2.3.3-3.3.9A5.5 5.5 0 0 1 15 10a5.5 5.5 0 0 1-2.8 4.8c1 .5 2.1.7 3.3.7a5.5 5.5 0 1 0 0-11z" fill="currentColor" opacity="0.25"/>
                <path d="M15.5 5c-1 0-2 .25-2.85.7A5 5 0 0 1 15 10a5 5 0 0 1-2.35 4.3c.85.45 1.85.7 2.85.7a5 5 0 1 0 0-10z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                {/* Goat/sheep silhouette */}
                <path d="M4 17c0-1.5 1-2.5 2-3 .5-1.5 2-2.5 3.5-2.5.8 0 1.5.3 2 .7.5-.4 1.2-.7 2-.7.5 0 1 .1 1.4.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
                <circle cx="7.5" cy="13" r="1" fill="currentColor" opacity="0.6"/>
                <path d="M5 17h2M8 17h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                {/* Star */}
                <path d="M19 3l.5 1.5H21l-1.2.9.5 1.6L19 6l-1.3 1 .5-1.6L17 4.5h1.5z" fill="currentColor" opacity="0.7"/>
              </svg>
            </div>
            <span className="text-base font-extrabold tracking-tight text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>Qurbanku</span>
          </div>
          <button
            onClick={() => setDark(!dark)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun className="h-4 w-4" strokeWidth={1.5} /> : <Moon className="h-4 w-4" strokeWidth={1.5} />}
          </button>
        </div>
      </header>

      <InAppReminder />

      <main className="mx-auto max-w-lg px-4 py-5 pb-nav">
        {children}
      </main>

      <FloatingWhatsApp />
      <BottomNav />
    </div>
  );
};

export default Layout;
