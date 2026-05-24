import { Home, Calculator, PiggyBank, BookOpen, Bell } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const items = [
  { label: "Beranda", to: "/", icon: Home },
  { label: "Hitung", to: "/kalkulator", icon: Calculator },
  { label: "Tabung", to: "/tabungan", icon: PiggyBank },
  { label: "Edukasi", to: "/edukasi", icon: BookOpen },
  { label: "Ingat", to: "/pengingat", icon: Bell },
];

const BottomNav = () => {
  return (
    <nav
      className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md rounded-full bg-forest px-3 py-2 shadow-warm"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center justify-around">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className="flex flex-col items-center justify-center gap-0.5 rounded-full px-3 py-2 text-background/60 transition-all"
            activeClassName="text-background bg-background/15"
          >
            <item.icon className="h-5 w-5" strokeWidth={1.8} />
            <span className="text-[10px] font-semibold tracking-tight">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
