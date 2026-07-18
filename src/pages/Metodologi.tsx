import SEO from "@/components/SEO";
import { animalOptions, formatCurrency } from "@/lib/qurban-data";

const Metodologi = () => {
  return (
    <div className="space-y-6">
      <SEO
        title="Metodologi & Sumber Data — Qurbanku"
        description="Sumber harga, asumsi bobot, dan disclaimer non-transaksional aplikasi Qurbanku."
        path="/metodologi"
      />

      <header>
        <h1 className="text-xl font-bold text-foreground">Tentang &amp; Metodologi</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cara kami menyusun estimasi harga dan jatah daging qurban.
        </p>
      </header>

      <section className="rounded-xl border bg-card p-4 space-y-2">
        <h2 className="text-sm font-semibold text-foreground">Sumber Harga</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Estimasi retail Jabodetabek (Mei–Juli 2026) disusun dari beberapa referensi
          publik: <strong>Kompas</strong>, <strong>Metrotvnews</strong>,{" "}
          <strong>Dompet Dhuafa</strong>, <strong>dombagarut.id</strong>, dan katalog
          penyedia lokal. Harga peternak langsung biasanya lebih rendah 5–15%.
        </p>
      </section>

      <section className="rounded-xl border bg-card p-4 space-y-2">
        <h2 className="text-sm font-semibold text-foreground">Asumsi Bobot &amp; Karkas</h2>
        <ul className="text-xs text-muted-foreground leading-relaxed list-disc pl-4 space-y-1">
          <li>Bobot pada aplikasi = bobot hidup rata-rata rentang.</li>
          <li>Karkas dihitung ±55% dari bobot hidup (kepala, kulit, jeroan dikurangi).</li>
          <li>Jatah daging per orang = karkas ÷ jumlah peserta.</li>
          <li>Distribusi disarankan dibagi 3: keluarga, sedekah, hadiah.</li>
        </ul>
      </section>

      <section className="rounded-xl border bg-card p-4 space-y-2">
        <h2 className="text-sm font-semibold text-foreground">Biaya Potong &amp; Antar</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Opsional Rp 150.000/ekor untuk jasa penyembelihan + distribusi Jabodetabek
          (RPH bersertifikat). Di luar Jabodetabek silakan konfirmasi langsung ke
          penyedia.
        </p>
      </section>

      <section className="rounded-xl border bg-card p-4 space-y-2">
        <h2 className="text-sm font-semibold text-foreground">Daftar Harga Terkini</h2>
        <div className="space-y-1.5">
          {animalOptions.map((a) => (
            <div key={a.id} className="flex justify-between text-xs border-b border-border/40 py-1.5">
              <div>
                <p className="font-medium text-foreground">{a.label}</p>
                <p className="text-[10px] text-muted-foreground">{a.weight}</p>
              </div>
              <span className="font-semibold text-primary">{formatCurrency(a.price)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
        <h2 className="text-sm font-semibold text-foreground">Disclaimer</h2>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
          Qurbanku adalah aplikasi <strong>kalkulator dan pengingat</strong>, bukan
          marketplace. Kami tidak menahan dana atau escrow. Semua transaksi terjadi
          langsung antara kamu dan penyedia hewan qurban via WhatsApp.
        </p>
      </section>
    </div>
  );
};

export default Metodologi;
