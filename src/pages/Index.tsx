import { Link } from "react-router-dom";
import { Calculator, PiggyBank, BookOpen, Bell, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    { title: "Kalkulator Qurban", desc: "Hitung biaya qurban Anda", icon: Calculator, to: "/kalkulator" },
    { title: "Tabungan Qurban", desc: "Simulasi menabung", icon: PiggyBank, to: "/tabungan" },
    { title: "Edukasi Qurban", desc: "Pelajari hukum & tata cara", icon: BookOpen, to: "/edukasi" },
    { title: "Pengingat", desc: "Checklist & countdown", icon: Bell, to: "/pengingat" },
  ];

  const pricePreview = animalOptions.filter((_, i) => [0, 2, 5, 7].includes(i));

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="rounded-2xl bg-primary p-6 md:p-10 text-primary-foreground">
        <h1 className="text-2xl md:text-4xl font-bold mb-2">Assalamualaikum! 🕌</h1>
        <p className="text-primary-foreground/80 mb-6 max-w-xl">
          Selamat datang di Aplikasi Qurban — panduan lengkap untuk merencanakan ibadah qurban Anda dengan mudah dan tepat.
        </p>

        {/* Countdown */}
        <div className="flex gap-3 md:gap-5 flex-wrap">
          {[
            { label: "Hari", value: countdown.days },
            { label: "Jam", value: countdown.hours },
            { label: "Menit", value: countdown.minutes },
            { label: "Detik", value: countdown.seconds },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center rounded-xl bg-primary-foreground/10 px-4 py-3 min-w-[70px]">
              <span className="text-2xl md:text-3xl font-bold">{String(item.value).padStart(2, "0")}</span>
              <span className="text-xs text-primary-foreground/70">{item.label}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-primary-foreground/60">Menuju Idul Adha 1447 H</p>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">Fitur Utama</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((link) => (
            <Link key={link.to} to={link.to}>
              <Card className="h-full transition-all hover:shadow-md hover:border-primary/30 group cursor-pointer">
                <CardContent className="flex items-start gap-3 p-5">
                  <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                    <link.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{link.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{link.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Price Preview */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">Kisaran Harga Hewan Qurban</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {pricePreview.map((animal) => (
            <Card key={animal.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">{animal.label}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-lg font-bold text-primary">{formatCurrency(animal.price)}</p>
                <p className="text-xs text-muted-foreground">{animal.weight} · {animal.maxPersons === 1 ? "1 orang" : `maks ${animal.maxPersons} orang`}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-3">
          <Link to="/kalkulator">
            <Button variant="outline" size="sm">
              Lihat semua harga & hitung biaya <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
