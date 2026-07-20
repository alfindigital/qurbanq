import { MessageCircle } from "lucide-react";
import { generateWhatsAppLink } from "@/lib/qurban-data";

// Menggantikan testimoni dummy: undang user kirim cerita nyata via WA.
// Testimoni palsu di konteks ibadah merusak kredibilitas — lebih baik jujur kosong.
const TestimonialSection = () => {
  const msg = "Assalamualaikum, saya ingin berbagi cerita qurban tahun lalu untuk ditampilkan di Qurbanku.";
  return (
    <section>
      <div className="mb-3">
        <h2 className="font-display text-base font-bold text-forest">Cerita Pequrban</h2>
        <p className="text-[11px] text-muted-foreground">Bagikan pengalaman qurbanmu, bantu sesama muslim mempersiapkan ibadahnya.</p>
      </div>
      <a
        href={generateWhatsAppLink(msg, "beranda:kirim-cerita")}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between rounded-2xl border border-dashed border-border bg-card p-4 shadow-soft hover:border-primary/50 transition-colors"
        aria-label="Kirim cerita qurbanmu via WhatsApp"
      >
        <div>
          <p className="text-sm font-semibold text-forest">Kirim ceritamu via WhatsApp</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Cerita asli, tanpa rekayasa.</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MessageCircle className="h-4 w-4" strokeWidth={1.8} />
        </span>
      </a>
    </section>
  );
};

export default TestimonialSection;
