import { Calculator, PiggyBank, BookOpen, Bell } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const MosqueIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 1 32 32" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-br from-primary to-[hsl(var(--forest))] px-3 pt-3 shadow-warm dark:ring-1 dark:ring-white/10"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center justify-around">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            aria-label={item.label}
            className="flex items-center justify-center rounded-full px-4 py-2.5 text-white/70 transition-all"
            activeClassName="text-white bg-white/20"
          >
            <item.icon className="h-7 w-7" strokeWidth={1.8} />
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
