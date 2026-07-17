import { Baby, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { animalOptions, formatCurrency, generateWhatsAppLink } from "@/lib/qurban-data";

// #18 Kalkulator ringan aqiqah — pakai harga kambing yang sudah ada.
const AqiqahCard = () => {
  const kambing = animalOptions.find((a) => a.type === "kambing" && a.id === "kambing-b") ?? animalOptions.find((a) => a.type === "kambing")!;
  const laki = kambing.price * 2;
  const perempuan = kambing.price;

  const chat = (gender: string, total: number) => {
    const msg = `Assalamualaikum, saya ingin memesan paket aqiqah untuk anak ${gender} (${gender === "laki-laki" ? "2" : "1"} ekor kambing, total ${formatCurrency(total)}). Mohon info lebih lanjut.`;
    window.open(generateWhatsAppLink(msg, `aqiqah:${gender}`), "_blank");
  };

  return (
    <section className="rounded-2xl border border-accent/30 bg-sage-soft p-5 space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <Baby className="h-5 w-5" strokeWidth={1.8} />
        </div>
        <div>
          <h2 className="font-display text-base font-bold text-forest">Paket Aqiqah</h2>
          <p className="text-[11px] text-muted-foreground">
            Aqiqah berbeda dengan qurban — disyariatkan untuk kelahiran bayi.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => chat("laki-laki", laki)} className="rounded-xl bg-card p-3 text-left transition-all active:scale-[0.98]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">Anak Laki-laki</p>
          <p className="text-[11px] text-muted-foreground">2 ekor kambing</p>
          <p className="mt-1 font-display text-sm font-bold text-primary">{formatCurrency(laki)}</p>
        </button>
        <button onClick={() => chat("perempuan", perempuan)} className="rounded-xl bg-card p-3 text-left transition-all active:scale-[0.98]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">Anak Perempuan</p>
          <p className="text-[11px] text-muted-foreground">1 ekor kambing</p>
          <p className="mt-1 font-display text-sm font-bold text-primary">{formatCurrency(perempuan)}</p>
        </button>
      </div>

      <Button
        size="sm"
        variant="outline"
        className="w-full border-secondary/40 text-secondary hover:bg-secondary/10"
        onClick={() => window.open(generateWhatsAppLink("Assalamualaikum, saya ingin konsultasi paket aqiqah.", "aqiqah:konsultasi"), "_blank")}
      >
        <MessageCircle className="mr-1.5 h-4 w-4" strokeWidth={2} /> Konsultasi Aqiqah
      </Button>
    </section>
  );
};

export default AqiqahCard;
