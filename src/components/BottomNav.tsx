import { Calculator, PiggyBank, BookOpen, Bell } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const MosqueIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 7.5a2.8 2.8 0 1 0 2.6-3.9 2.3 2.3 0 0 1-2.6 3.9z" fill="currentColor" stroke="none" />
    <circle cx="22" cy="5.5" r="0.9" fill="currentColor" stroke="none" />
    <path d="M22 7v2.5" />
    <path d="M16 9.5c-3.6 0-6.5 3-6.5 6.7V18h13v-1.8c0-3.7-2.9-6.7-6.5-6.7z" fill="currentColor" fillOpacity="0.3" />
    <path d="M7.5 18h17v8h-17z" fill="currentColor" fillOpacity="0.15" />
    <path d="M13.5 26v-3.2a2.5 2.5 0 0 1 5 0V26" />
    <path d="M5.5 26.5h21" />
  </svg>
);

const items = [
  { label: "Beranda", to: "/", icon: MosqueIcon },
  { label: "Hitung", to: "/kalkulator", icon: Calculator },
  { label: "Tabung", to: "/tabungan", icon: PiggyBank },
  { label: "Edukasi", to: "/edukasi", icon: BookOpen },
  { label: "Ingat", to: "/pengingat", icon: Bell },
];

const BottomNav = () => {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl shadow-soft"
      style={{ paddingBottom: "max(0px, env(safe-area-inset-bottom))" }}
    >
      <nav className="mx-auto flex w-full items-stretch sm:max-w-2xl md:max-w-3xl">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-3 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground sm:flex-initial sm:px-7 sm:py-3.5 md:px-10"
            activeClassName="bg-muted text-foreground"
          >
            <item.icon className="h-8 w-8 sm:h-9 sm:w-9" strokeWidth={1.8} />
            <span className="text-[0.65rem] font-semibold leading-none tracking-wide sm:text-xs">
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default BottomNav;
