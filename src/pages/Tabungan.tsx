import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PiggyBank, TrendingUp, MessageCircle } from "lucide-react";
import { animalOptions, formatCurrency, generateWhatsAppLink, getNextIdulAdha } from "@/lib/qurban-data";

const Tabungan = () => {
  const [selectedAnimal, setSelectedAnimal] = useState("");
  const [months, setMonths] = useState(6);
  const [saved, setSaved] = useState(0);

  const animal = animalOptions.find((a) => a.id === selectedAnimal);
  const target = animal?.price || 0;
  const perMonth = target > 0 && months > 0 ? Math.ceil(target / months) : 0;
  const perWeek = target > 0 && months > 0 ? Math.ceil(target / (months * 4)) : 0;
  const perDay = target > 0 && months > 0 ? Math.ceil(target / (months * 30)) : 0;
  const progress = target > 0 ? Math.min(100, (saved / target) * 100) : 0;
  const remaining = Math.max(0, target - saved);

  const monthsUntilAdha = () => {
    const now = new Date();
    const adha = getNextIdulAdha();
    const diff = (adha.getFullYear() - now.getFullYear()) * 12 + (adha.getMonth() - now.getMonth());
    return Math.max(1, diff);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Simulasi Tabungan Qurban</h1>
        <p className="text-muted-foreground mt-1">Rencanakan tabungan qurban Anda agar siap tepat waktu</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><PiggyBank className="h-4 w-4" /> Target Qurban</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Pilih Hewan Qurban</Label>
            <Select value={selectedAnimal} onValueChange={setSelectedAnimal}>
              <SelectTrigger><SelectValue placeholder="Pilih hewan..." /></SelectTrigger>
              <SelectContent>
                {animalOptions.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.label} — {formatCurrency(a.price)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Jangka Waktu (bulan)</Label>
              <Input
                type="number"
                min={1}
                max={24}
                value={months}
                onChange={(e) => setMonths(Math.max(1, parseInt(e.target.value) || 1))}
              />
              <button
                onClick={() => setMonths(monthsUntilAdha())}
                className="text-xs text-primary hover:underline"
              >
                Set otomatis ({monthsUntilAdha()} bulan menuju Idul Adha)
              </button>
            </div>
            <div className="space-y-2">
              <Label>Sudah Ditabung</Label>
              <Input
                type="number"
                min={0}
                value={saved}
                onChange={(e) => setSaved(Math.max(0, parseInt(e.target.value) || 0))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {animal && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Rencana Tabungan</CardTitle>
            <CardDescription>{animal.label} — {formatCurrency(target)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Progress */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progress Tabungan</span>
                <span className="font-semibold text-primary">{progress.toFixed(1)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Terkumpul: {formatCurrency(saved)}</span>
                <span>Sisa: {formatCurrency(remaining)}</span>
              </div>
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Per Bulan", value: perMonth },
                { label: "Per Minggu", value: perWeek },
                { label: "Per Hari", value: perDay },
              ].map((item) => (
                <div key={item.label} className="rounded-lg bg-muted p-3 text-center">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-bold text-foreground mt-1">{formatCurrency(item.value)}</p>
                </div>
              ))}
            </div>

            {remaining > 0 && (
              <p className="text-sm text-muted-foreground">
                Dengan menabung <strong>{formatCurrency(perMonth)}</strong> per bulan selama <strong>{months} bulan</strong>, Anda akan mencapai target {formatCurrency(target)} tepat waktu.
              </p>
            )}

            {progress >= 100 && (
              <div className="rounded-lg bg-primary/10 p-4 text-center">
                <p className="font-semibold text-primary">🎉 Target tercapai! Anda siap berqurban.</p>
                <Button
                  className="mt-3 bg-[hsl(142,70%,35%)] hover:bg-[hsl(142,70%,30%)] text-white"
                  onClick={() => {
                    const msg = `Assalamualaikum, saya sudah menyiapkan dana qurban untuk ${animal.label} (${formatCurrency(target)}). Mohon info ketersediaan dan cara pemesanan. Jazakallahu khairan.`;
                    window.open(generateWhatsAppLink(msg), "_blank");
                  }}
                >
                  <MessageCircle className="mr-2 h-4 w-4" /> Pesan Sekarang via WhatsApp
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Tabungan;
