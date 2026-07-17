import { Star, Quote } from "lucide-react";

// #35 Testimoni pequrban tahun lalu untuk social proof.
const testimonials = [
  {
    name: "Ahmad R.",
    city: "Jakarta",
    text: "Alhamdulillah, sapi patungan bareng 6 teman kantor lewat Qurbanku lancar. Dokumentasi videonya jelas.",
    rating: 5,
  },
  {
    name: "Siti N.",
    city: "Bandung",
    text: "Kalkulator patungannya bantu banget koordinasi keluarga besar. Tinggal share link ke grup WA.",
    rating: 5,
  },
  {
    name: "Budi H.",
    city: "Surabaya",
    text: "Kambing sesuai deskripsi, gemuk & sehat. Insya Allah tahun depan qurban lagi di sini.",
    rating: 5,
  },
];

const TestimonialSection = () => (
  <section>
    <div className="mb-3 flex items-end justify-between">
      <h2 className="font-display text-base font-bold text-forest">Cerita Pequrban</h2>
      <span className="text-[10px] font-semibold text-muted-foreground">Idul Adha lalu</span>
    </div>
    <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 scrollbar-none">
      {testimonials.map((t) => (
        <article
          key={t.name}
          className="w-[80%] min-w-[260px] snap-start rounded-2xl border border-border bg-card p-4 shadow-soft"
        >
          <Quote className="h-4 w-4 text-primary/60" strokeWidth={2} aria-hidden />
          <p className="mt-2 text-xs leading-relaxed text-forest">{t.text}</p>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <div>
              <p className="text-xs font-bold text-forest">{t.name}</p>
              <p className="text-[10px] text-muted-foreground">{t.city}</p>
            </div>
            <div className="flex gap-0.5" aria-label={`Rating ${t.rating} dari 5`}>
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-accent text-accent" strokeWidth={0} />
              ))}
            </div>
          </div>
        </article>
      ))}
    </div>
  </section>
);

export default TestimonialSection;
