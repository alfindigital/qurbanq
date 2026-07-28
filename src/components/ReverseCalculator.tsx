import { useMemo, useState } from "react";
import { Sparkles, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { animalOptions, formatCurrency, getDaysUntilIdulAdha } from "@/lib/qurban-data";

// #21 Reverse calculator — "kalau nabung Rp X/hari, hewan apa yang muat?"
const ReverseCalculator = () => {
  const [perDay, setPerDay] = useState<number>(20000);

  const daysLeft = useMemo(() => Math.max(1, getDaysUntilIdulAdha()), []);

  const budget = perDay * daysLeft;
  const affordable = animalOptions.filter((a) => a.price <= budget).sort((a, b) => b.price - a.price);
  const best = affordable[0];
  const next = animalOptions
    .filter((a) => a.price > budget)
    .sort((a, b) => a.price - b.price)[0];

  const presets = [10000, 20000, 50000, 100000];

  return (
    <section className="rounded-2xl border border-secondary/30 bg-sage-soft p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <Sparkles className="h-4 w-4" strokeWidth={1.8} />
        </div>
        <div>
          <h2 className="font-display text-base font-bold text-forest">Simulasi Balik</h2>
          <p className="text-[11px] text-muted-foreground">Hewan yang muat berdasarkan tabungan harianmu.</p>
        </div>
      </div>

      <div className="rounded-xl bg-card p-4 space-y-3">
        <Label htmlFor="reverse-perday" className="text-[10px] font-bold uppercase tracking-wider text-forest/70">
          Kalau nabung per hari
        </Label>
        <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
          <span className="text-sm font-semibold text-muted-foreground">Rp</span>
          <Input
            id="reverse-perday"
            type="number"
            min={0}
            step={5000}
            value={perDay}
            onChange={(e) => setPerDay(Math.max(0, parseInt(e.target.value) || 0))}
            className="flex-1 border-0 bg-transparent px-0 text-lg font-bold text-forest shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {presets.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setPerDay(amt)}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                perDay === amt
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-forest"
              }`}
            >
              {amt >= 1000 ? `${amt / 1000}rb` : amt}
            </button>
          ))}
        </div>
      </div>

      {/* TOTAL — hero card */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-secondary to-secondary/85 p-4 text-secondary-foreground">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5 opacity-80" strokeWidth={2} />
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Total sampai Idul Adha</p>
        </div>
        <p className="mt-1 font-display text-2xl font-extrabold leading-tight sm:text-3xl">
          {formatCurrency(budget)}
        </p>
        <p className="mt-1 text-[11px] opacity-80">
          {formatCurrency(perDay)}/hari × {daysLeft} hari
        </p>
      </div>

      {best ? (
        <div className="rounded-xl border border-primary/20 bg-primary/10 p-3">
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
