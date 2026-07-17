import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { animalOptions, formatCurrency, getNextIdulAdha } from "@/lib/qurban-data";

// #21 Reverse calculator — "kalau nabung Rp X/hari, hewan apa yang muat?"
const ReverseCalculator = () => {
  const [perDay, setPerDay] = useState<number>(20000);

  const daysLeft = useMemo(() => {
    const diff = getNextIdulAdha().getTime() - Date.now();
    return Math.max(30, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }, []);

  const budget = perDay * daysLeft;
  const affordable = animalOptions.filter((a) => a.price <= budget).sort((a, b) => b.price - a.price);
  const best = affordable[0];
  const next = animalOptions
    .filter((a) => a.price > budget)
    .sort((a, b) => a.price - b.price)[0];

  return (
    <section className="rounded-2xl border border-secondary/30 bg-sage-soft p-5 space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <Sparkles className="h-4 w-4" strokeWidth={1.8} />
        </div>
        <div>
          <h2 className="font-display text-base font-bold text-forest">Simulasi Balik</h2>
          <p className="text-[11px] text-muted-foreground">Hewan yang muat berdasarkan tabungan harianmu.</p>
        </div>
      </div>

      <div className="rounded-xl bg-card p-3 space-y-2">
        <Label className="text-[10px] font-bold uppercase tracking-wider text-forest/70">
          Kalau nabung per hari
        </Label>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Rp</span>
          <Input
            type="number"
            min={0}
            step={5000}
            value={perDay}
            onChange={(e) => setPerDay(Math.max(0, parseInt(e.target.value) || 0))}
            className="flex-1"
          />
        </div>
        <p className="text-[11px] text-muted-foreground">
          {daysLeft} hari sampai Idul Adha → total {formatCurrency(budget)}
        </p>
      </div>

      {best ? (
        <div className="rounded-xl bg-primary/10 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Bisa dapat</p>
          <p className="mt-0.5 text-sm font-bold text-forest">{best.label}</p>
          <p className="text-[11px] text-muted-foreground">
            Harga {formatCurrency(best.price)} · sisa {formatCurrency(budget - best.price)}
          </p>
        </div>
      ) : next ? (
        <div className="rounded-xl bg-muted p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Belum cukup</p>
          <p className="mt-0.5 text-xs text-forest">
            Kurang {formatCurrency(Math.ceil((next.price - budget) / daysLeft))}/hari untuk {next.label}.
          </p>
        </div>
      ) : null}
    </section>
  );
};

export default ReverseCalculator;
