import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, Scale, Users, Star, MessageCircle, HelpCircle, ArrowLeft, Heart, ArrowRight } from "lucide-react";
import { educationArticles, faqItems, generateWhatsAppLink } from "@/lib/qurban-data";
import SEO from "@/components/SEO";
import KajianSection from "@/components/KajianSection";

const iconMap: Record<string, React.ElementType> = { Scale, BookOpen, Users, Star };

const Edukasi = () => {
  const [activeArticle, setActiveArticle] = useState<string | null>(null);
  const article = educationArticles.find((a) => a.id === activeArticle);

  return (
    <div className="space-y-5">
      <SEO
        title="Edukasi Qurban — Hukum, Tata Cara & Tanya Jawab | Qurbanku"
        description="Pelajari hukum, syarat, tata cara qurban, keutamaan Idul Adha, dan jawaban pertanyaan umum seputar ibadah qurban."
        path="/edukasi"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />
      <div>
        <h1 className="text-xl font-bold text-foreground">Edukasi Qurban</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Hukum, tata cara & keutamaan</p>
      </div>

      {!activeArticle && (
        <>
          <div className="grid grid-cols-2 gap-3">
            {educationArticles.map((art) => {
              const Icon = iconMap[art.icon] || BookOpen;
              return (
                <button
                  key={art.id}
                  className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center transition-all active:scale-[0.98] hover:border-primary/30"
                  onClick={() => setActiveArticle(art.id)}
                >
                  <div className="rounded-full bg-primary/8 p-2.5 text-primary">
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </div>
                  <p className="text-xs font-medium leading-snug">{art.title}</p>
                </button>
              );
            })}
          </div>

          {/* Qurbani Donation CTA */}
          <Link
            to="/donasi"
            className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/[0.03] p-4 transition-all hover:border-primary/40 hover:bg-primary/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Baca panduan qurbani donation untuk audiens internasional"
          >
            <div className="rounded-full bg-primary/10 p-2.5 text-primary">
              <Heart className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-foreground">Qurbani Donation Guide</h2>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                Panduan berqurban dari luar negeri untuk didistribusikan di Indonesia.
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.8} />
          </Link>

          {/* FAQ */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-muted-foreground" strokeWidth={1.8} />
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tanya Jawab</h2>
            </div>
            <Accordion type="single" collapsible className="w-full space-y-2 sm:space-y-3">
              {faqItems.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
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

          <KajianSection />


          {/* CTA */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center space-y-2">
            <p className="text-sm text-muted-foreground">Butuh bantuan memilih hewan qurban?</p>
            <Button
              size="sm"
              className="bg-[hsl(var(--wa-green))] hover:bg-[hsl(var(--wa-green))]/90 text-white"
              onClick={() => window.open(generateWhatsAppLink("Assalamualaikum, saya ingin konsultasi memilih hewan qurban yang tepat.", "edukasi:konsultasi"), "_blank")}
            >
              <MessageCircle className="mr-2 h-4 w-4" strokeWidth={1.8} /> Konsultasi Gratis
            </Button>
          </div>
        </>
      )}

      {article && (
        <div>
          <SEO
            title={`${article.title} — Edukasi Qurban | Qurbanku`}
            description={article.content.slice(0, 155).replace(/[*>\n]/g, " ").trim()}
            path="/edukasi"
            jsonLd={{
              "@context": "https://schema.org",
              "@type": "Article",
              headline: article.title,
              articleBody: article.content.replace(/\*\*/g, ""),
              author: { "@type": "Organization", name: "Qurbanku" },
              publisher: { "@type": "Organization", name: "Qurbanku" },
            }}
          />
          <button onClick={() => setActiveArticle(null)} className="flex items-center gap-1 text-sm text-primary font-medium mb-4">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.8} /> Kembali
          </button>

          <div className="rounded-xl border bg-card p-5">
            <h2 className="text-lg font-bold mb-4">{article.title}</h2>
            <div className="space-y-2">
              {article.content.split("\n").map((line, i) => {
                if (line.startsWith("> ")) return <blockquote key={i} className="border-l-2 border-primary/30 pl-3 italic text-sm text-muted-foreground my-2">{line.slice(2)}</blockquote>;
                if (line.startsWith("**") && line.endsWith("**")) return <h3 key={i} className="font-semibold text-sm text-foreground mt-4 mb-1">{line.replace(/\*\*/g, "")}</h3>;
                if (line.startsWith("- ")) return <li key={i} className="ml-4 text-sm text-muted-foreground">{line.slice(2)}</li>;
                if (/^\d+\./.test(line)) return <p key={i} className="text-sm text-muted-foreground ml-4">{line}</p>;
                return line.trim() ? <p key={i} className="text-sm text-muted-foreground leading-relaxed">{line.replace(/\*\*(.*?)\*\*/g, "$1")}</p> : null;
              })}
            </div>

            <div className="mt-6 rounded-xl bg-primary/5 p-4 text-center border border-primary/10">
              <p className="text-xs text-muted-foreground mb-2">Siap berqurban? Kami siap membantu.</p>
              <Button
                size="sm"
                className="bg-[hsl(var(--wa-green))] hover:bg-[hsl(var(--wa-green))]/90 text-white"
                onClick={() => window.open(generateWhatsAppLink(`Assalamualaikum, saya baru membaca artikel "${article.title}" dan tertarik untuk berqurban. Mohon info lebih lanjut.`, `edukasi:${article.id}`), "_blank")}
              >
                <MessageCircle className="mr-2 h-4 w-4" strokeWidth={1.8} /> Hubungi Kami
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Edukasi;
