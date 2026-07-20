import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageCircle, ChevronRight, UserPlus, X, Share2, Download, Check, Copy } from "lucide-react";
import SEO from "@/components/SEO";
import { animalOptions, formatCurrency, generateWhatsAppLink, getNextIdulAdha, type AnimalType } from "@/lib/qurban-data";
import { pushOrderHistory } from "@/lib/order-history";
import { animalIconMap } from "@/components/AnimalIcons";
import { buildShareUrl, readIncomingShare } from "@/lib/share-state";

// #19: perkiraan bobot karkas ~55% dari bobot hidup; dibagi 3 (keluarga/sedekah/hadiah)
const parseWeightKg = (w: string): number => {
  const nums = w.match(/\d+/g)?.map(Number) ?? [];
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
};

const types: { key: AnimalType; label: string; icon: React.ComponentType<{ className?: string; label?: string }> }[] = [
  { key: "kambing", label: "Kambing", icon: animalIconMap.kambing },
  { key: "domba", label: "Domba", icon: animalIconMap.domba },
  { key: "sapi", label: "Sapi", icon: animalIconMap.sapi },
  { key: "unta", label: "Unta", icon: animalIconMap.unta },
];

const STORAGE_KEY = "qurbanku-kalkulator";
const PAID_KEY = "qurbanku-paid-participants";

const loadSaved = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as { type?: AnimalType; animal?: string; participants?: string[]; persons?: number };
  } catch {}
  return null;
};

const loadPaid = (): string[] => {
  try {
    const raw = localStorage.getItem(PAID_KEY);
    if (raw) return JSON.parse(raw) as string[];
  } catch {}
  return [];
};

