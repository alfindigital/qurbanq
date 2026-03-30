import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, Scale, Users, Star, MessageCircle, HelpCircle } from "lucide-react";
import { educationArticles, faqItems, generateWhatsAppLink } from "@/lib/qurban-data";

const iconMap: Record<string, React.ElementType> = { Scale, BookOpen, Users, Star };

const Edukasi = () => {
  const [activeArticle, setActiveArticle] = useState<string | null>(null);
  const article = educationArticles.find((a) => a.id === activeArticle);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Edukasi Qurban</h1>
        <p className="text-muted-foreground mt-1">Pelajari hukum, tata cara, dan keutamaan berqurban</p>
      </div>

      {/* Articles Grid */}
      {!activeArticle && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {educationArticles.map((art) => {
              const Icon = iconMap[art.icon] || BookOpen;
              return (
                <Card
                  key={art.id}
                  className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30"
                  onClick={() => setActiveArticle(art.id)}
                >
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="rounded-lg bg-primary/10 p-3 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{art.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Klik untuk membaca selengkapnya</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* FAQ */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><HelpCircle className="h-4 w-4" /> FAQ Seputar Qurban</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="text-left text-sm">{faq.q}</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">{faq.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* CTA */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-5 text-center">
              <p className="text-sm text-muted-foreground mb-3">Butuh bantuan memilih hewan qurban yang tepat?</p>
              <Button
                className="bg-[hsl(142,70%,35%)] hover:bg-[hsl(142,70%,30%)] text-white"
                onClick={() => window.open(generateWhatsAppLink("Assalamualaikum, saya ingin konsultasi memilih hewan qurban yang tepat. Mohon bantuannya."), "_blank")}
              >
                <MessageCircle className="mr-2 h-4 w-4" /> Konsultasi Gratis via WhatsApp
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {/* Article Detail */}
      {article && (
        <div>
          <Button variant="ghost" size="sm" onClick={() => setActiveArticle(null)} className="mb-4">
            ← Kembali ke daftar artikel
          </Button>
          <Card>
            <CardHeader>
              <CardTitle>{article.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                {article.content.split("\n").map((line, i) => {
                  if (line.startsWith("> ")) return <blockquote key={i} className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground my-2">{line.slice(2)}</blockquote>;
                  if (line.startsWith("**") && line.endsWith("**")) return <h3 key={i} className="font-bold text-foreground mt-4 mb-2">{line.replace(/\*\*/g, "")}</h3>;
                  if (line.startsWith("- ")) return <li key={i} className="ml-4 text-sm text-muted-foreground">{line.slice(2)}</li>;
                  if (/^\d+\./.test(line)) return <p key={i} className="text-sm text-muted-foreground ml-4">{line}</p>;
                  return line.trim() ? <p key={i} className="text-sm text-muted-foreground">{line.replace(/\*\*(.*?)\*\*/g, "$1")}</p> : <br key={i} />;
                })}
              </div>

              <div className="mt-6 rounded-lg bg-primary/5 p-4 text-center border border-primary/10">
                <p className="text-sm text-muted-foreground mb-2">Siap berqurban? Kami siap membantu Anda.</p>
                <Button
                  size="sm"
                  className="bg-[hsl(142,70%,35%)] hover:bg-[hsl(142,70%,30%)] text-white"
                  onClick={() => window.open(generateWhatsAppLink(`Assalamualaikum, saya baru membaca artikel "${article.title}" dan tertarik untuk berqurban. Mohon info lebih lanjut.`), "_blank")}
                >
                  <MessageCircle className="mr-2 h-4 w-4" /> Hubungi Kami
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Edukasi;
