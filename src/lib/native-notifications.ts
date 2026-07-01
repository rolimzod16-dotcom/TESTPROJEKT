import { REPORT_INTERVAL_MS } from "@/lib/report-schedule";

const CHANNEL_ID = "hive-reports";
const REPEATING_NOTIFICATION_ID = 1001;

type CapacitorLike = {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
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

async function ensureAndroidChannel() {
  const cap = (window as Window & { Capacitor?: CapacitorLike }).Capacitor;
  if (cap?.getPlatform?.() !== "android") return;

  const LocalNotifications = await loadLocalNotifications();
  await LocalNotifications.createChannel({
    id: CHANNEL_ID,
    name: "Отчёты улья",
    description: "Уведомления HiveMonitor о новых отчётах",
    importance: 5,
    visibility: 1,
    sound: "default",
    vibration: true,
  });
}

export async function isNativeNotificationsAvailable() {
  return isCapacitorNative();
}

export async function requestNativeNotificationPermission() {
  if (!isCapacitorNative()) return "unsupported";

  const LocalNotifications = await loadLocalNotifications();
  await ensureAndroidChannel();
  const result = await LocalNotifications.requestPermissions();
  return result.display;
}

export async function scheduleReportReminders(hiveName?: string) {
  if (!isCapacitorNative()) return { scheduled: 0, skipped: "not_native" };

  const LocalNotifications = await loadLocalNotifications();
  await ensureAndroidChannel();

  const permission = await LocalNotifications.requestPermissions();
  if (permission.display !== "granted") {
    return { scheduled: 0, skipped: "permission_denied" };
  }

  const pending = await LocalNotifications.getPending();
  const oldIds = pending.notifications
    .map((item) => item.id)
    .filter((id) => id >= 1000 && id < 2000);
  if (oldIds.length) {
    await LocalNotifications.cancel({
      notifications: oldIds.map((id) => ({ id })),
    });
  }

  const title = hiveName ? `🐝 ${hiveName}` : "🐝 HiveMonitor";
  const firstAt = new Date(Date.now() + REPORT_INTERVAL_MS);

  await LocalNotifications.schedule({
    notifications: [
      {
        id: REPEATING_NOTIFICATION_ID,
        title,
        body: "Новый отчёт улья — нажмите, чтобы открыть",
        schedule: {
          at: firstAt,
          every: "hour",
          count: 168,
        },
        channelId: CHANNEL_ID,
        extra: { url: "/app/dashboard" },
        smallIcon: "ic_launcher",
        iconColor: "#f59e0b",
      },
    ],
  });

  return { scheduled: 1 };
}

export async function showNativeReportNotification(title: string, body: string) {
  if (!isCapacitorNative()) return false;

  try {
    const LocalNotifications = await loadLocalNotifications();
    await ensureAndroidChannel();

    const permission = await LocalNotifications.checkPermissions();
    if (permission.display !== "granted") return false;

    await LocalNotifications.schedule({
      notifications: [
        {
          id: (Date.now() % 100000) + 2000,
          title,
          body,
          schedule: { at: new Date(Date.now() + 300) },
          channelId: CHANNEL_ID,
          extra: { url: "/app/dashboard" },
          smallIcon: "ic_launcher",
          iconColor: "#f59e0b",
        },
      ],
    });

    return true;
  } catch {
    return false;
  }
}

export async function sendTestNotification(hiveName?: string) {
  return showNativeReportNotification(
    hiveName ? `🐝 ${hiveName}` : "🐝 HiveMonitor",
    "Тест: уведомления работают! Отчёты будут приходить каждый час.",
  );
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

export async function getNativeNotificationStatus() {
  if (!isCapacitorNative()) {
    return { available: false, permission: "unsupported" as const, pending: 0 };
  }

  const LocalNotifications = await loadLocalNotifications();
  const permission = await LocalNotifications.checkPermissions();
  const pending = await LocalNotifications.getPending();

  return {
    available: true,
    permission: permission.display,
    pending: pending.notifications.length,
  };
}