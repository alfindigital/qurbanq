import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle } from "lucide-react";
import SEO from "@/components/SEO";
import { animalOptions, formatCurrency, generateWhatsAppLink, getNextIdulAdha } from "@/lib/qurban-data";

const TABUNGAN_KEY = "qurbanku-tabungan";
const loadTabungan = () => {
  try {
    const raw = localStorage.getItem(TABUNGAN_KEY);
    if (raw) return JSON.parse(raw) as { selectedAnimal?: string; months?: number; saved?: number };
  } catch {}
  return null;
};

const Tabungan = () => {
  const initial = loadTabungan();
  const [selectedAnimal, setSelectedAnimal] = useState(initial?.selectedAnimal ?? "");
  const [months, setMonths] = useState(initial?.months ?? 6);
  const [saved, setSaved] = useState(initial?.saved ?? 0);

  useEffect(() => {
    localStorage.setItem(TABUNGAN_KEY, JSON.stringify({ selectedAnimal, months, saved }));
  }, [selectedAnimal, months, saved]);

  const animal = animalOptions.find((a) => a.id === selectedAnimal);
  const target = animal?.price || 0;
  const perMonth = target > 0 && months > 0 ? Math.ceil(target / months) : 0;
  const perWeek = target > 0 && months > 0 ? Math.ceil(target / (months * 4)) : 0;
  const perDay = target > 0 && months > 0 ? Math.ceil(target / (months * 30)) : 0;
  const progress = target > 0 ? Math.min(100, (saved / target) * 100) : 0;
  const remaining = Math.max(0, target - saved);

  const monthsUntilAdha = () => {
    const now = new Date();
    const adha = getNextIdulAdha();
    const diff = (adha.getFullYear() - now.getFullYear()) * 12 + (adha.getMonth() - now.getMonth());
    return Math.max(1, diff);
  };

  return (
    <div className="space-y-5">
      <SEO
        title="Tabungan Qurban — Rencana Menabung Idul Adha | Qurbanku"
        description="Susun rencana tabungan qurban dengan target harga hewan, estimasi setoran bulanan, mingguan, dan harian hingga Idul Adha."
        path="/tabungan"
      />
      <div>
        <h1 className="text-xl font-bold text-foreground">Tabungan Qurban</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Rencanakan tabungan Anda</p>
      </div>

      <div className="rounded-xl border bg-card p-4 space-y-4">
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Target Hewan</Label>
          <Select value={selectedAnimal} onValueChange={setSelectedAnimal}>
            <SelectTrigger><SelectValue placeholder="Pilih hewan..." /></SelectTrigger>
            <SelectContent>
              {animalOptions.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.label} — {formatCurrency(a.price)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Jangka (bulan)</Label>
            <Input type="number" min={1} max={24} value={months} onChange={(e) => setMonths(Math.max(1, parseInt(e.target.value) || 1))} />
            <button onClick={() => setMonths(monthsUntilAdha())} className="text-[11px] text-primary font-medium">
              Auto: {monthsUntilAdha()} bulan
            </button>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sudah Ditabung</Label>
            <Input type="number" min={0} value={saved} onChange={(e) => setSaved(Math.max(0, parseInt(e.target.value) || 0))} />
          </div>
        </div>
      </div>

      {animal && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-5">
          {/* Progress */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold text-primary">{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
              <span>{formatCurrency(saved)}</span>
              <span>Sisa: {formatCurrency(remaining)}</span>
            </div>
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Per Bulan", value: perMonth },
              { label: "Per Minggu", value: perWeek },
              { label: "Per Hari", value: perDay },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-background p-3 text-center">
                <p className="text-[10px] text-muted-foreground">{item.label}</p>
                <p className="text-xs font-bold text-foreground mt-0.5">{formatCurrency(item.value)}</p>
              </div>
            ))}
          </div>

          {remaining > 0 && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tabung <strong>{formatCurrency(perMonth)}</strong>/bulan selama <strong>{months} bulan</strong> untuk mencapai target.
            </p>
          )}

          {progress >= 100 && (
            <div className="rounded-xl bg-primary/10 p-4 text-center space-y-3">
              <p className="font-semibold text-primary text-sm">🎉 Target tercapai!</p>
              <Button
                className="bg-[hsl(var(--wa-green))] hover:bg-[hsl(var(--wa-green))]/90 text-white"
                onClick={() => {
                  const msg = `Assalamualaikum, saya sudah menyiapkan dana qurban untuk ${animal.label} (${formatCurrency(target)}). Mohon info ketersediaan dan cara pemesanan.`;
                  window.open(generateWhatsAppLink(msg), "_blank");
                }}
              >
                <MessageCircle className="mr-2 h-4 w-4" strokeWidth={1.8} /> Pesan via WhatsApp
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Tabungan;
