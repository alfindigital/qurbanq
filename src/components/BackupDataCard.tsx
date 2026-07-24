import { Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { downloadBackup, importAllData, pickBackupFile } from "@/lib/storage";

// Blok Backup/Restore data lokal. Ditampilkan konsisten di setiap page tepat sebelum CTA WhatsApp.
const BackupDataCard = () => {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div>
        <p className="text-sm font-semibold text-foreground">Backup Data</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed">
          Ekspor daftar patungan, tabungan, dan checklist ke file JSON. Import kembali kalau ganti device atau install ulang.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            downloadBackup();
            toast.success("Backup diunduh", { description: "Simpan file JSON-nya di tempat aman." });
          }}
        >
          <Download className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.8} /> Ekspor
        </Button>
        <Button
          size="sm"
          variant="outline"
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
          <Upload className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.8} /> Import
        </Button>
      </div>
    </div>
  );
};

export default BackupDataCard;
