import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Flame, MessageCircle, PiggyBank, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import { animalOptions, formatCurrency, generateWhatsAppLink, getNextIdulAdha } from "@/lib/qurban-data";
import ReverseCalculator from "@/components/ReverseCalculator";
import { calcStreak } from "@/lib/streak";
import { loadReminders, saveReminders } from "@/lib/notifications";

const TABUNGAN_KEY = "qurbanku-tabungan";
const LEDGER_KEY = "qurbanku-tabungan-ledger";
const AUTO_REMINDER_KEY = "qurbanku-auto-reminders-set";
const AUTO_REMINDER_IDS = ["30d", "7d", "1d"];

interface LedgerEntry {
  id: string;
  amount: number;
  date: string; // ISO
  note?: string;
}

const loadTabungan = () => {
  try {
    const raw = localStorage.getItem(TABUNGAN_KEY);
    if (raw) return JSON.parse(raw) as { selectedAnimal?: string; months?: number; saved?: number };
  } catch {}
  return null;
};

const loadLedger = (): LedgerEntry[] => {
  try {
    const raw = localStorage.getItem(LEDGER_KEY);
    if (raw) return JSON.parse(raw) as LedgerEntry[];
  } catch {}
  return [];
};

const MILESTONES = [25, 50, 75, 100];
const MILESTONE_EMOJI: Record<number, string> = { 25: "🌱", 50: "🌿", 75: "🌳", 100: "🎉" };

const monthsUntilAdha = () => {
  const now = new Date();
  const adha = getNextIdulAdha();
  const diff = (adha.getFullYear() - now.getFullYear()) * 12 + (adha.getMonth() - now.getMonth());
  return Math.max(1, diff);
};

