import { Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { downloadBackup, importAllData, pickBackupFile } from "@/lib/storage";

// Blok Backup/Restore data lokal. Ditampilkan konsisten di setiap page tepat sebelum CTA WhatsApp.
const BackupDataCard = () => {
  return (
    <section
      aria-label="Backup data lokal"
      className="rounded-xl border bg-card p-4 sm:p-5 space-y-3"
    >
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">Backup Data</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Simpan patungan, tabungan & checklist ke file JSON. Import kembali kalau ganti device.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button
          size="sm"
          variant="outline"
          className="h-10 text-sm"
          onClick={() => {
            downloadBackup();
            toast.success("Backup diunduh", { description: "Simpan file JSON-nya di tempat aman." });
          }}
        >
          <Download className="mr-1.5 h-4 w-4" strokeWidth={1.8} /> Ekspor
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-10 text-sm"
          onClick={async () => {
            try {
              const text = await pickBackupFile();
              const ok = window.confirm("Import akan menimpa data saat ini. Lanjutkan?");
              if (!ok) return;
              const { imported } = importAllData(text);
              toast.success(`${imported} bagian data dimuat`, { description: "Halaman akan dimuat ulang." });
              setTimeout(() => window.location.reload(), 800);
            } catch (e) {
              toast.error("Gagal import", { description: (e as Error).message });
            }
          }}
        >
          <Upload className="mr-1.5 h-4 w-4" strokeWidth={1.8} /> Import
        </Button>
      </div>
    </section>
  );
};

export default BackupDataCard;