const Kalkulator = () => {
  const saved = loadSaved();
  // Default: kambing termurah supaya kalkulator langsung menampilkan hasil, bukan viewport kosong.
  const defaultType: AnimalType = saved?.type ?? "kambing";
  const defaultAnimal = saved?.animal ?? animalOptions.find((a) => a.type === defaultType)?.id ?? null;
  const [selectedType, setSelectedType] = useState<AnimalType | null>(defaultType);
  const [selectedAnimal, setSelectedAnimal] = useState<string | null>(defaultAnimal);
  const [persons, setPersons] = useState(saved?.persons ?? 7);
  const [participants, setParticipants] = useState<string[]>(saved?.participants?.length ? saved.participants : [""]);
  const [paidParticipants, setPaidParticipants] = useState<string[]>(loadPaid);
  const [newName, setNewName] = useState("");
  const summaryRef = useRef<HTMLDivElement>(null);

  const filteredAnimals = selectedType ? animalOptions.filter((a) => a.type === selectedType) : [];
  const animal = animalOptions.find((a) => a.id === selectedAnimal);
  const validParticipants = participants.filter((n) => n.trim());
  const activePersons = persons;
  const totalCost = animal ? animal.price : 0;
  const costPerPerson = animal ? Math.ceil(totalCost / activePersons) : 0;


  // #16 Cicilan menuju Idul Adha berikutnya
  const idulAdha = getNextIdulAdha();
  const msUntil = Math.max(0, idulAdha.getTime() - Date.now());
  const weeksLeft = Math.max(1, Math.ceil(msUntil / (1000 * 60 * 60 * 24 * 7)));
  const monthsLeft = Math.max(1, Math.ceil(msUntil / (1000 * 60 * 60 * 24 * 30)));
  const perWeek = animal ? Math.ceil(costPerPerson / weeksLeft) : 0;
  const perMonth = animal ? Math.ceil(costPerPerson / monthsLeft) : 0;

  // #19 Perkiraan jatah daging per orang (karkas ±55%)
  const avgWeight = animal ? parseWeightKg(animal.weight) : 0;
  const karkasKg = avgWeight * 0.55;
  const meatPerPerson = animal ? karkasKg / activePersons : 0;

  // Baca share link `?p=<base64>` sekali di mount (#44 viral loop).
  useEffect(() => {
    const incoming = readIncomingShare();
    if (!incoming) return;
    if (incoming.type) setSelectedType(incoming.type);
    if (incoming.animal) setSelectedAnimal(incoming.animal);
    if (typeof incoming.persons === "number") setPersons(incoming.persons);
    if (incoming.participants?.length) setParticipants(incoming.participants);
    toast.success("Konfigurasi qurban dimuat dari link 🎉");
  }, []);

  // Persist data kalkulator
  useEffect(() => {
    const data = { type: selectedType, animal: selectedAnimal, persons, participants: validParticipants };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [selectedType, selectedAnimal, persons, participants]);

  useEffect(() => {
    localStorage.setItem(PAID_KEY, JSON.stringify(paidParticipants));
  }, [paidParticipants]);

  const canPatungan = animal && animal.maxPersons > 1;

  // #12: konfirmasi kalau ganti jenis akan menghapus daftar peserta.
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

  // Pindah antar hewan dalam jenis yang sama: reset peserta hanya kalau melebihi maxPersons.
  const changeAnimal = (id: string) => {
    const a = animalOptions.find((x) => x.id === id);
    if (!a) return;
    setSelectedAnimal(id);
    if (validParticipants.length > a.maxPersons) {
      setParticipants(validParticipants.slice(0, a.maxPersons));
    }
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

  const togglePaid = (name: string) => {
    setPaidParticipants((p) => (p.includes(name) ? p.filter((n) => n !== name) : [...p, name]));
  };




  const handleOrder = () => {
    if (!animal) return;
    const names = validParticipants;
    const participantList = names.length > 0
      ? `\n\n👥 Daftar Peserta (${activePersons} orang):\n${names.map((n, i) => `${i + 1}. ${n}${paidParticipants.includes(n) ? " ✅" : ""}`).join("\n")}\n💵 Biaya per orang: ${formatCurrency(costPerPerson)}`
      : `\n\n👥 Jumlah Peserta: ${activePersons} orang\n💵 Biaya per orang: ${formatCurrency(costPerPerson)}`;
    const msg = `Assalamualaikum, saya ingin memesan hewan qurban:\n\n🐾 Hewan: ${animal.label}\n⚖️ Berat: ${animal.weight}\n💰 Harga: ${formatCurrency(animal.price)}${potongLine}${totalLine}${participantList}\n\nMohon informasi lebih lanjut. Jazakallahu khairan.`;
    pushOrderHistory({ source: "kalkulator:pesan", label: animal.label, amount: totalCost });
    window.open(generateWhatsAppLink(msg, "kalkulator:pesan"), "_blank");
  };

  const shareToParticipant = (name: string) => {
    if (!animal) return;
    const names = validParticipants;
    const link = buildShareUrl({ type: selectedType, animal: selectedAnimal, persons: activePersons, participants: validParticipants });
    const msg = `Assalamualaikum ${name},\n\nBerikut detail qurban kita:\n\n🐾 Hewan: ${animal.label}\n⚖️ Berat: ${animal.weight}\n💰 Harga Hewan: ${formatCurrency(animal.price)}${potongLine}${totalLine}\n👥 Jumlah Peserta: ${activePersons} orang\n\n📋 Daftar Peserta:\n${names.map((n, i) => `${i + 1}. ${n}`).join("\n")}\n\n💵 Biaya per orang: *${formatCurrency(costPerPerson)}*\n\n🔗 Lihat detail: ${link}\n\nMohon segera konfirmasi. Jazakallahu khairan 🙏`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const shareToAll = () => {
    if (!animal) return;
    const names = validParticipants;
    const link = buildShareUrl({ type: selectedType, animal: selectedAnimal, persons: activePersons, participants: validParticipants });
    const msg = `📢 *Ringkasan Qurban*\n\n🐾 Hewan: ${animal.label}\n⚖️ Berat: ${animal.weight}\n💰 Harga Hewan: ${formatCurrency(animal.price)}${potongLine}${totalLine}\n👥 Jumlah Peserta: ${activePersons} orang\n\n📋 Daftar Peserta:\n${names.map((n, i) => `${i + 1}. ${n} — ${formatCurrency(costPerPerson)}${paidParticipants.includes(n) ? " ✅" : ""}`).join("\n")}\n\n💵 Biaya per orang: *${formatCurrency(costPerPerson)}*\n\n🔗 Buka di Qurbanku: ${link}\n\nSilakan transfer ke rekening yang sudah disepakati. Jazakallahu khairan 🙏`;
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
      const canvas = await html2canvas(summaryRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });
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


  return (
    <div className="space-y-5">
      <SEO
        title="Kalkulator Qurban — Hitung Biaya per Orang"
        description="Pilih jenis hewan qurban dan hitung biaya per orang. Estimasi harga sapi, kambing, domba, dan unta untuk Idul Adha."
        path="/kalkulator"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Kalkulator Qurban Qurbanku",
            applicationCategory: "FinanceApplication",
            operatingSystem: "Web",
            description: "Kalkulator qurban untuk menghitung biaya per orang berdasarkan jenis hewan (sapi, kambing, domba, unta).",
            url: "https://qurban-q.lovable.app/kalkulator",
            offers: { "@type": "Offer", price: "0", priceCurrency: "IDR" },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Beranda", item: "https://qurban-q.lovable.app/" },
              { "@type": "ListItem", position: 2, name: "Kalkulator", item: "https://qurban-q.lovable.app/kalkulator" },
            ],
          },
        ]}
      />
      <div>
        <h1 className="text-xl font-bold text-foreground">Kalkulator Qurban</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Pilih hewan dan hitung biaya</p>
      </div>

      {/* Step 1 */}
      <div>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Jenis Hewan</h2>
        <div className="grid grid-cols-4 gap-1.5 xs:gap-2">
          {types.map((t) => {
            const active = selectedType === t.key;
            return (
              <button
                key={t.key}
                aria-pressed={active}
                onClick={() => changeType(t.key)}
                className={`flex flex-col items-center gap-1 rounded-xl border-2 p-2 xs:p-3 transition-colors active:scale-95 ${active ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
              >
                <t.icon className="h-5 w-5 xs:h-6 xs:w-6" label={`Ikon ${t.label.toLowerCase()}`} />
                <span className="text-[10px] xs:text-[11px] font-medium">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2 */}
      {selectedType && (
        <div>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pilih Hewan</h2>
          <div className="space-y-2">
            {filteredAnimals.map((a) => (
              <button
                key={a.id}
                onClick={() => changeAnimal(a.id)}
                className={`w-full flex items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition-all active:scale-[0.98] ${selectedAnimal === a.id ? "border-primary bg-primary/5" : "border-border"}`}
              >
                <div>
                  <p className="text-sm font-medium">{a.label}</p>
                  <p className="text-[11px] text-muted-foreground">{a.weight} · {a.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-primary">{formatCurrency(a.price)}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.8} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Jumlah peserta & daftar nama */}
      {canPatungan && (
        <div className="space-y-3">
          <div className="rounded-xl border bg-card p-4">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Jumlah Peserta (maks {animal!.maxPersons})
            </Label>
            <div className="mt-2 flex items-center gap-3">
              <Input
                type="number"
                min={1}
                max={animal!.maxPersons}
                value={persons}
                onChange={(e) => {
                  setPersons(Math.min(animal!.maxPersons, Math.max(1, parseInt(e.target.value) || 1)));
                  if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(8);
                }}
                className="w-20"
                aria-label="Jumlah peserta"
              />
              <span className="text-sm text-muted-foreground">orang</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Preset jumlah peserta">
              {[1, 3, 7].filter((n) => n <= animal!.maxPersons).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    setPersons(n);
                    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(8);
                  }}
                  aria-label={`Set ${n} peserta`}
                  aria-pressed={persons === n}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    persons === n
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-muted/40 text-foreground hover:bg-muted"
                  }`}
                >
                  {n} orang
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Daftar Peserta
              </Label>
              <span className="text-xs text-muted-foreground">
                {validParticipants.length}/{animal!.maxPersons} orang · {paidParticipants.filter((n) => validParticipants.includes(n)).length} lunas
              </span>
            </div>

            {/* Participant list dengan status transfer */}
            <div className="space-y-1.5">
              <AnimatePresence mode="popLayout">
                {validParticipants.map((name, i) => {
                  const isPaid = paidParticipants.includes(name);
                  return (
                    <motion.div
                      key={name}
                      layout
                      initial={{ opacity: 0, scale: 0.9, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, x: 40 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 ${isPaid ? "bg-primary/10" : "bg-muted/50"}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                          {i + 1}
                        </span>
                        <span className="text-sm font-medium">{name}</span>
                        {isPaid && <span className="text-[10px] font-bold text-primary">LUNAS</span>}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => togglePaid(name)}
                          aria-label={`Tandai ${name} ${isPaid ? "belum" : "sudah"} transfer`}
                          title={isPaid ? "Batal tandai lunas" : "Tandai sudah transfer"}
                          className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors ${isPaid ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:text-primary"}`}
                        >
                          <Check className="h-3 w-3" strokeWidth={2.4} />
                        </button>
                        <button onClick={() => removeParticipant(i)} aria-label={`Hapus peserta ${name}`} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                          <X className="h-3.5 w-3.5" strokeWidth={1.8} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Add participant input */}
            {validParticipants.length < animal!.maxPersons && (
              <div className="flex gap-2">
                <Input
                  placeholder="Nama peserta..."
                  value={newName}
                  maxLength={50}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addParticipant(); } }}
                  className="flex-1 text-sm"
                  aria-label="Nama peserta baru"
                />
                <Button size="sm" variant="outline" onClick={addParticipant} disabled={!newName.trim()} aria-label="Tambah peserta">
                  <UserPlus className="h-4 w-4" strokeWidth={1.8} />
                </Button>
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
        </div>
      )}


      {/* Result */}
      {animal && (
        <div ref={summaryRef} className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ringkasan</p>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Hewan</span><span className="font-medium">{animal.label}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Berat</span><span className="font-medium">{animal.weight}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Harga Hewan</span><span className="font-medium">{formatCurrency(animal.price)}</span></div>

            <div className="flex justify-between border-t pt-2"><span className="text-muted-foreground">Total</span><span className="font-semibold text-primary">{formatCurrency(totalCost)}</span></div>
            {animal.maxPersons > 1 && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Peserta</span>
                  <span className="font-medium">{activePersons} orang</span>
                </div>
                {validParticipants.length > 0 && (
                  <div className="border-t pt-2 space-y-1">
                    {validParticipants.map((name, i) => {
                      const isPaid = paidParticipants.includes(name);
                      return (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className={isPaid ? "text-primary font-medium" : "text-muted-foreground"}>
                            {i + 1}. {name} {isPaid && "✅"}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{formatCurrency(costPerPerson)}</span>
                            <button
                              onClick={() => shareToParticipant(name)}
                              aria-label={`Kirim ringkasan ke ${name}`}
                              className="text-muted-foreground hover:text-primary transition-colors"
                              title={`Kirim ke ${name}`}
                            >
                              <Share2 className="h-3 w-3" strokeWidth={1.8} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">Per Orang</span>
                  <span className="text-lg font-bold text-primary">{formatCurrency(costPerPerson)}</span>
                </div>
              </>
            )}

            {/* #16 Cicilan tabungan menuju Idul Adha berikutnya */}
            <div className="rounded-lg bg-background/60 border border-border/60 p-3 mt-2 space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Cicilan sampai Idul Adha ({weeksLeft} minggu lagi)
              </p>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Nabung per minggu</span>
                <span className="font-semibold text-foreground">{formatCurrency(perWeek)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Nabung per bulan</span>
                <span className="font-semibold text-foreground">{formatCurrency(perMonth)}</span>
              </div>
            </div>

            {/* #19 Perkiraan jatah daging (karkas ±55%) */}
            {avgWeight > 0 && (
              <div className="rounded-lg bg-background/60 border border-border/60 p-3 space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Perkiraan Jatah Daging
                </p>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Karkas (±55%)</span>
                  <span className="font-semibold text-foreground">{karkasKg.toFixed(1)} kg</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Per orang</span>
                  <span className="font-semibold text-foreground">{meatPerPerson.toFixed(1)} kg</span>
                </div>
                <p className="text-[10px] text-muted-foreground pt-1">
                  Dibagi 3: keluarga, sedekah, hadiah (±{(meatPerPerson / 3).toFixed(1)} kg/bagian).
                </p>
              </div>
            )}
          </div>


          <div className="flex flex-col gap-2">
            {animal?.type !== "unta" && (
              <Button onClick={handleOrder} className="bg-[hsl(var(--wa-green))] hover:bg-[hsl(var(--wa-green))]/90 text-white">
                <MessageCircle className="mr-2 h-4 w-4" strokeWidth={1.8} /> Pesan via WhatsApp
              </Button>
            )}
            {validParticipants.length > 1 && (
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={shareToAll}>
                  <Share2 className="mr-1.5 h-4 w-4" strokeWidth={1.8} /> Share ke Peserta
                </Button>
                <Button variant="outline" size="sm" onClick={copyShareLink}>
                  <Copy className="mr-1.5 h-4 w-4" strokeWidth={1.8} /> Salin Link
                </Button>
              </div>
            )}
            {validParticipants.length > 0 && (
              <Button variant="outline" size="sm" onClick={exportAsImage}>
                <Download className="mr-2 h-4 w-4" strokeWidth={1.8} /> Unduh Gambar Ringkasan
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={resetAll}>
              Hitung Ulang
            </Button>
          </div>

          <details className="text-[11px] text-muted-foreground">
            <summary className="cursor-pointer text-center list-none marker:hidden hover:text-foreground transition-colors">
              * Harga acuan supplier. Detail &amp; rekening
            </summary>
            <p className="mt-2 leading-relaxed">
              Acuan harga mengikuti katalog <strong>Rabbanian Farm</strong> (2026) sebagai
              supplier rekanan. Harga bervariasi antar supplier &amp; wilayah. Lihat rincian
              supplier, DP, dan rekening resmi di{" "}
              <a href="/metodologi" className="font-semibold text-primary hover:underline">halaman metodologi</a>.
            </p>
          </details>

        </div>
      )}

      {/* #11 Sticky ringkasan — muncul saat hewan sudah dipilih */}
      {animal && (
        <div
          className="fixed inset-x-0 z-30 mx-auto flex max-w-lg items-center justify-between gap-3 border-t border-border/60 bg-background/95 px-5 py-2.5 backdrop-blur-xl shadow-soft"
          style={{ bottom: "calc(4.75rem + env(safe-area-inset-bottom))" }}
          role="status"
          aria-label="Ringkasan biaya qurban"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] uppercase tracking-wide text-muted-foreground">
              {animal.label} · {activePersons} org
            </p>
            <p className="text-sm font-bold text-primary leading-tight">
              {formatCurrency(costPerPerson)}
              <span className="ml-1 text-[10px] font-normal text-muted-foreground">/orang</span>
            </p>
          </div>
          {animal.type !== "unta" && (
            <Button
              size="sm"
              onClick={handleOrder}
              className="h-9 shrink-0 bg-[hsl(var(--wa-green))] hover:bg-[hsl(var(--wa-green))]/90 text-white"
              aria-label="Pesan via WhatsApp"
            >
              <MessageCircle className="mr-1.5 h-4 w-4" strokeWidth={1.8} /> Pesan
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default Kalkulator;