const Tabungan = () => {
  const initial = loadTabungan();
  const [selectedAnimal, setSelectedAnimal] = useState(initial?.selectedAnimal ?? "");
  const [months, setMonths] = useState(initial?.months ?? monthsUntilAdha());
  const [saved, setSaved] = useState(initial?.saved ?? 0);
  const [ledger, setLedger] = useState<LedgerEntry[]>(loadLedger);
  const [quickAmount, setQuickAmount] = useState("");

  useEffect(() => {
    localStorage.setItem(TABUNGAN_KEY, JSON.stringify({ selectedAnimal, months, saved }));
  }, [selectedAnimal, months, saved]);


  useEffect(() => {
    localStorage.setItem(LEDGER_KEY, JSON.stringify(ledger));
  }, [ledger]);

  // #41 Auto-enable reminders H-30/H-7/H-1 saat target dipilih pertama kali
  useEffect(() => {
    if (!selectedAnimal) return;
    if (localStorage.getItem(AUTO_REMINDER_KEY)) return;
    const current = loadReminders();
    const updated = current.map((r) =>
      AUTO_REMINDER_IDS.includes(r.id) ? { ...r, enabled: true } : r,
    );
    saveReminders(updated);
    localStorage.setItem(AUTO_REMINDER_KEY, "1");
    toast.success("Pengingat H-30, H-7, H-1 diaktifkan", {
      description: "Kelola di menu Pengingat kalau mau ubah.",
    });
  }, [selectedAnimal]);

  const animal = animalOptions.find((a) => a.id === selectedAnimal);
  const target = animal?.price || 0;
  const perMonth = target > 0 && months > 0 ? Math.ceil(target / months) : 0;
  const perWeek = target > 0 && months > 0 ? Math.ceil(target / (months * 4)) : 0;
  const perDay = target > 0 && months > 0 ? Math.ceil(target / (months * 30)) : 0;
  const progress = target > 0 ? Math.min(100, (saved / target) * 100) : 0;
  const remaining = Math.max(0, target - saved);
  const streak = calcStreak(ledger.map((l) => l.date));




  const addDeposit = (amount: number, note?: string) => {
    if (amount <= 0) return;
    const entry: LedgerEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      amount,
      date: new Date().toISOString(),
      note,
    };
    setLedger((prev) => [entry, ...prev]);
    setSaved((s) => s + amount);
    toast.success(`Setoran ${formatCurrency(amount)} tercatat`, {
      description: note ? `Catatan: ${note}` : undefined,
    });
  };

  const removeDeposit = (id: string) => {
    const target = ledger.find((l) => l.id === id);
    if (!target) return;
    setLedger((prev) => prev.filter((l) => l.id !== id));
    setSaved((s) => Math.max(0, s - target.amount));
  };

  const handleQuickAdd = () => {
    const n = parseInt(quickAmount, 10);
    if (!n || n <= 0) return;
    addDeposit(n);
    setQuickAmount("");
  };

  const dateLabel = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
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

        {animal && (
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
        )}
      </div>

      {/* #23 empty state saat belum pilih hewan */}
      {!animal && (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <PiggyBank className="h-8 w-8 text-primary" strokeWidth={1.6} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Pilih hewan target dulu</p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Setelah pilih, Qurbanku akan hitung setoran per bulan/minggu/hari plus progress menabungmu.
            </p>
          </div>
        </div>
      )}

      {animal && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-5">
          {/* Progress with milestone ticks */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold text-primary">{progress.toFixed(0)}%</span>
            </div>
            <div className="relative">
              <Progress value={progress} className="h-2" />
              <div className="pointer-events-none absolute inset-0 flex items-center">
                {MILESTONES.slice(0, -1).map((m) => (
                  <div
                    key={m}
                    className={`absolute h-3 w-0.5 -translate-x-1/2 rounded ${progress >= m ? "bg-primary" : "bg-muted-foreground/30"}`}
                    style={{ left: `${m}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="mt-1.5 flex justify-between text-[11px]">
              {MILESTONES.map((m) => (
                <span
                  key={m}
                  className={`flex items-center gap-0.5 ${progress >= m ? "text-primary font-semibold" : "text-muted-foreground"}`}
                >
                  <span>{MILESTONE_EMOJI[m]}</span>
                  <span>{m}%</span>
                </span>
              ))}
            </div>
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

          {/* #32 Quick-add + custom input */}
          <div className="rounded-xl bg-background p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Catat Setoran</p>
            <div className="grid grid-cols-3 gap-2">
              {[50000, 100000, 500000].map((amt) => (
                <Button key={amt} size="sm" variant="outline" onClick={() => addDeposit(amt)} className="text-xs">
                  +{amt >= 1000000 ? `${amt / 1000000}jt` : `${amt / 1000}k`}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Nominal lain..."
                value={quickAmount}
                onChange={(e) => setQuickAmount(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleQuickAdd(); } }}
                className="flex-1 text-sm"
              />
              <Button size="sm" onClick={handleQuickAdd} disabled={!quickAmount || parseInt(quickAmount, 10) <= 0} aria-label="Tambah setoran">
                <Plus className="h-4 w-4" strokeWidth={2} />
              </Button>
            </div>
          </div>

          {/* #16 Ledger */}
          {ledger.length > 0 && (
            <div className="rounded-xl bg-background p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Riwayat Setoran</p>
                {streak > 0 ? (
                  <span className="flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                    <Flame className="h-3 w-3" strokeWidth={2} /> {streak} minggu
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground">{ledger.length} entri</span>
                )}
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                {ledger.slice(0, 30).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between text-xs py-1 border-b border-border last:border-0">
                    <div>
                      <span className="font-semibold text-primary">+{formatCurrency(entry.amount)}</span>
                      <span className="text-muted-foreground"> · {dateLabel(entry.date)}</span>
                    </div>
                    <button
                      onClick={() => removeDeposit(entry.id)}
                      aria-label="Hapus setoran"
                      className="text-muted-foreground hover:text-destructive transition-colors p-1"
                    >
                      <Trash2 className="h-3 w-3" strokeWidth={1.8} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                  window.open(generateWhatsAppLink(msg, "tabungan:target-tercapai"), "_blank");
                }}
              >
                <MessageCircle className="mr-2 h-4 w-4" strokeWidth={1.8} /> Pesan via WhatsApp
              </Button>
            </div>
          )}
        </div>
      )}

      <ReverseCalculator />

    </div>
  );
};

export default Tabungan;
