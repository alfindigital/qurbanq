import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageCircle, Calculator } from "lucide-react";
import { animalOptions, formatCurrency, generateWhatsAppLink, type AnimalType } from "@/lib/qurban-data";

const typeLabels: Record<AnimalType, string> = {
  kambing: "🐐 Kambing",
  domba: "🐑 Domba",
  sapi: "🐄 Sapi",
  unta: "🐪 Unta",
};

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
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Kalkulator Qurban</h1>
        <p className="text-muted-foreground mt-1">Pilih hewan dan hitung biaya qurban Anda</p>
      </div>

      {/* Step 1: Pilih Jenis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Calculator className="h-4 w-4" /> Pilih Jenis Hewan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(Object.keys(typeLabels) as AnimalType[]).map((type) => (
              <button
                key={type}
                onClick={() => { setSelectedType(type); setSelectedAnimal(null); setPersons(1); }}
                className={`rounded-lg border-2 p-4 text-center transition-all ${selectedType === type ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/30"}`}
              >
                <span className="text-2xl block mb-1">{typeLabels[type].split(" ")[0]}</span>
                <span className="text-sm font-medium">{typeLabels[type].split(" ")[1]}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Pilih Hewan */}
      {selectedType && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pilih Hewan</CardTitle>
            <CardDescription>Pilih kualitas dan berat hewan yang diinginkan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredAnimals.map((a) => (
              <button
                key={a.id}
                onClick={() => { setSelectedAnimal(a.id); setPersons(1); }}
                className={`w-full rounded-lg border-2 p-4 text-left transition-all ${selectedAnimal === a.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{a.label}</p>
                    <p className="text-sm text-muted-foreground">{a.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">Berat: {a.weight}</p>
                  </div>
                  <p className="text-lg font-bold text-primary whitespace-nowrap ml-4">{formatCurrency(a.price)}</p>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Jumlah Orang */}
      {animal && animal.maxPersons > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Jumlah Peserta Patungan</CardTitle>
            <CardDescription>Maksimal {animal.maxPersons} orang untuk {animal.type}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Label>Jumlah Orang:</Label>
              <Input
                type="number"
                min={1}
                max={animal.maxPersons}
                value={persons}
                onChange={(e) => setPersons(Math.min(animal.maxPersons, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">orang</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result */}
      {animal && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base">Ringkasan Perhitungan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <span className="text-muted-foreground">Hewan:</span>
              <span className="font-medium">{animal.label}</span>
              <span className="text-muted-foreground">Berat:</span>
              <span className="font-medium">{animal.weight}</span>
              <span className="text-muted-foreground">Harga Total:</span>
              <span className="font-bold text-primary">{formatCurrency(animal.price)}</span>
              {animal.maxPersons > 1 && (
                <>
                  <span className="text-muted-foreground">Jumlah Peserta:</span>
                  <span className="font-medium">{persons} orang</span>
                  <span className="text-muted-foreground">Biaya per Orang:</span>
                  <span className="font-bold text-primary text-lg">{formatCurrency(costPerPerson)}</span>
                </>
              )}
            </div>

            <div className="pt-3 flex flex-col sm:flex-row gap-3">
              <Button onClick={handleOrder} className="bg-[hsl(142,70%,35%)] hover:bg-[hsl(142,70%,30%)] text-white">
                <MessageCircle className="mr-2 h-4 w-4" /> Pesan via WhatsApp
              </Button>
              <Button variant="outline" onClick={() => { setSelectedType(null); setSelectedAnimal(null); }}>
                Hitung Ulang
              </Button>
            </div>

            <p className="text-xs text-muted-foreground pt-2">
              * Harga bersifat estimasi. Hubungi kami untuk mendapatkan penawaran terbaik sesuai ketersediaan.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Kalkulator;
