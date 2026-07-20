import { PlayCircle, ExternalLink } from "lucide-react";

// #20 Referensi kajian qurban dari ustadz-ustadz Ahlus Sunnah / manhaj Salaf
// (Rodja/Yufid/Bekal Islam) yang materinya bersumber dari Al-Qur'an & Sunnah
// sesuai pemahaman salafush shalih. Link ke channel resmi, bukan embed
// supaya bisa diperbarui tanpa build.
const kajian = [
  {
    ustadz: "Ustadz Dr. Firanda Andirja, MA",
    title: "Fiqih Qurban — Bekal Islam",
    channel: "Bekal Islam",
    url: "https://www.youtube.com/@BekalIslamOfficial/search?query=qurban",
  },
  {
    ustadz: "Ustadz Dr. Khalid Basalamah, MA",
    title: "Panduan Qurban Sesuai Sunnah",
    channel: "Khalid Basalamah Official",
    url: "https://www.youtube.com/@KhalidBasalamahOfficial/search?query=qurban",
  },
  {
    ustadz: "Ustadz Dr. Erwandi Tarmizi, MA",
    title: "Hukum & Adab Qurban",
    channel: "Rodja TV",
    url: "https://www.youtube.com/@RodjaTVOfficial/search?query=qurban+erwandi",
  },
  {
    ustadz: "Ustadz Abdullah Zaen, Lc, MA",
    title: "Amalan Utama 10 Hari Dzulhijjah",
    channel: "Yufid.TV",
    url: "https://www.youtube.com/@yufidtv/search?query=dzulhijjah",
  },
  {
    ustadz: "Ustadz Ammi Nur Baits, ST, BA",
    title: "Konsultasi Qurban — Yufid",
    channel: "Yufid.TV",
    url: "https://www.youtube.com/@yufidtv/search?query=qurban",
  },
];

const KajianSection = () => (
  <section>
    <div className="mb-3 flex items-end justify-between">
      <h2 className="font-display text-base font-bold text-forest">Kajian Qurban</h2>
    </div>
    <p className="mb-3 text-[11px] text-muted-foreground">
      Referensi kajian dari ustadz-ustadz yang mengajarkan sesuai Al-Qur'an dan Sunnah.
    </p>
    <ul className="space-y-2">
      {kajian.map((k) => (
        <li key={k.url}>
          <a
            href={k.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-primary/40"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-terracotta-soft text-primary">
              <PlayCircle className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-forest">{k.ustadz}</p>
              <p className="truncate text-[11px] text-muted-foreground">
                {k.title} · {k.channel}
              </p>
            </div>
            <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" strokeWidth={2} />
          </a>
        </li>
      ))}
    </ul>
    <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">
      Link mengarah ke channel resmi masing-masing ustadz. Qurbanku tidak
      berafiliasi; silakan pilih materi yang paling sesuai.
    </p>
  </section>
);

export default KajianSection;
