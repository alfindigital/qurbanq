import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getInAppReminder, dismissInAppReminder } from "@/lib/notifications";
import { generateWhatsAppLink } from "@/lib/qurban-data";

const InAppReminder = () => {
  const [reminder, setReminder] = useState<ReturnType<typeof getInAppReminder>>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const r = getInAppReminder();
    if (r) {
      setReminder(r);
      setTimeout(() => setVisible(true), 1000);
    }
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    dismissInAppReminder();
  };

  const colorMap = {
    urgent: "border-red-500/30 bg-red-500/10 text-red-400",
    warning: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
    info: "border-primary/30 bg-primary/10 text-primary",
  };

  if (!reminder) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className={`mx-4 mt-2 rounded-xl border p-3.5 ${colorMap[reminder.type]}`}
        >
          <div className="flex items-start gap-2.5">
            <Bell className="h-4 w-4 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium leading-snug">{reminder.message}</p>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs border-current/20 hover:bg-current/10"
                onClick={() => window.open(generateWhatsAppLink("Assalamualaikum, saya ingin memesan hewan qurban. Mohon info ketersediaan."), "_blank")}
              >
                <MessageCircle className="mr-1.5 h-3 w-3" strokeWidth={1.5} /> Pesan Sekarang
              </Button>
            </div>
            <button onClick={handleDismiss} className="opacity-60 hover:opacity-100 transition-opacity">
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InAppReminder;
