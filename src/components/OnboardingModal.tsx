import { useEffect, useState } from "react";
import { Calculator, PiggyBank, Bell } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const ONBOARD_KEY = "qurbanku-onboarded";

const slides = [
  {
    icon: Calculator,
    title: "Hitung Patungan Qurban",
    body: "Pilih sapi, kambing, domba, atau unta. Kalkulator otomatis membagi biaya per peserta dan siap kamu bagikan ke grup keluarga via WhatsApp.",
    tone: "bg-terracotta-soft text-primary",
  },
  {
    icon: PiggyBank,
    title: "Nabung Terarah Tiap Bulan",
    body: "Tentukan hewan target dan jangka waktu, Qurbanku hitung setoran per bulan/minggu/hari plus progress menabungmu.",
    tone: "bg-sage-soft text-secondary",
  },
  {
    icon: Bell,
    title: "Pengingat Idul Adha",
    body: "Countdown otomatis, checklist persiapan, dan notifikasi H-30/7/3/1 supaya persiapan qurban tidak mepet.",
    tone: "bg-peach-soft text-accent-foreground",
  },
];

const OnboardingModal = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(ONBOARD_KEY)) {
      // delay biar first paint tidak keblokir
      const t = setTimeout(() => setOpen(true), 500);
      return () => clearTimeout(t);
    }
  }, []);

  const finish = () => {
    localStorage.setItem(ONBOARD_KEY, "1");
    setOpen(false);
  };

  const current = slides[step];
  const isLast = step === slides.length - 1;

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : finish())}>
      <DialogContent className="max-w-sm rounded-3xl p-0 overflow-hidden">
        <div className="p-6 space-y-5">
          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${current.tone}`}>
            <current.icon className="h-8 w-8" strokeWidth={1.8} />
          </div>
          <div className="space-y-2">
            <DialogTitle className="font-display text-xl font-bold text-forest">{current.title}</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
              {current.body}
            </DialogDescription>
          </div>
          <div className="flex justify-center gap-1.5 pt-1">
            {slides.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-primary" : "w-1.5 bg-muted"}`}
              />
            ))}
          </div>
          <div className="flex items-center justify-between gap-3 pt-1">
            <Button variant="ghost" size="sm" onClick={finish} className="text-muted-foreground">
              Lewati
            </Button>
            <Button
              size="sm"
              onClick={() => (isLast ? finish() : setStep((s) => s + 1))}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLast ? "Mulai" : "Lanjut"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
