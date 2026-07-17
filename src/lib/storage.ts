// Versioned localStorage wrapper + full backup export/import.
// Semua state Qurbanku (kalkulator, tabungan, checklist, reminders, ledger, dsb.)
// disimpan sebagai { v: 1, data: T } sehingga bisa dimigrasi antar versi.

export const STORAGE_VERSION = 1;

export const QURBANKU_KEYS = [
  "qurbanku-kalkulator",
  "qurbanku-tabungan",
  "qurbanku-tabungan-ledger",
  "qurbanku-checklist",
  "qurbanku-reminders",
  "qurbanku-onboarded",
  "qurbanku-paid-participants",
] as const;

export type QurbankuKey = (typeof QURBANKU_KEYS)[number];

interface Envelope<T> {
  v: number;
  data: T;
}

export const readVersioned = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    // Backward compat: kalau raw belum versioned, kembalikan apa adanya.
    if (parsed && typeof parsed === "object" && "v" in parsed && "data" in parsed) {
      return (parsed as Envelope<T>).data;
    }
    return parsed as T;
  } catch {
    return fallback;
  }
};

export const writeVersioned = <T>(key: string, data: T) => {
  try {
    const env: Envelope<T> = { v: STORAGE_VERSION, data };
    localStorage.setItem(key, JSON.stringify(env));
  } catch {}
};

// Ekspor semua data ke satu file JSON supaya user tidak kehilangan
// daftar patungan/checklist saat re-install PWA atau ganti device.
export const exportAllData = (): string => {
  const payload: Record<string, unknown> = {
    _meta: { app: "qurbanku", version: STORAGE_VERSION, exportedAt: new Date().toISOString() },
  };
  QURBANKU_KEYS.forEach((k) => {
    const raw = localStorage.getItem(k);
    if (raw) {
      try {
        payload[k] = JSON.parse(raw);
      } catch {
        payload[k] = raw;
      }
    }
  });
  return JSON.stringify(payload, null, 2);
};

export const downloadBackup = () => {
  const json = exportAllData();
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `qurbanku-backup-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export const importAllData = (jsonText: string): { imported: number; skipped: number } => {
  const parsed = JSON.parse(jsonText) as Record<string, unknown>;
  let imported = 0;
  let skipped = 0;
  QURBANKU_KEYS.forEach((k) => {
    if (k in parsed) {
      try {
        localStorage.setItem(k, JSON.stringify(parsed[k]));
        imported += 1;
      } catch {
        skipped += 1;
      }
    }
  });
  return { imported, skipped };
};

export const pickBackupFile = (): Promise<string> =>
  new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return reject(new Error("Tidak ada file dipilih"));
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(reader.error ?? new Error("Gagal membaca file"));
      reader.readAsText(file);
    };
    input.click();
  });
