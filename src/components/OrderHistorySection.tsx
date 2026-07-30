import { useEffect, useState } from "react";
import { History, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearOrderHistory, readOrderHistory, type OrderHistoryItem } from "@/lib/order-history";
import { formatCurrency } from "@/lib/qurban-data";

// #28 Riwayat pesanan lokal supaya user bisa mengingat pesanan terakhir.
const OrderHistorySection = () => {
  const [items, setItems] = useState<OrderHistoryItem[]>([]);

  useEffect(() => {
    setItems(readOrderHistory());
    const onFocus = () => setItems(readOrderHistory());
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  if (items.length === 0) return null;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-primary" strokeWidth={2} />
          <h2 className="font-display text-base font-bold text-forest">Riwayat Pesanan</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-[10px] text-muted-foreground hover:text-destructive"
          onClick={() => {
            clearOrderHistory();
            setItems([]);
          }}
        >
          <Trash2 className="mr-1 h-3 w-3" strokeWidth={2} /> Hapus
        </Button>
      </div>
      <ul className="space-y-2">
        {items.slice(0, 5).map((it) => (
          <li key={it.id} className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2 text-xs">
            <div>
              <p className="font-semibold text-forest">{it.label}</p>
              <p className="text-[10px] text-muted-foreground">
                {new Date(it.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })} · {it.source}
              </p>
            </div>
            {typeof it.amount === "number" && (
              <span className="font-bold text-primary">{formatCurrency(it.amount)}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default OrderHistorySection;
