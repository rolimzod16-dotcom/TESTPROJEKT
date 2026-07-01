import { REPORT_INTERVAL_MS } from "@/lib/report-schedule";
const SCHEDULED_COUNT = 24;

type CapacitorLike = {
  isNativePlatform?: () => boolean;
};

function isCapacitorNative() {
  if (typeof window === "undefined") return false;
  const cap = (window as Window & { Capacitor?: CapacitorLike }).Capacitor;
  return !!cap?.isNativePlatform?.();
}

async function loadLocalNotifications() {
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  return LocalNotifications;
}

export async function isNativeNotificationsAvailable() {
  return isCapacitorNative();
}

export async function requestNativeNotificationPermission() {
  if (!isCapacitorNative()) return "unsupported";

  const LocalNotifications = await loadLocalNotifications();
  const result = await LocalNotifications.requestPermissions();
  return result.display;
}

export async function scheduleReportReminders(hiveName?: string) {
  if (!isCapacitorNative()) return { scheduled: 0, skipped: "not_native" };

  const LocalNotifications = await loadLocalNotifications();
  const permission = await LocalNotifications.requestPermissions();
  if (permission.display !== "granted") {
    return { scheduled: 0, skipped: "permission_denied" };
  }

  const pending = await LocalNotifications.getPending();
  const reminderIds = pending.notifications
    .map((item) => item.id)
    .filter((id) => id >= 1000 && id < 2000);
  if (reminderIds.length) {
    await LocalNotifications.cancel({ notifications: reminderIds.map((id) => ({ id })) });
  }

  const title = hiveName ? `🐝 ${hiveName}` : "🐝 HiveMonitor";
  const notifications = Array.from({ length: SCHEDULED_COUNT }, (_, index) => {
    const slot = index + 1;
    return {
      id: 1000 + slot,
      title,
      body: "Новый отчёт улья — нажмите, чтобы открыть",
      schedule: { at: new Date(Date.now() + slot * REPORT_INTERVAL_MS) },
      extra: { url: "/app/dashboard" },
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#f59e0b",
    };
  });

  await LocalNotifications.schedule({ notifications });

  return { scheduled: notifications.length };
}

export async function showNativeReportNotification(
  title: string,
  body: string,
) {
  if (!isCapacitorNative()) return false;

  const LocalNotifications = await loadLocalNotifications();
  const permission = await LocalNotifications.checkPermissions();
  if (permission.display !== "granted") return false;

  await LocalNotifications.schedule({
    notifications: [
      {
        id: Date.now() % 100000,
        title,
        body,
        schedule: { at: new Date(Date.now() + 500) },
        extra: { url: "/app/dashboard" },
        smallIcon: "ic_stat_icon_config_sample",
        iconColor: "#f59e0b",
      },
    ],
  });

  return true;
}

export async function setupNativeNotificationListeners() {
  if (!isCapacitorNative()) return;

  const LocalNotifications = await loadLocalNotifications();
  await LocalNotifications.addListener(
    "localNotificationActionPerformed",
    (event) => {
      const url = (event.notification.extra?.url as string) ?? "/app/dashboard";
      window.location.href = url;
    },
  );
}