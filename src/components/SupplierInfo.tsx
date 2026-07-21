import { Copy } from "lucide-react";
import { toast } from "sonner";
import { suppliers, formatCurrency } from "@/lib/qurban-data";

// Menampilkan info supplier hewan qurban + rekening resmi + DP + area kirim.
// Softselling: informatif, tidak agresif. Qurbanku sebagai brand kalkulator,
// supplier ini adalah rekanan penyedia hewan (bisa bertambah ke depannya).
const SupplierInfo = () => {
  const copy = (value: string, label: string) => {
    navigator.clipboard.writeText(value).then(
      () => toast.success(`${label} disalin`),
      () => toast.error("Gagal menyalin"),
    );
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-display text-base font-bold text-forest">Supplier Rekanan</h2>
        <p className="text-[11px] text-muted-foreground">
          Acuan harga di aplikasi mengikuti katalog supplier di bawah. Kamu tetap bebas memilih penyedia lain.
        </p>
      </div>

      {suppliers.map((s) => (
        <div key={s.id} className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-forest">{s.name}</p>
              <p className="text-[11px] text-muted-foreground">{s.location}</p>
            </div>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              Rekanan
            </span>
          </div>

          <div className="rounded-xl bg-muted/60 p-3 space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-forest/70">Rekening Resmi</p>
            <p className="text-xs text-muted-foreground">{s.bankName}</p>
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono text-base font-bold text-forest">{s.bankAccount}</p>
              <button
                onClick={() => copy(s.bankAccount, "Nomor rekening")}
                className="flex items-center gap-1 rounded-full bg-background px-2.5 py-1 text-[10px] font-semibold text-primary hover:bg-primary/10 transition-colors"
                aria-label="Salin nomor rekening"
              >
                <Copy className="h-3 w-3" strokeWidth={1.8} /> Salin
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">a.n. {s.bankHolder}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-muted/60 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-forest/70">DP Kambing/Domba</p>
              <p className="mt-1 font-semibold text-forest">{formatCurrency(s.dpKambing)}<span className="text-[10px] font-normal text-muted-foreground"> / ekor</span></p>
              <p className="text-[10px] text-muted-foreground">Pelunasan H-2 pengiriman</p>
            </div>
            <div className="rounded-xl bg-muted/60 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-forest/70">DP Sapi</p>
              <p className="mt-1 font-semibold text-forest">{formatCurrency(s.dpSapi)}<span className="text-[10px] font-normal text-muted-foreground"> / ekor</span></p>
              <p className="text-[10px] text-muted-foreground">Pelunasan H-5 Idul Adha</p>
            </div>
          </div>

          <div className="rounded-xl border border-dashed border-border p-3 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-forest/70">Jadwal & Area Pengiriman</p>
            <p className="text-xs text-muted-foreground">{s.deliveryAreas}</p>
            <p className="text-[11px] text-muted-foreground">{s.deliveryNote}</p>
          </div>

          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Penting: Selalu konfirmasi ke supplier sebelum transfer. Qurbanku tidak menahan dana; transaksi langsung ke rekening supplier.
          </p>
        </div>
      ))}
    </section>
  );
};

export default SupplierInfo;
