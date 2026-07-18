// Encode / decode state kalkulator qurban ke URL hash supaya user bisa
// share link `?p=<base64>` di WA grup keluarga dan penerima langsung
// melihat konfigurasi yang sama tanpa perlu backend.
import type { AnimalType } from "./qurban-data";

export interface SharedCalcState {
  type: AnimalType | null;
  animal: string | null;
  persons: number;
  participants: string[];
}

const b64encode = (s: string) => {
  try {
    return btoa(unescape(encodeURIComponent(s)));
  } catch {
    return "";
  }
};

const b64decode = (s: string) => {
  try {
    return decodeURIComponent(escape(atob(s)));
  } catch {
    return "";
  }
};

export const encodeCalcState = (state: SharedCalcState): string => b64encode(JSON.stringify(state));

export const decodeCalcState = (encoded: string): SharedCalcState | null => {
  const raw = b64decode(encoded);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as SharedCalcState & { patungan?: boolean };
    if (!parsed || typeof parsed !== "object") return null;
    const participants = Array.isArray(parsed.participants)
      ? parsed.participants.filter((n) => typeof n === "string")
      : [];
    // Backward compat: link share versi lama menyimpan `patungan: boolean`.
    // Kalau `persons` tidak ada, derive dari flag lama (patungan=7 utk sapi/unta, 1 utk lainnya)
    // atau dari jumlah participants yang tersimpan.
    let persons: number;
    if (typeof parsed.persons === "number" && parsed.persons > 0) {
      persons = parsed.persons;
    } else if (typeof parsed.patungan === "boolean") {
      persons = parsed.patungan ? Math.max(7, participants.length || 7) : 1;
    } else {
      persons = Math.max(1, participants.length);
    }
    return {
      type: parsed.type ?? null,
      animal: parsed.animal ?? null,
      persons,
      participants,
    };
  } catch {
    return null;
  }
};

// Baca state dari `?p=...` atau `#p=...`. Setelah dibaca, bersihkan URL supaya
// history navigation tidak stuck di link share.
export const readIncomingShare = (): SharedCalcState | null => {
  if (typeof window === "undefined") return null;
  const url = new URL(window.location.href);
  const fromQuery = url.searchParams.get("p");
  const fromHash = /[#&]p=([^&]+)/.exec(url.hash)?.[1];
  const token = fromQuery ?? fromHash;
  if (!token) return null;
  const state = decodeCalcState(decodeURIComponent(token));
  // Cleanup URL agar refresh berikutnya tidak reset state user.
  url.searchParams.delete("p");
  if (fromHash) url.hash = url.hash.replace(/([#&])p=[^&]+/, "$1").replace(/^#&?/, "#").replace(/^#$/, "");
  window.history.replaceState({}, "", url.toString());
  return state;
};

export const buildShareUrl = (state: SharedCalcState, origin?: string): string => {
  const base = origin ?? (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/?p=${encodeCalcState(state)}`;
};
