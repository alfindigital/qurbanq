import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageCircle, ChevronRight, UserPlus, X, Users, Share2 } from "lucide-react";
import { animalOptions, formatCurrency, generateWhatsAppLink, WHATSAPP_NUMBER, type AnimalType } from "@/lib/qurban-data";

const types: { key: AnimalType; label: string; icon: string }[] = [
  { key: "kambing", label: "Kambing", icon: "🐐" },
  { key: "domba", label: "Domba", icon: "🐑" },
  { key: "sapi", label: "Sapi", icon: "🐄" },
  { key: "unta", label: "Unta", icon: "🐪" },
];

const Kalkulator = () => {
  const [selectedType, setSelectedType] = useState<AnimalType | null>(null);
  const [selectedAnimal, setSelectedAnimal] = useState<string | null>(null);
  const [persons, setPersons] = useState(1);
  const [patunganMode, setPatunganMode] = useState(false);
  const [participants, setParticipants] = useState<string[]>([""]);
  const [newName, setNewName] = useState("");

  const filteredAnimals = selectedType ? animalOptions.filter((a) => a.type === selectedType) : [];
  const animal = animalOptions.find((a) => a.id === selectedAnimal);
  const activePersons = patunganMode ? participants.filter((n) => n.trim()).length || 1 : persons;
  const costPerPerson = animal ? Math.ceil(animal.price / activePersons) : 0;

  const canPatungan = animal && animal.maxPersons > 1;

  const addParticipant = () => {
    const name = newName.trim();
    if (!name || !animal) return;
    if (participants.filter((n) => n.trim()).length >= animal.maxPersons) return;
    if (participants.some((n) => n.trim().toLowerCase() === name.toLowerCase())) return;
    const updated = [...participants.filter((n) => n.trim()), name];
    setParticipants(updated);
    setNewName("");
  };

  const removeParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const handleOrder = () => {
    if (!animal) return;
    const names = participants.filter((n) => n.trim());
    const participantList = patunganMode && names.length > 0
      ? `\n\n👥 Peserta Patungan (${names.length} orang):\n${names.map((n, i) => `${i + 1}. ${n}`).join("\n")}\n💵 Biaya per orang: ${formatCurrency(costPerPerson)}`
      : "";
    const msg = `Assalamualaikum, saya ingin memesan hewan qurban:\n\n🐾 Hewan: ${animal.label}\n⚖️ Berat: ${animal.weight}\n💰 Harga: ${formatCurrency(animal.price)}${participantList}\n\nMohon informasi lebih lanjut. Jazakallahu khairan.`;
    window.open(generateWhatsAppLink(msg), "_blank");
  };

  const resetAll = () => {
    setSelectedType(null);
    setSelectedAnimal(null);
    setPersons(1);
    setPatunganMode(false);
    setParticipants([""]);
    setNewName("");
  };

  const validParticipants = participants.filter((n) => n.trim());

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Kalkulator Qurban</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Pilih hewan dan hitung biaya</p>
      </div>

      {/* Step 1 */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Jenis Hewan</p>
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

      {/* Step 2 */}
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

      {/* Step 3: Patungan toggle & participants */}
      {canPatungan && (
        <div className="space-y-3">
          {/* Toggle */}
          <div className="flex gap-2">
            <Button
              variant={!patunganMode ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => setPatunganMode(false)}
            >
              Pribadi
            </Button>
            <Button
              variant={patunganMode ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => setPatunganMode(true)}
            >
              <Users className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.5} />
              Patungan
            </Button>
          </div>

          {!patunganMode && (
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
                  onChange={(e) => setPersons(Math.min(animal!.maxPersons, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">orang</span>
              </div>
            </div>
          )}

          {patunganMode && (
            <div className="rounded-xl border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Peserta Patungan
                </Label>
                <span className="text-xs text-muted-foreground">
                  {validParticipants.length}/{animal!.maxPersons} orang
                </span>
              </div>

              {/* Participant list */}
                <div className="space-y-1.5">
                  <AnimatePresence mode="popLayout">
                    {validParticipants.map((name, i) => (
                      <motion.div
                        key={name}
                        layout
                        initial={{ opacity: 0, scale: 0.9, y: -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, x: 40 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                            {i + 1}
                          </span>
                          <span className="text-sm font-medium">{name}</span>
                        </div>
                        <button onClick={() => removeParticipant(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                          <X className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                      </motion.div>
                    ))}
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
                  />
                  <Button size="sm" variant="outline" onClick={addParticipant} disabled={!newName.trim()}>
                    <UserPlus className="h-4 w-4" strokeWidth={1.5} />
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
          )}
        </div>
      )}

      {/* Step 3 for non-patungan single animals */}
      {animal && animal.maxPersons === 1 && null}

      {/* Result */}
      {animal && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-4">
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
                {patunganMode && validParticipants.length > 0 && (
                  <div className="border-t pt-2 space-y-1">
                    {validParticipants.map((name, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{i + 1}. {name}</span>
                        <span className="font-medium">{formatCurrency(costPerPerson)}</span>
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
