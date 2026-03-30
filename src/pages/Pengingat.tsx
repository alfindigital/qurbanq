import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Bell, Clock, MessageCircle, CheckCircle2 } from "lucide-react";
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
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pengingat Qurban</h1>
        <p className="text-muted-foreground mt-1">Countdown & checklist persiapan qurban Anda</p>
      </div>

      {/* Countdown */}
      <Card className="bg-primary text-primary-foreground">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5" />
            <h2 className="text-lg font-bold">Countdown Idul Adha 1447 H</h2>
          </div>
          <div className="flex gap-4 flex-wrap">
            {[
              { label: "Hari", value: countdown.days },
              { label: "Jam", value: countdown.hours },
              { label: "Menit", value: countdown.minutes },
              { label: "Detik", value: countdown.seconds },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center rounded-xl bg-primary-foreground/10 px-5 py-3 min-w-[80px]">
                <span className="text-3xl font-bold">{String(item.value).padStart(2, "0")}</span>
                <span className="text-xs text-primary-foreground/70">{item.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" /> Checklist Persiapan Qurban
          </CardTitle>
          <CardDescription>
            {completedCount}/{totalItems} selesai
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {categories.map((cat) => (
            <div key={cat}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{cat}</h3>
              <div className="space-y-2">
                {preparationChecklist
                  .filter((c) => c.category === cat)
                  .map((item) => (
                    <label
                      key={item.id}
                      className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all ${checked[item.id] ? "bg-primary/5 border-primary/20" : "hover:border-primary/20"}`}
                    >
                      <Checkbox checked={!!checked[item.id]} onCheckedChange={() => toggleCheck(item.id)} />
                      <span className={`text-sm ${checked[item.id] ? "line-through text-muted-foreground" : ""}`}>
                        {item.label}
                      </span>
                      {checked[item.id] && <CheckCircle2 className="ml-auto h-4 w-4 text-primary" />}
                    </label>
                  ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-5 text-center">
          <p className="text-sm text-muted-foreground mb-3">Jangan tunda persiapan qurban Anda. Pesan sekarang!</p>
          <Button
            className="bg-[hsl(142,70%,35%)] hover:bg-[hsl(142,70%,30%)] text-white"
            onClick={() => window.open(generateWhatsAppLink("Assalamualaikum, saya ingin memesan hewan qurban. Mohon info ketersediaan dan harga terbaru."), "_blank")}
          >
            <MessageCircle className="mr-2 h-4 w-4" /> Pesan Hewan Qurban via WhatsApp
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Pengingat;
