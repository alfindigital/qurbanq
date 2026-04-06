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
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/30">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-primary-foreground">
                {/* Cleaver/knife blade */}
                <path d="M6 4c-.5 0-1 .2-1.3.6-.4.5-.4 1.1-.2 1.7L8 16h8l1-2.5c.3-.7.3-1.5 0-2.2L14.5 5c-.3-.6-.9-1-1.5-1H6z" fill="currentColor" opacity="0.9"/>
                {/* Knife edge highlight */}
                <path d="M8 16l-3.5-9.7c-.2-.6-.2-1.2.2-1.7C5 4.2 5.5 4 6 4h7c.6 0 1.2.4 1.5 1L17 11.3c.3.7.3 1.5 0 2.2L16 16" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                {/* Handle */}
                <rect x="7.5" y="16" width="9" height="4" rx="1.2" fill="currentColor" opacity="0.7"/>
                <path d="M7.5 16h9v4a1.2 1.2 0 0 1-1.2 1.2H8.7A1.2 1.2 0 0 1 7.5 20v-4z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                {/* Handle rivets */}
                <circle cx="10" cy="18" r="0.6" fill="currentColor" opacity="0.4"/>
                <circle cx="14" cy="18" r="0.6" fill="currentColor" opacity="0.4"/>
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
