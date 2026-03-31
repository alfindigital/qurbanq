import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageCircle, Calculator, ChevronRight } from "lucide-react";
import { animalOptions, formatCurrency, generateWhatsAppLink, type AnimalType } from "@/lib/qurban-data";

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

  const filteredAnimals = selectedType ? animalOptions.filter((a) => a.type === selectedType) : [];
  const animal = animalOptions.find((a) => a.id === selectedAnimal);
  const costPerPerson = animal ? Math.ceil(animal.price / persons) : 0;

  const handleOrder = () => {
    if (!animal) return;
    const msg = `Assalamualaikum, saya ingin memesan hewan qurban:\n\n🐾 Hewan: ${animal.label}\n⚖️ Berat: ${animal.weight}\n💰 Harga: ${formatCurrency(animal.price)}\n👥 Jumlah peserta: ${persons} orang\n💵 Biaya per orang: ${formatCurrency(costPerPerson)}\n\nMohon informasi lebih lanjut. Jazakallahu khairan.`;
    window.open(generateWhatsAppLink(msg), "_blank");
  };

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
              onClick={() => { setSelectedType(t.key); setSelectedAnimal(null); setPersons(1); }}
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
                onClick={() => { setSelectedAnimal(a.id); setPersons(1); }}
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

      {/* Step 3 */}
      {animal && animal.maxPersons > 1 && (
        <div className="rounded-xl border bg-card p-4">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Jumlah Peserta (maks {animal.maxPersons})
          </Label>
          <div className="mt-2 flex items-center gap-3">
            <Input
              type="number"
              min={1}
              max={animal.maxPersons}
              value={persons}
              onChange={(e) => setPersons(Math.min(animal.maxPersons, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-20"
            />
            <span className="text-sm text-muted-foreground">orang</span>
          </div>
        </div>
      )}

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
                <div className="flex justify-between"><span className="text-muted-foreground">Peserta</span><span className="font-medium">{persons} orang</span></div>
                <div className="flex justify-between border-t pt-2"><span className="text-muted-foreground">Per Orang</span><span className="text-lg font-bold text-primary">{formatCurrency(costPerPerson)}</span></div>
              </>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={handleOrder} className="bg-[hsl(var(--wa-green))] hover:bg-[hsl(var(--wa-green))]/90 text-white">
              <MessageCircle className="mr-2 h-4 w-4" strokeWidth={1.5} /> Pesan via WhatsApp
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setSelectedType(null); setSelectedAnimal(null); }}>
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
