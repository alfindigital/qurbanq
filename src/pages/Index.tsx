import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";

import { PiggyBank, BookOpen, Bell, MessageCircle, ChevronRight, UserPlus, X, Share2, Download, Heart, HandHeart, Utensils, CheckCircle2, Sparkles, HelpCircle, Check, Copy } from "lucide-react";
import SEO from "@/components/SEO";
import BackupDataCard from "@/components/BackupDataCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { animalOptions, faqItems, formatCurrency, generateWhatsAppLink, getDaysUntilIdulAdha, getNextIdulAdhaInfo, type AnimalType } from "@/lib/qurban-data";
import { animalIconMap } from "@/components/AnimalIcons";
import { buildShareUrl, readIncomingShare } from "@/lib/share-state";
import { pushOrderHistory } from "@/lib/order-history";
import TrustSection from "@/components/TrustSection";
import TestimonialSection from "@/components/TestimonialSection";
import WeeklyRecap from "@/components/WeeklyRecap";
import AqiqahCard from "@/components/AqiqahCard";
import OrderHistorySection from "@/components/OrderHistorySection";


const types: { key: AnimalType; label: string; icon: React.ComponentType<{ className?: string; label?: string }> }[] = [
  { key: "kambing", label: "Kambing", icon: animalIconMap.kambing },
  { key: "domba", label: "Domba", icon: animalIconMap.domba },
  { key: "sapi", label: "Sapi", icon: animalIconMap.sapi },
  { key: "unta", label: "Unta", icon: animalIconMap.unta },
];

// Selaras dengan Kalkulator.tsx supaya state kalkulator di Beranda & /kalkulator sinkron.
const STORAGE_KEY = "qurbanku-kalkulator";

const loadSaved = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as { type?: AnimalType; animal?: string; participants?: string[]; persons?: number };
  } catch {}
  return null;
};

const PAID_KEY = "qurbanku-paid-participants";
const loadPaid = (): string[] => {
  try {
    const raw = localStorage.getItem(PAID_KEY);
    if (raw) return JSON.parse(raw) as string[];
  } catch {}
  return [];
};

