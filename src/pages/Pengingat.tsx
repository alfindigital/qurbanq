import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Clock, MessageCircle, CheckCircle2, Bell, BellOff, BellRing } from "lucide-react";
import { getNextIdulAdha, preparationChecklist, generateWhatsAppLink } from "@/lib/qurban-data";
import {
  loadReminders,
  saveReminders,
  requestNotificationPermission,
  getNotificationPermission,
  sendBrowserNotification,
  checkAndTriggerReminders,
  type ReminderSetting,
} from "@/lib/notifications";

const Pengingat = () => {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("qurbanku-checklist");
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [reminders, setReminders] = useState<ReminderSetting[]>(loadReminders);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | "unsupported">(getNotificationPermission);

  useEffect(() => {
    const target = getNextIdulAdha();
    const update = () => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) return;
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Check reminders on mount
  useEffect(() => {
    const triggered = checkAndTriggerReminders(reminders);
    triggered.forEach((r) => {
      sendBrowserNotification(
        "🐾 Pengingat Qurban",
        `Idul Adha tinggal ${r.daysBefore} hari lagi! Pastikan persiapan qurban sudah siap.`
      );
      toast.info(`Pengingat: Idul Adha ${r.daysBefore} hari lagi!`, {
        description: "Pastikan persiapan qurban sudah siap.",
        duration: 8000,
      });
    });
  }, [reminders]);

  const handleEnableNotifications = async () => {
    const permission = await requestNotificationPermission();
    setNotifPermission(permission);
    if (permission === "granted") {
      toast.success("Notifikasi diaktifkan!", { description: "Anda akan menerima pengingat qurban." });
      sendBrowserNotification("🎉 Notifikasi Aktif", "Anda akan menerima pengingat menjelang Idul Adha.");
    } else {
      toast.error("Izin notifikasi ditolak", { description: "Aktifkan dari pengaturan browser untuk menerima pengingat." });
    }
  };

  const toggleReminder = (id: string) => {
    const updated = reminders.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
    setReminders(updated);
    saveReminders(updated);
    const toggled = updated.find((r) => r.id === id);
    if (toggled?.enabled) {
      toast.success(`Pengingat "${toggled.label}" diaktifkan`);
    }
  };

  const toggleCheck = (id: string) => setChecked((prev) => {
    const updated = { ...prev, [id]: !prev[id] };
    localStorage.setItem("qurbanku-checklist", JSON.stringify(updated));
    return updated;
  });
  const completedCount = Object.values(checked).filter(Boolean).length;
  const totalItems = preparationChecklist.length;
  const categories = [...new Set(preparationChecklist.map((c) => c.category))];
  const activeReminders = reminders.filter((r) => r.enabled).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Pengingat</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Countdown, notifikasi & checklist</p>
      </div>

      {/* Countdown */}
      <div className="rounded-2xl bg-primary px-5 py-5 text-primary-foreground">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4" strokeWidth={1.5} />
          <p className="text-sm font-semibold">Idul Adha 1447 H</p>
        </div>
        <div className="flex gap-2">
          {[
            { label: "Hari", value: countdown.days },
            { label: "Jam", value: countdown.hours },
            { label: "Mnt", value: countdown.minutes },
            { label: "Dtk", value: countdown.seconds },
          ].map((item) => (
            <div key={item.label} className="flex flex-1 flex-col items-center rounded-xl bg-white/10 py-2.5">
              <span className="text-lg font-bold">{String(item.value).padStart(2, "0")}</span>
              <span className="text-[10px] opacity-60">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Settings */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BellRing className="h-4 w-4 text-primary" strokeWidth={1.5} />
            <p className="text-sm font-semibold">Pengingat Notifikasi</p>
          </div>
          {activeReminders > 0 && (
            <span className="text-[10px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {activeReminders} aktif
            </span>
          )}
        </div>

        {notifPermission === "unsupported" && (
          <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2.5">
            Browser Anda tidak mendukung notifikasi push.
          </p>
        )}

        {notifPermission === "denied" && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-2.5">
            <p className="text-xs text-destructive">
              Izin notifikasi ditolak. Aktifkan dari pengaturan browser Anda.
            </p>
          </div>
        )}

        {notifPermission === "default" && (
          <Button size="sm" variant="outline" className="w-full" onClick={handleEnableNotifications}>
            <Bell className="mr-2 h-3.5 w-3.5" strokeWidth={1.5} />
            Aktifkan Notifikasi Push
          </Button>
        )}

        {notifPermission === "granted" && (
          <p className="text-xs text-primary flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.5} />
            Notifikasi push aktif
          </p>
        )}

        <div className="space-y-1.5">
          <AnimatePresence>
            {reminders.map((r) => (
              <motion.div
                key={r.id}
                layout
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2.5"
              >
                <div className="flex items-center gap-2.5">
                  {r.enabled ? (
                    <Bell className="h-3.5 w-3.5 text-primary" strokeWidth={1.5} />
                  ) : (
                    <BellOff className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                  )}
                  <span className={`text-sm ${r.enabled ? "font-medium" : "text-muted-foreground"}`}>
                    {r.label}
                  </span>
                </div>
                <Switch
                  checked={r.enabled}
                  onCheckedChange={() => toggleReminder(r.id)}
                  disabled={notifPermission !== "granted" && notifPermission !== "unsupported"}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {notifPermission !== "granted" && notifPermission !== "unsupported" && (
          <p className="text-[10px] text-muted-foreground text-center">
            Aktifkan notifikasi push terlebih dahulu untuk mengatur pengingat
          </p>
        )}
      </div>

      {/* Checklist */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Checklist Persiapan</p>
          <span className="text-xs text-muted-foreground">{completedCount}/{totalItems}</span>
        </div>
        <div className="space-y-4">
          {categories.map((cat) => (
            <div key={cat}>
              <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">{cat}</p>
              <div className="space-y-1.5">
                {preparationChecklist
                  .filter((c) => c.category === cat)
                  .map((item) => (
                    <label
                      key={item.id}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all active:scale-[0.98] ${checked[item.id] ? "bg-primary/5 border-primary/20" : ""}`}
                    >
                      <Checkbox checked={!!checked[item.id]} onCheckedChange={() => toggleCheck(item.id)} />
                      <span className={`text-sm flex-1 ${checked[item.id] ? "line-through text-muted-foreground" : ""}`}>
                        {item.label}
                      </span>
                      {checked[item.id] && <CheckCircle2 className="h-4 w-4 text-primary" strokeWidth={1.5} />}
                    </label>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center space-y-2">
        <p className="text-sm text-muted-foreground">Siap berqurban? Pesan sekarang!</p>
        <Button
          size="sm"
          className="bg-[hsl(var(--wa-green))] hover:bg-[hsl(var(--wa-green))]/90 text-white"
          onClick={() => window.open(generateWhatsAppLink("Assalamualaikum, saya ingin memesan hewan qurban. Mohon info ketersediaan."), "_blank")}
        >
          <MessageCircle className="mr-2 h-4 w-4" strokeWidth={1.5} /> Pesan via WhatsApp
        </Button>
      </div>
    </div>
  );
};

export default Pengingat;
