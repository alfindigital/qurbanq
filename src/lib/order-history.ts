// #28 Riwayat lokal setiap kali user klik CTA WhatsApp, untuk memudahkan
// mereka membuka pesanan sebelumnya tanpa harus mengisi ulang kalkulator.
import { readVersioned, writeVersioned } from "./storage";

const KEY = "qurbanku-riwayat";

export interface OrderHistoryItem {
  id: string;
  source: string;
  label: string;
  amount?: number;
  createdAt: string;
}

export const readOrderHistory = (): OrderHistoryItem[] => readVersioned<OrderHistoryItem[]>(KEY, []);

export const pushOrderHistory = (item: Omit<OrderHistoryItem, "id" | "createdAt">) => {
  const list = readOrderHistory();
  const next: OrderHistoryItem = {
    ...item,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  const trimmed = [next, ...list].slice(0, 20);
  writeVersioned(KEY, trimmed);
  return next;
};

export const clearOrderHistory = () => writeVersioned(KEY, []);
