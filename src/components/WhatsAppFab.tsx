import { MessageCircle } from "lucide-react";
import { useLocation } from "react-router-dom";
import { generateWhatsAppLink } from "@/lib/qurban-data";

// Floating action button WhatsApp yang selalu terlihat di atas BottomNav,
// biar konversi lead ke penjual tidak cuma bergantung di CTA kalkulator.
const WhatsAppFab = () => {
  const location = useLocation();
  const source = location.pathname === "/" ? "beranda" : location.pathname.replace("/", "");

  const handleClick = () => {
    const msg = "Assalamualaikum, saya ingin bertanya tentang hewan qurban.";
    window.open(generateWhatsAppLink(msg, `fab:${source}`), "_blank");
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Chat WhatsApp dengan Qurbanku"
      className="fixed right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--wa-green))] text-white shadow-warm transition-transform hover:scale-105 active:scale-95"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 5.5rem)" }}
    >
      <MessageCircle className="h-6 w-6" strokeWidth={2} />
    </button>
  );
};

export default WhatsAppFab;
