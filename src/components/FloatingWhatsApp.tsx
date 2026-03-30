import { MessageCircle } from "lucide-react";
import { generateWhatsAppLink } from "@/lib/qurban-data";

const FloatingWhatsApp = () => {
  const link = generateWhatsAppLink("Assalamualaikum, saya ingin konsultasi tentang qurban. Mohon informasinya.");

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-[hsl(142,70%,35%)] px-5 py-3 text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden text-sm font-semibold sm:inline">Konsultasi Qurban</span>
    </a>
  );
};

export default FloatingWhatsApp;
