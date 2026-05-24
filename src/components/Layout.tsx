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
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-lg items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary shadow-warm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-primary-foreground">
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.2" />
              </svg>
            </div>
            <span className="font-display text-xl font-bold text-forest">Qurbanku</span>
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

      <InAppReminder />

      <main className="mx-auto max-w-lg px-5 py-4 pb-nav">
        {children}
      </main>

      <FloatingWhatsApp />
      <BottomNav />
    </div>
  );
};

export default Layout;
