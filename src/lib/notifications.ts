import { getNextIdulAdha } from "./qurban-data";

const REMINDER_STORAGE_KEY = "qurbanku-reminders";
const IN_APP_DISMISSED_KEY = "qurbanku-inapp-dismissed";

export interface ReminderSetting {
  id: string;
  label: string;
  daysBefore: number;
  enabled: boolean;
}

export const defaultReminders: ReminderSetting[] = [
  { id: "30d", label: "30 hari sebelum", daysBefore: 30, enabled: false },
  { id: "14d", label: "14 hari sebelum", daysBefore: 14, enabled: false },
  { id: "7d", label: "7 hari sebelum", daysBefore: 7, enabled: false },
  { id: "3d", label: "3 hari sebelum", daysBefore: 3, enabled: false },
  { id: "1d", label: "1 hari sebelum", daysBefore: 1, enabled: false },
];

export const loadReminders = (): ReminderSetting[] => {
  try {
    const raw = localStorage.getItem(REMINDER_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultReminders;
};

export const saveReminders = (reminders: ReminderSetting[]) => {
  localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(reminders));
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!("Notification" in window)) return "denied";
  if (Notification.permission === "granted") return "granted";
  return await Notification.requestPermission();
};

export const getNotificationPermission = (): NotificationPermission | "unsupported" => {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
};

export const sendBrowserNotification = (title: string, body: string, icon?: string) => {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  new Notification(title, {
    body,
    icon: icon ?? "/favicon.ico",
    badge: "/favicon.ico",
    tag: "qurbanku-reminder",
  });
};

export const checkAndTriggerReminders = (reminders: ReminderSetting[]) => {
  const target = getNextIdulAdha();
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const triggered: ReminderSetting[] = [];

  reminders.forEach((r) => {
    if (!r.enabled) return;
    if (diffDays === r.daysBefore) {
      const lastTriggered = localStorage.getItem(`qurbanku-triggered-${r.id}`);
      const today = new Date().toDateString();
      if (lastTriggered !== today) {
        triggered.push(r);
        localStorage.setItem(`qurbanku-triggered-${r.id}`, today);
      }
    }
  });

  return triggered;
};

export const getInAppReminder = (): { message: string; type: "urgent" | "warning" | "info" } | null => {
  const target = getNextIdulAdha();
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const dismissedDate = localStorage.getItem(IN_APP_DISMISSED_KEY);
  const today = new Date().toDateString();
  if (dismissedDate === today) return null;

  if (diffDays <= 0) return null;
  if (diffDays <= 3) return { message: `⚡ Idul Adha tinggal ${diffDays} hari lagi! Pastikan hewan qurban sudah dipesan.`, type: "urgent" };
  if (diffDays <= 7) return { message: `⏰ Idul Adha ${diffDays} hari lagi. Sudah siapkan persiapan qurban?`, type: "warning" };
  if (diffDays <= 30) return { message: `📅 ${diffDays} hari menuju Idul Adha. Yuk mulai persiapan qurban!`, type: "info" };
  return null;
};

export const dismissInAppReminder = () => {
  localStorage.setItem(IN_APP_DISMISSED_KEY, new Date().toDateString());
};
