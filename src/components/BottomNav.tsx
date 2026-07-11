import { Calculator, PiggyBank, BookOpen, Bell } from "lucide-react";
import { NavLink } from "@/components/NavLink";

// MosqueIcon — matches AnimalIcons contract: strokeWidth 1.8, currentColor,
// round caps/joins. Accepts `label` for screen-reader exposure.
const MosqueIcon = ({ className, label }: { className?: string; label?: string }) => (
  <svg
    viewBox="0 0 32 32"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...(label
      ? { role: "img", "aria-label": label }
      : { "aria-hidden": true, focusable: false, role: "presentation" })}
  >
    {label ? <title>{label}</title> : null}
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
  { label: "Beranda", to: "/", icon: MosqueIcon, description: "Halaman utama Qurbanku" },
  { label: "Hitung", to: "/kalkulator", icon: Calculator, description: "Kalkulator qurban" },
  { label: "Tabung", to: "/tabungan", icon: PiggyBank, description: "Rencana tabungan qurban" },
  { label: "Edukasi", to: "/edukasi", icon: BookOpen, description: "Materi edukasi qurban" },
  { label: "Ingat", to: "/pengingat", icon: Bell, description: "Pengingat qurban" },
];

const BottomNav = () => {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl shadow-soft"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <nav
        aria-label="Navigasi utama"
        className="mx-auto flex w-full items-stretch sm:max-w-2xl sm:justify-center md:max-w-3xl"
      >
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            aria-label={item.description}
            className="group relative flex min-h-[64px] flex-1 flex-col items-center justify-center gap-1 px-2 py-2.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:min-h-[56px] sm:flex-initial sm:gap-0.5 sm:px-5 sm:py-2 md:px-7"
            activeClassName="bg-muted text-foreground"
          >
            {({ isActive }: { isActive: boolean }) => (
              <>
                <item.icon className="h-8 w-8 sm:h-6 sm:w-6" />
                <span className="text-[0.7rem] font-semibold leading-none tracking-wide sm:text-[11px]">
                  {item.label}
                </span>
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-6 top-0 h-0.5 rounded-b-full bg-primary"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default BottomNav;
