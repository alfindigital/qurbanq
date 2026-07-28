import { getDaysUntilIdulAdha } from "./qurban-data";

const REMINDER_STORAGE_KEY = "qurbanku-reminders";

export interface ReminderSetting {
  id: string;
  label: string;
  daysBefore: number;
  enabled: boolean;
}

export const defaultReminders: ReminderSetting[] = [
  { id: "30d", label: "30 hari sebelum", daysBefore: 30, enabled: false },
  { id: "10d", label: "10 hari Dzulhijjah (mulai puasa & larangan cukur)", daysBefore: 10, enabled: false },
  { id: "7d", label: "7 hari sebelum", daysBefore: 7, enabled: false },
  { id: "1d", label: "1 hari sebelum", daysBefore: 1, enabled: false },
];

export const loadReminders = (): ReminderSetting[] => {
  try {
    const raw = localStorage.getItem(REMINDER_STORAGE_KEY);
    if (raw) {
      const saved: ReminderSetting[] = JSON.parse(raw);
      const validIds = new Set(defaultReminders.map((r) => r.id));
      const filtered = saved.filter((r) => validIds.has(r.id));
      // merge any new defaults not yet saved
      const merged = defaultReminders.map((d) => {
        const existing = filtered.find((r) => r.id === d.id);
        return existing ? { ...d, enabled: existing.enabled } : d;
      });
      return merged;
    }
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
  const diffDays = getDaysUntilIdulAdha();

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
