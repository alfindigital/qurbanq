// Encode / decode state kalkulator patungan ke URL hash supaya user bisa
// share link `?p=<base64>` di WA grup keluarga dan penerima langsung
// melihat konfigurasi patungan yang sama tanpa perlu backend.
import type { AnimalType } from "./qurban-data";

export interface SharedCalcState {
  type: AnimalType | null;
  animal: string | null;
  patungan: boolean;
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
    const parsed = JSON.parse(raw) as SharedCalcState;
    if (!parsed || typeof parsed !== "object") return null;
    return {
      type: parsed.type ?? null,
      animal: parsed.animal ?? null,
      patungan: !!parsed.patungan,
      participants: Array.isArray(parsed.participants) ? parsed.participants.filter((n) => typeof n === "string") : [],
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
