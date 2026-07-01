import {
  isPushSupported,
  registerServiceWorker,
  subscribeToPushNotifications,
} from "@/lib/push-client";
import {
  getNativeNotificationStatus,
  isNativeNotificationsAvailable,
  requestNativeNotificationPermission,
  scheduleReportReminders,
  sendTestNotification,
  setupNativeNotificationListeners,
} from "@/lib/native-notifications";

export type NotificationSetupResult = {
  webPush: "enabled" | "unsupported" | "denied" | "failed";
  nativeReminders: "scheduled" | "unsupported" | "denied" | "failed";
  message: string;
  testSent?: boolean;
};

export async function enableAllNotifications(
  hiveName?: string,
): Promise<NotificationSetupResult> {
  let webPush: NotificationSetupResult["webPush"] = "unsupported";
  let nativeReminders: NotificationSetupResult["nativeReminders"] = "unsupported";
  let testSent = false;

  await registerServiceWorker();
  await setupNativeNotificationListeners();

  if (isPushSupported()) {
    try {
      await subscribeToPushNotifications();
      webPush = "enabled";
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown";
      webPush = message === "permission_denied" ? "denied" : "failed";
    }
  }

  if (await isNativeNotificationsAvailable()) {
    try {
      const permission = await requestNativeNotificationPermission();
      if (permission === "granted") {
        const result = await scheduleReportReminders(hiveName);
        nativeReminders = result.scheduled > 0 ? "scheduled" : "failed";
        testSent = await sendTestNotification(hiveName);
      } else {
        nativeReminders = "denied";
      }
    } catch {
      nativeReminders = "failed";
    }
  }

  const message = buildSetupMessage(webPush, nativeReminders, testSent);

  return { webPush, nativeReminders, message, testSent };
}

export async function getNotificationDiagnostics() {
  const native = await getNativeNotificationStatus();
  const webPermission =
    typeof Notification !== "undefined" ? Notification.permission : "unsupported";

  return {
    native,
    webPermission,
    webPushSupported: isPushSupported(),
  };
}

function buildSetupMessage(
  webPush: NotificationSetupResult["webPush"],
  nativeReminders: NotificationSetupResult["nativeReminders"],
  testSent: boolean,
) {
  const testNote = testSent
    ? " Тестовое уведомление отправлено — проверьте шторку."
    : "";

  if (nativeReminders === "scheduled" && webPush === "enabled") {
    return `Уведомления включены полностью.${testNote}`;
  }
  if (nativeReminders === "scheduled") {
    return `APK-уведомления включены. Напоминания каждый час, даже если приложение закрыто.${testNote}`;
  }
  if (webPush === "enabled") {
    return "Web push включён. Для APK лучше разрешить уведомления в настройках Android.";
  }
  if (webPush === "denied" || nativeReminders === "denied") {
    return "Разрешите уведомления: Настройки → Приложения → HiveMonitor → Уведомления → Вкл.";
  }
  return "Не удалось включить уведомления. Откройте настройки Android и разрешите их вручную.";
}