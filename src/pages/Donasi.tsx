import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Heart, Globe, ShieldCheck, Truck, Users, MessageCircle, ArrowLeft, HandHeart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { generateWhatsAppLink } from "@/lib/qurban-data";
import SEO from "@/components/SEO";

const donationSteps = [
  {
    icon: Globe,
    title: "Pilih Program",
    desc: "Pilih program donasi qurban untuk Indonesia. Tersedia kambing, domba, sapi, atau unta dengan harga transparan.",
  },
  {
    icon: Users,
    title: "Patungan atau Sendiri",
    desc: "Bisa berdonasi sendiri atau patungan hingga 7 orang untuk 1 ekor sapi/unta. Kalkulator kami membagi rata otomatis.",
  },
  {
    icon: ShieldCheck,
    title: "Verifikasi & Jaminan",
    desc: "Hewan dipastikan sehat, memenuhi syarat syar'i, dan didampingi mitra peternak terpercaya.",
  },
  {
    icon: Truck,
    title: "Penyembelihan & Distribusi",
    desc: "Penyembelihan pada hari Idul Adha. Daging didistribusikan ke mustahiq sesuai anjuran ulama.",
  },
];

const donationFaq = [
  {
    q: "Apa itu donasi qurban?",
    a: "Donasi qurban adalah menitipkan dana agar seekor hewan (kambing, domba, sapi, atau unta) disembelih pada hari Idul Adha atas nama Anda. Dagingnya kemudian didistribusikan kepada yang membutuhkan.",
  },
  {
    q: "Bisakah berdonasi qurban dari luar negeri?",
    a: "Bisa. Qurbanku menerima donasi qurban dari mana saja. Kami mengurus pemilihan hewan, penyembelihan, dan distribusi daging di Indonesia atas nama Anda.",
  },
  {
    q: "Apakah hewannya sehat dan halal?",
    a: "Semua hewan diperiksa kesehatan, usia, dan syarat syar'i-nya. Kami bekerja sama dengan mitra peternak terpercaya untuk memastikan qurban sah.",
  },
  {
    q: "Bagaimana daging didistribusikan?",
    a: "Daging dibagikan kepada fakir miskin, yatim, dan warga sekitar. Anda juga dapat meminta sebagian untuk keluarga di Indonesia sesuai ketersediaan.",
  },
  {
    q: "Apakah saya menerima bukti qurban?",
    a: "Ya. Kami menyediakan dokumentasi berupa foto atau video proses penyembelihan dan distribusi, tergantung paket yang Anda pilih.",
  },
];

const Donasi = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-5">
      <SEO
        title="Donasi Qurban Online — Titip Qurban & Berbagi Berkah | Qurbanku"
        description="Titip donasi qurban Anda secara online lewat Qurbanku. Harga transparan, hewan sesuai syariat, dan distribusi ke yang membutuhkan di Indonesia."
        path="/donasi"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Donasi Qurban Online — Titip Qurban & Berbagi Berkah",
          description:
            "Titip donasi qurban Anda secara online lewat Qurbanku. Harga transparan, hewan sesuai syariat, dan distribusi ke yang membutuhkan di Indonesia.",
          author: { "@type": "Organization", name: "Qurbanku" },
          publisher: { "@type": "Organization", name: "Qurbanku" },
          mainEntityOfPage: { "@type": "WebPage", "@id": "https://qurban-q.lovable.app/donasi" },
        }}
      />

      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-primary font-medium"
        aria-label="Kembali ke halaman sebelumnya"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.8} /> Kembali
      </button>

      <div>
        <h1 className="text-xl font-bold text-foreground">Donasi Qurban</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Berqurban dari mana saja, didistribusikan di Indonesia
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/[0.03]">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <Heart className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Mengapa Berqurban Online?</h2>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Donasi qurban memudahkan Anda yang tinggal di luar negeri atau memiliki waktu
                terbatas untuk tetap menunaikan ibadah qurban dengan amanah. Hewan dipilih,
                disembelih, dan didistribusikan sesuai syariat oleh mitra Qurbanku.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Cara Berdonasi
        </h2>
        {donationSteps.map((step, i) => (
          <Card key={i} className="overflow-hidden transition-all hover:border-primary/30">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="rounded-full bg-primary/8 p-2 text-primary shrink-0">
                <step.icon className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground">
                  {i + 1}. {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">{step.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <HandHeart className="h-5 w-5 text-primary" strokeWidth={1.8} />
            Manfaat Berqurban
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
          <p>
            Setiap helai bulu hewan qurban membawa satu kebaikan. Berqurban juga menjadi wujud
            syukur, mendekatkan diri kepada Allah, dan menyebarkan kebahagiaan kepada yang
            membutuhkan.
          </p>
          <ul className="space-y-1 ml-4 list-disc">
            <li>Menghidupkan sunnah Nabi Ibrahim dan Nabi Muhammad ﷺ</li>
            <li>Membersihkan harta dan membersihkan jiwa dari sifat kikir</li>
            <li>Menyenangkan hati fakir miskin, yatim, dan tetangga</li>
            <li>Pahala berlipat di hari yang paling dicintai Allah</li>
          </ul>
        </CardContent>
      </Card>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-muted-foreground" strokeWidth={1.8} />
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Tanya Jawab Donasi Qurban
          </h2>
        </div>
        <Accordion type="single" collapsible className="w-full space-y-2 sm:space-y-3">
          {donationFaq.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`donasi-faq-${i}`}
              className="overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:border-primary/30 hover:shadow-sm data-[state=open]:border-primary/20 data-[state=open]:bg-primary/[0.03]"
            >
              <AccordionTrigger className="px-3 sm:px-4 py-3 sm:py-4 text-left text-sm font-semibold text-foreground hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="px-3 sm:px-4 pb-3 sm:pb-4 text-sm leading-relaxed text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <BackupDataCard />

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-center space-y-3">
        <h3 className="font-semibold text-foreground">Siap Melakukan Donasi Qurban?</h3>
        <p className="text-sm text-muted-foreground">
          Hubungi tim Qurbanku untuk konsultasi program, harga, dan pemilihan hewan qurban.
        </p>
        <Button
          size="sm"
          className="bg-[hsl(var(--wa-green))] hover:bg-[hsl(var(--wa-green))]/90 text-white"
          onClick={() =>
            window.open(
              generateWhatsAppLink(
                "Assalamualaikum, saya ingin melakukan donasi qurban. Mohon informasi program dan harga.",
                "donasi:cta"
              ),
              "_blank"
            )
          }
        >
          <MessageCircle className="mr-2 h-4 w-4" strokeWidth={1.8} /> Konsultasi Donasi Qurban
        </Button>
      </div>
    </div>
  );
};

export default Donasi;
