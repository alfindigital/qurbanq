import { ShieldCheck, Award, Camera, Truck } from "lucide-react";

// #34 Info penyedia + jaminan supaya user percaya sebelum kirim WA.
const items = [
  { icon: ShieldCheck, title: "Sertifikasi Halal", desc: "Hewan dari kandang mitra bersertifikat." },
  { icon: Award, title: "Sesuai Syariat", desc: "Diseleksi memenuhi syarat usia & kesehatan." },
  { icon: Camera, title: "Dokumentasi H+1", desc: "Foto & video penyembelihan dikirim ke Anda." },
  { icon: Truck, title: "Distribusi Amanah", desc: "Daging dibagikan sesuai amanah pequrban." },
];

const TrustSection = () => (
  <section>
    <h2 className="mb-3 font-display text-base font-bold text-forest">Kenapa Qurbanku</h2>
    <div className="grid grid-cols-2 gap-2.5">
      {items.map((it) => (
        <div key={it.title} className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-terracotta-soft text-primary">
            <it.icon className="h-4.5 w-4.5" strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-xs font-bold text-forest">{it.title}</p>
            <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">{it.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default TrustSection;
