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
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/25">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-primary-foreground">
                <path d="M12 2C7.58 2 4 5.58 4 10c0 3.07 1.72 5.74 4.25 7.08L12 22l3.75-4.92C18.28 15.74 20 13.07 20 10c0-4.42-3.58-8-8-8z" fill="currentColor" opacity="0.15"/>
                <path d="M12 3C8.13 3 5 6.13 5 10c0 2.74 1.56 5.11 3.84 6.29L12 20.5l3.16-4.21C17.44 15.11 19 12.74 19 10c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M9.5 12.5L11 14l4-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
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
