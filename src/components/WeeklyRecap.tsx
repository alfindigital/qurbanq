import { useEffect, useState } from "react";
import { Flame, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { calcStreak } from "@/lib/streak";
import { formatCurrency } from "@/lib/qurban-data";

const LEDGER_KEY = "qurbanku-tabungan-ledger";

interface LedgerEntry {
  id: string;
  amount: number;
  date: string;
  note?: string;
}

const loadLedger = (): LedgerEntry[] => {
  try {
    const raw = localStorage.getItem(LEDGER_KEY);
    if (raw) return JSON.parse(raw) as LedgerEntry[];
  } catch {}
  return [];
};

const startOfWeek = (d: Date) => {
  const c = new Date(d);
  const day = c.getDay();
  const diff = (day + 6) % 7;
  c.setHours(0, 0, 0, 0);
  c.setDate(c.getDate() - diff);
  return c;
};

// #42 Kartu recap mingguan: total setoran minggu ini + streak minggu berturut.
// Hanya tampil kalau user sudah punya minimal 1 entri ledger.
const WeeklyRecap = () => {
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);

  useEffect(() => {
    setLedger(loadLedger());
  }, []);

  if (ledger.length === 0) return null;

  const weekStart = startOfWeek(new Date()).getTime();
  const thisWeekTotal = ledger
    .filter((l) => new Date(l.date).getTime() >= weekStart)
    .reduce((s, l) => s + l.amount, 0);
  const streak = calcStreak(ledger.map((l) => l.date));

  return (
    <section aria-labelledby="recap-heading">
      <Link
        to="/tabungan"
        className="flex items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/[0.04] p-4 transition-colors hover:border-primary/40 hover:bg-primary/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <TrendingUp className="h-5 w-5" strokeWidth={1.8} />
          </span>
          <div>
            <p id="recap-heading" className="text-xs uppercase tracking-wide text-muted-foreground">
              Recap minggu ini
            </p>
            <p className="text-sm font-semibold text-forest">
              Setor {formatCurrency(thisWeekTotal)}
            </p>
          </div>
        </div>
        {streak > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
            <Flame className="h-3.5 w-3.5" strokeWidth={2} />
            {streak} minggu
          </span>
        )}
      </Link>
    </section>
  );
};

export default WeeklyRecap;
