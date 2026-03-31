import { MessageCircle } from "lucide-react";
import { generateWhatsAppLink } from "@/lib/qurban-data";

const FloatingWhatsApp = () => {
  const link = generateWhatsAppLink("Assalamualaikum, saya ingin konsultasi tentang qurban. Mohon informasinya.");

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--wa-green))] text-white shadow-lg transition-all hover:scale-105 active:scale-95"
      aria-label="Konsultasi via WhatsApp"
    >
      <MessageCircle className="h-5 w-5" strokeWidth={1.5} />
    </a>
  );
};

export default FloatingWhatsApp;
