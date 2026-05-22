import { Link } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { PiggyBank, BookOpen, Bell, MessageCircle, ChevronRight, UserPlus, X, Users, Share2, Download } from "lucide-react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { animalOptions, formatCurrency, generateWhatsAppLink, getNextIdulAdha, type AnimalType } from "@/lib/qurban-data";

const types: { key: AnimalType; label: string; icon: string }[] = [
  { key: "kambing", label: "Kambing", icon: "🐐" },
  { key: "domba", label: "Domba", icon: "🐑" },
  { key: "sapi", label: "Sapi", icon: "🐄" },
  { key: "unta", label: "Unta", icon: "🐪" },
];

const STORAGE_KEY = "qurbanku-patungan";

const loadSaved = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as { type?: AnimalType; animal?: string; patungan?: boolean; participants?: string[] };
  } catch {}
  return null;
};

const Index = () => {
  const [countdown, setCountdown] = useState({ days: 0 });
  const saved = loadSaved();
  const [selectedType, setSelectedType] = useState<AnimalType | null>(saved?.type ?? null);
  const [selectedAnimal, setSelectedAnimal] = useState<string | null>(saved?.animal ?? null);
  const [persons, setPersons] = useState(1);
  const [patunganMode, setPatunganMode] = useState(saved?.patungan ?? false);
  const [participants, setParticipants] = useState<string[]>(saved?.participants?.length ? saved.participants : [""]);
  const [newName, setNewName] = useState("");
  const summaryRef = useRef<HTMLDivElement>(null);

  const filteredAnimals = selectedType ? animalOptions.filter((a) => a.type === selectedType) : [];
  const animal = animalOptions.find((a) => a.id === selectedAnimal);
  const validParticipants = participants.filter((n) => n.trim());
  const activePersons = patunganMode ? validParticipants.length || 1 : persons;
  const costPerPerson = animal ? Math.ceil(animal.price / activePersons) : 0;

  useEffect(() => {
    const target = getNextIdulAdha();
    const update = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) return;
      setCountdown({ days: Math.floor(diff / (1000 * 60 * 60 * 24)) });
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const data = { type: selectedType, animal: selectedAnimal, patungan: patunganMode, participants: validParticipants };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [selectedType, selectedAnimal, patunganMode, participants]);

  const canPatungan = animal && animal.maxPersons > 1;

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

  const removeParticipant = (index: number) => setParticipants(participants.filter((_, i) => i !== index));

  const handleOrder = () => {
    if (!animal) return;
    const names = validParticipants;
    const participantList = patunganMode && names.length > 0
      ? `\n\n👥 Peserta Patungan (${names.length} orang):\n${names.map((n, i) => `${i + 1}. ${n}`).join("\n")}\n💵 Biaya per orang: ${formatCurrency(costPerPerson)}`
      : "";
    const msg = `Assalamualaikum, saya ingin memesan hewan qurban:\n\n🐾 Hewan: ${animal.label}\n⚖️ Berat: ${animal.weight}\n💰 Harga: ${formatCurrency(animal.price)}${participantList}\n\nMohon informasi lebih lanjut. Jazakallahu khairan.`;
    window.open(generateWhatsAppLink(msg), "_blank");
  };

  const shareToParticipant = (name: string) => {
    if (!animal) return;
    const names = validParticipants;
    const msg = `Assalamualaikum ${name},\n\nBerikut detail patungan qurban kita:\n\n🐾 Hewan: ${animal.label}\n⚖️ Berat: ${animal.weight}\n💰 Harga Total: ${formatCurrency(animal.price)}\n👥 Jumlah Peserta: ${names.length} orang\n\n📋 Daftar Peserta:\n${names.map((n, i) => `${i + 1}. ${n}`).join("\n")}\n\n💵 Biaya per orang: *${formatCurrency(costPerPerson)}*\n\nMohon segera konfirmasi. Jazakallahu khairan 🙏`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const shareToAll = () => {
    if (!animal) return;
    const names = validParticipants;
    const msg = `📢 *Ringkasan Patungan Qurban*\n\n🐾 Hewan: ${animal.label}\n⚖️ Berat: ${animal.weight}\n💰 Harga Total: ${formatCurrency(animal.price)}\n👥 Jumlah Peserta: ${names.length} orang\n\n📋 Daftar Peserta:\n${names.map((n, i) => `${i + 1}. ${n} — ${formatCurrency(costPerPerson)}`).join("\n")}\n\n💵 Biaya per orang: *${formatCurrency(costPerPerson)}*\n\nSilakan transfer ke rekening yang sudah disepakati. Jazakallahu khairan 🙏`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const exportAsImage = useCallback(async () => {
    if (!summaryRef.current || !animal) return;
    try {
      toast.loading("Membuat gambar...", { id: "export" });
      const canvas = await html2canvas(summaryRef.current, { backgroundColor: null, scale: 2, useCORS: true });
      const link = document.createElement("a");
      link.download = `patungan-qurban-${animal.label.toLowerCase().replace(/\s+/g, "-")}.png`;
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
    setPersons(1);
    setPatunganMode(false);
    setParticipants([""]);
    setNewName("");
    localStorage.removeItem(STORAGE_KEY);
  };

  const quickLinks = [
    { title: "Tabungan", desc: "Simulasi menabung", icon: PiggyBank, to: "/tabungan" },
    { title: "Edukasi", desc: "Hukum & tata cara", icon: BookOpen, to: "/edukasi" },
    { title: "Pengingat", desc: "Checklist persiapan", icon: Bell, to: "/pengingat" },
  ];

  return (
    <div className="space-y-5">
      <SEO
        title="Qurbanku — Kalkulator Patungan & Tabungan Qurban"
        description="Hitung biaya qurban Idul Adha, atur patungan sapi/kambing, dan kirim pesanan via WhatsApp langsung dari beranda Qurbanku."
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Qurbanku",
          applicationCategory: "LifestyleApplication",
          description: "Kalkulator patungan dan tabungan qurban Idul Adha.",
          url: "https://qurban-q.lovable.app/",
        }}
      />
      {/* Hero */}
      <div className="rounded-2xl bg-primary px-5 py-5 text-primary-foreground">
        <h1 className="text-lg font-bold">🕌 {countdown.days} hari menuju Idul Adha</h1>
        <p className="mt-1 text-sm opacity-70">Yuk persiapkan qurbanmu dari sekarang.</p>
      </div>

      {/* Calculator inline */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pilih Jenis Hewan</p>
        <div className="grid grid-cols-4 gap-2">
          {types.map((t) => (
            <button
              key={t.key}
              onClick={() => { setSelectedType(t.key); setSelectedAnimal(null); setPersons(1); setPatunganMode(false); setParticipants([""]); setNewName(""); }}
              className={`flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-all active:scale-95 ${selectedType === t.key ? "border-primary bg-primary/5" : "border-border"}`}
            >
              <span className="text-xl">{t.icon}</span>
              <span className="text-[11px] font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {selectedType && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pilih Hewan</p>
          <div className="space-y-2">
            {filteredAnimals.map((a) => (
              <button
                key={a.id}
                onClick={() => { setSelectedAnimal(a.id); setPersons(1); setPatunganMode(false); setParticipants([""]); setNewName(""); }}
                className={`w-full flex items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition-all active:scale-[0.98] ${selectedAnimal === a.id ? "border-primary bg-primary/5" : "border-border"}`}
              >
                <div>
                  <p className="text-sm font-medium">{a.label}</p>
                  <p className="text-[11px] text-muted-foreground">{a.weight} · {a.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-primary">{formatCurrency(a.price)}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Patungan */}
      {canPatungan && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button variant={!patunganMode ? "default" : "outline"} size="sm" className="flex-1" onClick={() => setPatunganMode(false)}>Pribadi</Button>
            <Button variant={patunganMode ? "default" : "outline"} size="sm" className="flex-1" onClick={() => setPatunganMode(true)}>
              <Users className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.5} /> Patungan
            </Button>
          </div>

          {!patunganMode && (
            <div className="rounded-xl border bg-card p-4">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Jumlah Peserta (maks {animal!.maxPersons})</Label>
              <div className="mt-2 flex items-center gap-3">
                <Input type="number" min={1} max={animal!.maxPersons} value={persons} onChange={(e) => setPersons(Math.min(animal!.maxPersons, Math.max(1, parseInt(e.target.value) || 1)))} className="w-20" />
                <span className="text-sm text-muted-foreground">orang</span>
              </div>
            </div>
          )}

          {patunganMode && (
            <div className="rounded-xl border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Peserta Patungan</Label>
                <span className="text-xs text-muted-foreground">{validParticipants.length}/{animal!.maxPersons} orang</span>
              </div>
              <div className="space-y-1.5">
                <AnimatePresence mode="popLayout">
                  {validParticipants.map((name, i) => (
                    <motion.div key={name} layout initial={{ opacity: 0, scale: 0.9, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, x: 40 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">{i + 1}</span>
                        <span className="text-sm font-medium">{name}</span>
                      </div>
                      <button onClick={() => removeParticipant(i)} className="text-muted-foreground hover:text-destructive transition-colors"><X className="h-3.5 w-3.5" strokeWidth={1.5} /></button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              {validParticipants.length < animal!.maxPersons && (
                <div className="flex gap-2">
                  <Input placeholder="Nama peserta..." value={newName} maxLength={50} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addParticipant(); } }} className="flex-1 text-sm" />
                  <Button size="sm" variant="outline" onClick={addParticipant} disabled={!newName.trim()}><UserPlus className="h-4 w-4" strokeWidth={1.5} /></Button>
                </div>
              )}
              {validParticipants.length > 0 && (
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Biaya per orang</span>
                    <span className="font-bold text-primary">{formatCurrency(costPerPerson)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Result */}
      {animal && (
        <div ref={summaryRef} className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ringkasan</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Hewan</span><span className="font-medium">{animal.label}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Berat</span><span className="font-medium">{animal.weight}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Harga Total</span><span className="font-semibold text-primary">{formatCurrency(animal.price)}</span></div>
            {animal.maxPersons > 1 && (
              <>
                <div className="flex justify-between"><span className="text-muted-foreground">Peserta</span><span className="font-medium">{activePersons} orang</span></div>
                {patunganMode && validParticipants.length > 0 && (
                  <div className="border-t pt-2 space-y-1">
                    {validParticipants.map((name, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{i + 1}. {name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{formatCurrency(costPerPerson)}</span>
                          <button onClick={() => shareToParticipant(name)} className="text-muted-foreground hover:text-primary transition-colors" title={`Kirim ke ${name}`}><Share2 className="h-3 w-3" strokeWidth={1.5} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">Per Orang</span>
                  <span className="text-lg font-bold text-primary">{formatCurrency(costPerPerson)}</span>
                </div>
              </>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Button onClick={handleOrder} className="bg-[hsl(var(--wa-green))] hover:bg-[hsl(var(--wa-green))]/90 text-white">
              <MessageCircle className="mr-2 h-4 w-4" strokeWidth={1.5} /> Pesan via WhatsApp
            </Button>
            {patunganMode && validParticipants.length > 1 && (
              <Button variant="outline" size="sm" onClick={shareToAll}><Share2 className="mr-2 h-4 w-4" strokeWidth={1.5} /> Share Ringkasan ke Peserta</Button>
            )}
            {patunganMode && validParticipants.length > 0 && (
              <Button variant="outline" size="sm" onClick={exportAsImage}><Download className="mr-2 h-4 w-4" strokeWidth={1.5} /> Unduh Gambar Ringkasan</Button>
            )}
            <Button variant="ghost" size="sm" onClick={resetAll}>Hitung Ulang</Button>
          </div>
          <p className="text-[11px] text-muted-foreground text-center">* Harga estimasi. Hubungi kami untuk penawaran terbaik.</p>
        </div>
      )}

      {/* Quick Links */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fitur Lainnya</p>
        <div className="grid grid-cols-3 gap-2">
          {quickLinks.map((link) => (
            <Link key={link.to} to={link.to}>
              <div className="group flex flex-col items-center gap-2 rounded-xl border bg-card p-3 text-center transition-all active:scale-[0.98] hover:border-primary/30">
                <div className="rounded-full bg-primary/8 p-2 text-primary"><link.icon className="h-4 w-4" strokeWidth={1.5} /></div>
                <div>
                  <p className="text-xs font-medium text-foreground">{link.title}</p>
                  <p className="text-[10px] text-muted-foreground">{link.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;