const Index = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState({ days: 0 });
  const [hijriYear, setHijriYear] = useState<number>(() => getNextIdulAdhaInfo().hijriYear);
  const saved = loadSaved();
  const [selectedType, setSelectedType] = useState<AnimalType | null>(saved?.type ?? null);
  const [selectedAnimal, setSelectedAnimal] = useState<string | null>(saved?.animal ?? null);
  const [persons, setPersons] = useState(saved?.persons ?? 7);
  const [participants, setParticipants] = useState<string[]>(saved?.participants?.length ? saved.participants : [""]);
  const [paidParticipants, setPaidParticipants] = useState<string[]>(loadPaid);
  const [newName, setNewName] = useState("");
  const summaryRef = useRef<HTMLDivElement>(null);
  // #39 Upsell distribusi ke pelosok
  const [addonPelosok, setAddonPelosok] = useState(false);
  const ADDON_PRICE = 150000;

  const filteredAnimals = selectedType ? animalOptions.filter((a) => a.type === selectedType) : [];
  const animal = animalOptions.find((a) => a.id === selectedAnimal);
  const validParticipants = participants.filter((n) => n.trim());
  const activePersons = persons;
  const costPerPerson = animal ? Math.ceil(animal.price / activePersons) : 0;

  // #44: kalau user buka via share link `?p=<base64>`, prefill state.
  useEffect(() => {
    const incoming = readIncomingShare();
    if (!incoming) return;
    if (incoming.type) setSelectedType(incoming.type);
    if (incoming.animal) setSelectedAnimal(incoming.animal);
    if (typeof incoming.persons === "number") setPersons(incoming.persons);
    if (incoming.participants?.length) setParticipants(incoming.participants);
    toast.success("Konfigurasi qurban dimuat dari link");
  }, []);

  useEffect(() => {
    const update = () => {
      const info = getNextIdulAdhaInfo();
      setHijriYear(info.hijriYear);
      setCountdown({ days: getDaysUntilIdulAdha() });
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const data = { type: selectedType, animal: selectedAnimal, persons, participants: validParticipants };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [selectedType, selectedAnimal, persons, participants]);

  useEffect(() => {
    localStorage.setItem(PAID_KEY, JSON.stringify(paidParticipants));
  }, [paidParticipants]);

  const canPatungan = animal && animal.maxPersons > 1;

  // #12 confirm sebelum reset peserta saat ganti jenis.
  const changeType = (next: AnimalType) => {
    if (next === selectedType) return;
    if (validParticipants.length > 0) {
      const ok = window.confirm(`Ganti jenis ke ${next}? Daftar ${validParticipants.length} peserta akan dihapus.`);
      if (!ok) return;
    }
    setSelectedType(next);
    setSelectedAnimal(null);
    setParticipants([""]);
    setNewName("");
  };

  // Pilih hewan di beranda = langsung lompat ke tab Hitung dengan hasil sudah terisi.
  const changeAnimal = (id: string) => {
    const a = animalOptions.find((x) => x.id === id);
    if (!a) return;
    const nextParticipants =
      validParticipants.length > a.maxPersons ? validParticipants.slice(0, a.maxPersons) : validParticipants;
    const nextPersons = Math.min(persons, a.maxPersons);
    setSelectedAnimal(id);
    setSelectedType(a.type);
    setPersons(nextPersons);
    if (nextParticipants.length !== validParticipants.length) setParticipants(nextParticipants);

    // Tulis dulu supaya Kalkulator membaca pilihan terbaru saat mount (efek persist berjalan setelah navigasi).
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ type: a.type, animal: id, persons: nextPersons, participants: nextParticipants }),
      );
    } catch {}
    navigate("/kalkulator", { state: { focusSummary: true } });
  };


  const togglePaid = (name: string) => {
    setPaidParticipants((p) => (p.includes(name) ? p.filter((n) => n !== name) : [...p, name]));
  };

  const addParticipant = () => {
    const name = newName.trim();
    if (!name || !animal) return;
    if (validParticipants.length >= animal.maxPersons) return;
    if (participants.some((n) => n.trim().toLowerCase() === name.toLowerCase())) {
      toast.error("Nama sudah ada", { description: `"${name}" sudah terdaftar sebagai peserta.` });
      return;
    }
    setParticipants([...validParticipants, name]);
    setNewName("");
  };

  const removeParticipant = (index: number) => {
    const removed = validParticipants[index];
    setParticipants(validParticipants.filter((_, i) => i !== index));
    if (removed) setPaidParticipants((p) => p.filter((n) => n !== removed));
  };

  const handleOrder = () => {
    if (!animal) return;
    const names = validParticipants;
    const participantList = names.length > 0
      ? `\n\nDaftar Peserta (${activePersons} orang):\n${names.map((n, i) => `${i + 1}. ${n}${paidParticipants.includes(n) ? " (Lunas)" : ""}`).join("\n")}\nBiaya per orang: ${formatCurrency(costPerPerson)}`
      : `\n\nJumlah Peserta: ${activePersons} orang\nBiaya per orang: ${formatCurrency(costPerPerson)}`;
    const addonLine = addonPelosok ? `\n\nAdd-on: Kirim daging ke pelosok (+${formatCurrency(ADDON_PRICE)})` : "";
    const total = animal.price + (addonPelosok ? ADDON_PRICE : 0);
    const msg = `Assalamualaikum, saya ingin memesan hewan qurban:\n\nHewan: ${animal.label}\nBerat: ${animal.weight}\nHarga: ${formatCurrency(animal.price)}${addonLine}${participantList}\n\nTotal: ${formatCurrency(total)}\n\nMohon informasi lebih lanjut. Jazakallahu khairan.`;
    pushOrderHistory({ source: "beranda:pesan", label: animal.label, amount: total });
    window.open(generateWhatsAppLink(msg, "beranda:pesan"), "_blank");
  };

  const shareToParticipant = (name: string) => {
    if (!animal) return;
    const names = validParticipants;
    const link = buildShareUrl({ type: selectedType, animal: selectedAnimal, persons: activePersons, participants: validParticipants });
    const msg = `Assalamualaikum ${name},\n\nBerikut detail qurban kita:\n\nHewan: ${animal.label}\nBerat: ${animal.weight}\nHarga Total: ${formatCurrency(animal.price)}\nJumlah Peserta: ${activePersons} orang\n\nDaftar Peserta:\n${names.map((n, i) => `${i + 1}. ${n}`).join("\n")}\n\nBiaya per orang: *${formatCurrency(costPerPerson)}*\n\nDetail: ${link}\n\nMohon segera konfirmasi. Jazakallahu khairan.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const shareToAll = () => {
    if (!animal) return;
    const names = validParticipants;
    const link = buildShareUrl({ type: selectedType, animal: selectedAnimal, persons: activePersons, participants: validParticipants });
    const msg = `*Ringkasan Qurban*\n\nHewan: ${animal.label}\nBerat: ${animal.weight}\nHarga Total: ${formatCurrency(animal.price)}\nJumlah Peserta: ${activePersons} orang\n\nDaftar Peserta:\n${names.map((n, i) => `${i + 1}. ${n} — ${formatCurrency(costPerPerson)}${paidParticipants.includes(n) ? " (Lunas)" : ""}`).join("\n")}\n\nBiaya per orang: *${formatCurrency(costPerPerson)}*\n\nBuka di Qurbanku: ${link}\n\nSilakan transfer ke rekening yang sudah disepakati. Jazakallahu khairan.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const copyShareLink = async () => {
    const link = buildShareUrl({ type: selectedType, animal: selectedAnimal, persons: activePersons, participants: validParticipants });
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Link qurban disalin", { description: "Bagikan ke grup keluarga/teman." });
    } catch {
      toast.error("Gagal menyalin link");
    }
  };


  const exportAsImage = useCallback(async () => {
    if (!summaryRef.current || !animal) return;
    try {
      toast.loading("Membuat gambar...", { id: "export" });
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(summaryRef.current, { backgroundColor: null, scale: 2, useCORS: true });
      const link = document.createElement("a");
      link.download = `qurban-${animal.label.toLowerCase().replace(/\s+/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Gambar berhasil diunduh!", { id: "export" });
    } catch {
      toast.error("Gagal membuat gambar", { id: "export" });
    }
  }, [animal]);

  const resetAll = () => {
    setSelectedType(null);
    setSelectedAnimal(null);
    setPersons(7);
    setParticipants([""]);
    setPaidParticipants([]);
    setNewName("");
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PAID_KEY);
  };

  const quickLinks = [
    { title: "Tabungan", desc: "Simulasi menabung", icon: PiggyBank, to: "/tabungan" },
    { title: "Edukasi", desc: "Hukum & tata cara", icon: BookOpen, to: "/edukasi" },
    { title: "Pengingat", desc: "Checklist persiapan", icon: Bell, to: "/pengingat" },
  ];

  return (
    <div className="space-y-6">
      <SEO
        title="Qurbanku — Kalkulator & Tabungan Qurban"
        description="Hitung biaya qurban Idul Adha per orang, atur daftar peserta, dan kirim pesanan via WhatsApp langsung dari beranda Qurbanku."
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Qurbanku",
          applicationCategory: "LifestyleApplication",
          description: "Kalkulator dan tabungan qurban Idul Adha.",
          url: "https://qurban-q.lovable.app/",
        }}
      />

      {/* Hero countdown + CTA nabung harian */}
      {(() => {
        const cheapest = animalOptions.reduce((min, a) => (a.price < min.price ? a : min), animalOptions[0]);
        const daysLeft = Math.max(1, countdown.days);
        const perDay = Math.ceil(cheapest.price / daysLeft);
        return (
          <section className="relative overflow-hidden rounded-[2rem] bg-secondary p-6 text-secondary-foreground shadow-soft">
            <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-primary/20" aria-hidden />
            <div className="absolute right-4 top-4 h-12 w-12 rounded-full bg-background/15" aria-hidden />
            <div className="relative z-10 space-y-4">
              <h1 className="font-display text-2xl font-bold leading-tight">
                {countdown.days} Hari Menuju Hari Raya Idul Adha {hijriYear} H
              </h1>
              <p className="text-xs opacity-90">
                Nabung <span className="font-bold">{formatCurrency(perDay)}/hari</span> sudah cukup buat 1 kambing/domba. Yuk Qurban!
              </p>
              <Link
                to="/tabungan"
                className="inline-flex items-center gap-1.5 rounded-full bg-background/90 px-4 py-2 text-xs font-bold text-forest shadow-soft hover:bg-background transition-colors"
              >
                Mulai Nabung
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
              </Link>
            </div>
          </section>
        );
      })()}

      {/* Animal type picker */}
      <section>
        <h2 className="mb-3 font-display text-base font-bold text-forest">Pilih Jenis Hewan</h2>
        <div className="grid grid-cols-4 gap-2.5">
          {types.map((t) => {
            const active = selectedType === t.key;
            return (
              <button
                key={t.key}
                aria-pressed={active}
                onClick={() => changeType(t.key)}
                className={`flex flex-col items-center gap-2 rounded-2xl border-2 bg-card p-3 transition-colors active:scale-95 ${active ? "border-primary shadow-soft text-primary" : "border-border text-forest hover:text-primary hover:border-primary/40"}`}
              >
                <span className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${active ? "bg-terracotta-soft" : "bg-muted"}`}>
                  <t.icon className="h-6 w-6" label={`Ikon ${t.label.toLowerCase()}`} />
                </span>
                <span className="text-[11px] font-semibold">{t.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {selectedType && (
        <section>
          <h2 className="mb-3 font-display text-base font-bold text-forest">Pilih Hewan</h2>
          <div className="space-y-2">
            {filteredAnimals.map((a) => {
              const active = selectedAnimal === a.id;
              return (
                <button
                  key={a.id}
                  onClick={() => changeAnimal(a.id)}
                  className={`flex w-full items-center justify-between rounded-2xl border-2 bg-card px-4 py-3.5 text-left transition-all active:scale-[0.98] ${active ? "border-primary shadow-soft" : "border-border"}`}
                >
                  <div>
                    <p className="text-sm font-semibold text-forest">{a.label}</p>
                    <p className="text-[11px] text-muted-foreground">{a.weight} · {a.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-primary">{formatCurrency(a.price)}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.8} />
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Calculator card */}
      {canPatungan && (
        <section className="rounded-[1.75rem] border border-accent/30 bg-peach-soft p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-primary">Simulasi Qurban</h2>
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
              {animal!.label}
            </span>
          </div>

          <div className="rounded-2xl bg-card p-4">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-forest">
              Jumlah Peserta (maks {animal!.maxPersons})
            </Label>
            <div className="mt-2 flex items-center gap-3">
              <Input
                type="number"
                min={1}
                max={animal!.maxPersons}
                value={persons}
                onChange={(e) => setPersons(Math.min(animal!.maxPersons, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-20 bg-background"
                aria-label="Jumlah peserta"
              />
              <span className="text-sm text-muted-foreground">orang</span>
            </div>
          </div>

          <div className="rounded-2xl bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-forest">Daftar Peserta</Label>
              <span className="text-xs text-muted-foreground">{validParticipants.length}/{animal!.maxPersons} orang · {paidParticipants.filter((n) => validParticipants.includes(n)).length} lunas</span>
            </div>
            <div className="space-y-1.5">
              <AnimatePresence mode="popLayout">
                {validParticipants.map((name, i) => {
                  const isPaid = paidParticipants.includes(name);
                  return (
                    <motion.div key={name} layout initial={{ opacity: 0, scale: 0.9, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, x: 40 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className={`flex items-center justify-between rounded-xl px-3 py-2 ${isPaid ? "bg-primary/15" : "bg-muted"}`}>
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">{i + 1}</span>
                        <span className="text-sm font-medium text-forest">{name}</span>
                        {isPaid && <span className="text-[9px] font-bold text-primary">LUNAS</span>}
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => togglePaid(name)} aria-label={`Tandai ${name} ${isPaid ? "belum" : "sudah"} transfer`} title={isPaid ? "Batal lunas" : "Tandai lunas"} className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors ${isPaid ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:text-primary"}`}>
                          <Check className="h-3 w-3" strokeWidth={2.4} />
                        </button>
                        <button onClick={() => removeParticipant(i)} aria-label={`Hapus peserta ${name}`} className="text-muted-foreground hover:text-destructive transition-colors p-1"><X className="h-3.5 w-3.5" strokeWidth={2} /></button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            {validParticipants.length < animal!.maxPersons && (
              <div className="flex gap-2">
                <Input placeholder="Nama peserta..." value={newName} maxLength={50} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addParticipant(); } }} className="flex-1 bg-background text-sm" aria-label="Nama peserta baru" />
                <Button size="sm" onClick={addParticipant} disabled={!newName.trim()} aria-label="Tambah peserta" className="bg-primary text-primary-foreground hover:bg-primary/90"><UserPlus className="h-4 w-4" strokeWidth={2} /></Button>
              </div>
            )}
          </div>

          {animal && (
            <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-dashed border-primary/30 bg-card p-3">
              <input
                type="checkbox"
                checked={addonPelosok}
                onChange={(e) => setAddonPelosok(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-primary"
              />
              <div className="flex-1">
                <p className="text-xs font-semibold text-forest">Kirim daging ke pelosok</p>
                <p className="text-[10px] text-muted-foreground">Distribusi ke daerah 3T. +{formatCurrency(ADDON_PRICE)}</p>
              </div>
            </label>
          )}

          {animal && animal.maxPersons > 1 && validParticipants.length > 0 && validParticipants.length < animal.maxPersons && costPerPerson < 2500000 && (
            <div className="rounded-xl bg-terracotta-soft p-3 text-[11px] text-forest">
              💡 Biaya per orang saat ini <strong>{formatCurrency(costPerPerson)}</strong>. Ajak {animal.maxPersons - validParticipants.length} orang lagi supaya patungan sapi lebih hemat.
            </div>
          )}

          {animal && (
            <>
              <div className="flex items-end justify-between border-t border-accent/30 pt-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-forest">
                    Per Orang
                  </p>
                  <p className="font-display text-2xl font-bold text-primary leading-tight">
                    {formatCurrency(costPerPerson)}
                  </p>
                </div>
                <Button onClick={handleOrder} size="sm" className="rounded-xl bg-primary text-primary-foreground shadow-warm hover:bg-primary/90">
                  <MessageCircle className="mr-1.5 h-4 w-4" strokeWidth={2} /> Pesan
                </Button>
              </div>
            </>
          )}
        </section>
      )}

      {/* Result summary */}
      {animal && validParticipants.length > 0 && (
        <section ref={summaryRef} className="rounded-2xl border border-border bg-card p-5 space-y-3" aria-labelledby="daftar-peserta-heading">
          <h2 id="daftar-peserta-heading" className="text-[10px] font-bold uppercase tracking-wider text-forest">Daftar Peserta</h2>
          <div className="space-y-1.5">
            {validParticipants.map((name, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-forest">{i + 1}. {name}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-primary">{formatCurrency(costPerPerson)}</span>
                  <button onClick={() => shareToParticipant(name)} aria-label={`Kirim ringkasan ke ${name}`} className="text-muted-foreground hover:text-primary transition-colors" title={`Kirim ke ${name}`}><Share2 className="h-3.5 w-3.5" strokeWidth={2} /></button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2 pt-2">
            {validParticipants.length > 1 && (
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={shareToAll}><Share2 className="mr-1.5 h-4 w-4" strokeWidth={2} /> Share</Button>
                <Button variant="outline" size="sm" onClick={copyShareLink}><Copy className="mr-1.5 h-4 w-4" strokeWidth={2} /> Salin Link</Button>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={exportAsImage}><Download className="mr-2 h-4 w-4" strokeWidth={2} /> Unduh Gambar Ringkasan</Button>
            <Button variant="ghost" size="sm" onClick={resetAll}>Hitung Ulang</Button>
          </div>
        </section>
      )}


      {/* Quick links */}
      <section>
        <h2 className="mb-3 font-display text-base font-bold text-forest">Layanan Kami</h2>
        <div className="grid grid-cols-3 gap-3">
          {quickLinks.map((link, i) => {
            const tones = [
              { bg: "bg-terracotta-soft", fg: "text-primary" },
              { bg: "bg-sage-soft", fg: "text-primary" },
              { bg: "bg-peach-soft", fg: "text-accent-foreground" },
            ];
            const tone = tones[i % tones.length];
            return (
              <Link key={link.to} to={link.to}>
                <div className="group flex h-full flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 text-center transition-all active:scale-[0.96]">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${tone.bg} ${tone.fg}`}>
                    <link.icon className="h-5 w-5" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-forest">{link.title}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">{link.desc}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Hadits / motivasi */}
      <section className="relative overflow-hidden rounded-[1.75rem] border border-accent/30 bg-peach-soft p-6" aria-labelledby="motivasi-qurban-heading">
        <Sparkles className="absolute right-4 top-4 h-5 w-5 text-accent" strokeWidth={1.6} aria-hidden />
        <h2 id="motivasi-qurban-heading" className="text-[10px] font-bold uppercase tracking-wider text-primary">Motivasi Qurban</h2>
        <blockquote className="mt-3 font-brand text-lg leading-snug text-forest">
          "Tidak ada amalan anak Adam di hari Nahr yang lebih dicintai Allah daripada mengalirkan darah (berqurban)."
        </blockquote>
        <p className="mt-2 text-xs text-muted-foreground">— HR. Tirmidzi</p>
      </section>

      {/* Pembagian daging */}
      <section>
        <h2 className="mb-3 font-display text-base font-bold text-forest">Pembagian Daging Qurban</h2>
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { icon: Utensils, label: "Keluarga", desc: "⅓ untuk dimakan sendiri", tone: "bg-terracotta-soft text-primary" },
            { icon: HandHeart, label: "Fakir Miskin", desc: "⅓ untuk disedekahkan", tone: "bg-sage-soft text-primary" },
            { icon: Heart, label: "Kerabat", desc: "⅓ untuk dihadiahkan", tone: "bg-peach-soft text-accent-foreground" },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-3 text-center">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${item.tone}`}>
                <item.icon className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-xs font-bold text-forest">{item.label}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tips persiapan singkat */}
      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="font-display text-base font-bold text-forest">Tips Persiapan</h2>
          <Link to="/pengingat" className="text-[11px] font-semibold text-primary hover:underline">
            Lihat semua
          </Link>
        </div>
        <div className="space-y-2">
          {[
            "Niatkan qurban karena Allah SWT",
            "Pilih hewan sesuai syarat (usia, sehat, tidak cacat)",
            "Pesan hewan qurban jauh-jauh hari",
            "Siapkan dana lewat tabungan qurban",
          ].map((tip) => (
            <div key={tip} className="flex items-start gap-3 rounded-2xl border border-border bg-card px-4 py-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" strokeWidth={2} />
              <p className="text-sm text-forest">{tip}</p>
            </div>
          ))}
        </div>
      </section>

      <WeeklyRecap />

      <TrustSection />

      <TestimonialSection />

      <AqiqahCard />

      <OrderHistorySection />



      {/* FAQ singkat */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-primary" strokeWidth={2} />
          <h2 className="font-display text-base font-bold text-forest">Pertanyaan Umum</h2>
        </div>
        <div className="rounded-2xl border border-border bg-card px-4">
          <Accordion type="single" collapsible>
            {faqItems.slice(0, 4).map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-border last:border-0">
                <AccordionTrigger className="text-left text-sm font-semibold text-forest hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-xs leading-relaxed text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <BackupDataCard />

      {/* CTA WhatsApp */}
      <section className="rounded-[1.75rem] bg-secondary p-6 text-secondary-foreground shadow-soft">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <MessageCircle className="h-6 w-6" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-base font-bold">Butuh Bantuan Memilih?</h2>
            <p className="mt-1 text-xs opacity-90">Tim kami siap membantu konsultasi qurban untuk Anda.</p>
            <Button
              size="sm"
              variant="secondary"
              className="mt-3 bg-background text-foreground hover:bg-background/90"
              onClick={() => window.open(generateWhatsAppLink("Assalamualaikum, saya ingin konsultasi qurban.", "beranda:konsultasi"), "_blank")}
            >
              Chat via WhatsApp
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
