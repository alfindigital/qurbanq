import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Clock, MessageCircle, CheckCircle2 } from "lucide-react";
import { getNextIdulAdha, preparationChecklist, generateWhatsAppLink } from "@/lib/qurban-data";

const Pengingat = () => {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const target = getNextIdulAdha();
    const update = () => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) return;
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleCheck = (id: string) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  const completedCount = Object.values(checked).filter(Boolean).length;
  const totalItems = preparationChecklist.length;
  const categories = [...new Set(preparationChecklist.map((c) => c.category))];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Pengingat</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Countdown & checklist persiapan</p>
      </div>

      {/* Countdown */}
      <div className="rounded-2xl bg-primary px-5 py-5 text-primary-foreground">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4" strokeWidth={1.5} />
          <p className="text-sm font-semibold">Idul Adha 1447 H</p>
        </div>
        <div className="flex gap-2">
          {[
            { label: "Hari", value: countdown.days },
            { label: "Jam", value: countdown.hours },
            { label: "Mnt", value: countdown.minutes },
            { label: "Dtk", value: countdown.seconds },
          ].map((item) => (
            <div key={item.label} className="flex flex-1 flex-col items-center rounded-xl bg-white/10 py-2.5">
              <span className="text-lg font-bold">{String(item.value).padStart(2, "0")}</span>
              <span className="text-[10px] opacity-60">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Checklist */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Checklist Persiapan</p>
          <span className="text-xs text-muted-foreground">{completedCount}/{totalItems}</span>
        </div>
        <div className="space-y-4">
          {categories.map((cat) => (
            <div key={cat}>
              <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">{cat}</p>
              <div className="space-y-1.5">
                {preparationChecklist
                  .filter((c) => c.category === cat)
                  .map((item) => (
                    <label
                      key={item.id}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all active:scale-[0.98] ${checked[item.id] ? "bg-primary/5 border-primary/20" : ""}`}
                    >
                      <Checkbox checked={!!checked[item.id]} onCheckedChange={() => toggleCheck(item.id)} />
                      <span className={`text-sm flex-1 ${checked[item.id] ? "line-through text-muted-foreground" : ""}`}>
                        {item.label}
                      </span>
                      {checked[item.id] && <CheckCircle2 className="h-4 w-4 text-primary" strokeWidth={1.5} />}
                    </label>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center space-y-2">
        <p className="text-sm text-muted-foreground">Siap berqurban? Pesan sekarang!</p>
        <Button
          size="sm"
          className="bg-[hsl(var(--wa-green))] hover:bg-[hsl(var(--wa-green))]/90 text-white"
          onClick={() => window.open(generateWhatsAppLink("Assalamualaikum, saya ingin memesan hewan qurban. Mohon info ketersediaan."), "_blank")}
        >
          <MessageCircle className="mr-2 h-4 w-4" strokeWidth={1.5} /> Pesan via WhatsApp
        </Button>
      </div>
    </div>
  );
};

export default Pengingat;
