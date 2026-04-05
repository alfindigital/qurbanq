import { Link } from "react-router-dom";
import { Calculator, PiggyBank, BookOpen, Bell, ArrowRight } from "lucide-react";
import { animalOptions, formatCurrency, getNextIdulAdha } from "@/lib/qurban-data";
import { useEffect, useState } from "react";

const Index = () => {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

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

  const quickLinks = [
    { title: "Kalkulator", desc: "Hitung biaya qurban", icon: Calculator, to: "/kalkulator" },
    { title: "Tabungan", desc: "Simulasi menabung", icon: PiggyBank, to: "/tabungan" },
    { title: "Edukasi", desc: "Hukum & tata cara", icon: BookOpen, to: "/edukasi" },
    { title: "Pengingat", desc: "Checklist persiapan", icon: Bell, to: "/pengingat" },
  ];

  const pricePreview = animalOptions.filter((_, i) => [0, 2, 5, 7].includes(i));

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl bg-primary px-5 py-5 text-primary-foreground">
        <h1 className="text-lg font-bold">🕌 {countdown.days} hari menuju Idul Adha</h1>
        <p className="mt-1 text-sm opacity-70">Yuk persiapkan qurbanmu dari sekarang.</p>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Fitur Utama</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickLinks.map((link) => (
            <Link key={link.to} to={link.to}>
              <div className="group flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center transition-all active:scale-[0.98] hover:border-primary/30">
                <div className="rounded-full bg-primary/8 p-2.5 text-primary">
                  <link.icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{link.title}</p>
                  <p className="text-[11px] text-muted-foreground">{link.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Price Preview */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Kisaran Harga</h2>
          <Link to="/kalkulator" className="flex items-center gap-1 text-xs font-medium text-primary">
            Lihat semua <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
          </Link>
        </div>
        <div className="space-y-2">
          {pricePreview.map((animal) => (
            <div key={animal.id} className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
              <div>
                <p className="text-sm font-medium">{animal.label}</p>
                <p className="text-[11px] text-muted-foreground">{animal.weight}</p>
              </div>
              <p className="text-sm font-semibold text-primary">{formatCurrency(animal.price)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
