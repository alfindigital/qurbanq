import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageCircle, ChevronRight, UserPlus, X, Share2, Download, Check, Copy } from "lucide-react";
import SEO from "@/components/SEO";
import { animalOptions, formatCurrency, generateWhatsAppLink, type AnimalType } from "@/lib/qurban-data";
import { pushOrderHistory } from "@/lib/order-history";
import { animalIconMap } from "@/components/AnimalIcons";
import { buildShareUrl, readIncomingShare } from "@/lib/share-state";

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
  const [selectedType, setSelectedType] = useState<AnimalType | null>(saved?.type ?? null);
  const [selectedAnimal, setSelectedAnimal] = useState<string | null>(saved?.animal ?? null);
  const [persons, setPersons] = useState(saved?.persons ?? 7);
  const [participants, setParticipants] = useState<string[]>(saved?.participants?.length ? saved.participants : [""]);
  const [paidParticipants, setPaidParticipants] = useState<string[]>(loadPaid);
  const [newName, setNewName] = useState("");
  const summaryRef = useRef<HTMLDivElement>(null);

  const filteredAnimals = selectedType ? animalOptions.filter((a) => a.type === selectedType) : [];
  const animal = animalOptions.find((a) => a.id === selectedAnimal);
  const validParticipants = participants.filter((n) => n.trim());
  const activePersons = persons;
  const costPerPerson = animal ? Math.ceil(animal.price / activePersons) : 0;

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
    const msg = `Assalamualaikum, saya ingin memesan hewan qurban:\n\n🐾 Hewan: ${animal.label}\n⚖️ Berat: ${animal.weight}\n💰 Harga: ${formatCurrency(animal.price)}${participantList}\n\nMohon informasi lebih lanjut. Jazakallahu khairan.`;
    pushOrderHistory({ source: "kalkulator:pesan", label: animal.label, amount: animal.price });
    window.open(generateWhatsAppLink(msg, "kalkulator:pesan"), "_blank");
  };

  const shareToParticipant = (name: string) => {
    if (!animal) return;
    const names = validParticipants;
    const link = buildShareUrl({ type: selectedType, animal: selectedAnimal, persons: activePersons, participants: validParticipants });
    const msg = `Assalamualaikum ${name},\n\nBerikut detail qurban kita:\n\n🐾 Hewan: ${animal.label}\n⚖️ Berat: ${animal.weight}\n💰 Harga Total: ${formatCurrency(animal.price)}\n👥 Jumlah Peserta: ${activePersons} orang\n\n📋 Daftar Peserta:\n${names.map((n, i) => `${i + 1}. ${n}`).join("\n")}\n\n💵 Biaya per orang: *${formatCurrency(costPerPerson)}*\n\n🔗 Lihat detail: ${link}\n\nMohon segera konfirmasi. Jazakallahu khairan 🙏`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const shareToAll = () => {
    if (!animal) return;
    const names = validParticipants;
    const link = buildShareUrl({ type: selectedType, animal: selectedAnimal, persons: activePersons, participants: validParticipants });
    const msg = `📢 *Ringkasan Qurban*\n\n🐾 Hewan: ${animal.label}\n⚖️ Berat: ${animal.weight}\n💰 Harga Total: ${formatCurrency(animal.price)}\n👥 Jumlah Peserta: ${activePersons} orang\n\n📋 Daftar Peserta:\n${names.map((n, i) => `${i + 1}. ${n} — ${formatCurrency(costPerPerson)}${paidParticipants.includes(n) ? " ✅" : ""}`).join("\n")}\n\n💵 Biaya per orang: *${formatCurrency(costPerPerson)}*\n\n🔗 Buka di Qurbanku: ${link}\n\nSilakan transfer ke rekening yang sudah disepakati. Jazakallahu khairan 🙏`;
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
            <div className="flex justify-between"><span className="text-muted-foreground">Harga Total</span><span className="font-semibold text-primary">{formatCurrency(animal.price)}</span></div>
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

          <p className="text-[11px] text-muted-foreground text-center">
            * Harga estimasi. Hubungi kami untuk penawaran terbaik.
          </p>
        </div>
      )}
    </div>
  );
};

export default Kalkulator;
