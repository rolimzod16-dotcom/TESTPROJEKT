import {
  isPushSupported,
  registerServiceWorker,
  subscribeToPushNotifications,
} from "@/lib/push-client";
import {
  isNativeNotificationsAvailable,
  requestNativeNotificationPermission,
  scheduleReportReminders,
  setupNativeNotificationListeners,
} from "@/lib/native-notifications";

export type NotificationSetupResult = {
  webPush: "enabled" | "unsupported" | "denied" | "failed";
  nativeReminders: "scheduled" | "unsupported" | "denied" | "failed";
  message: string;
};

export async function enableAllNotifications(hiveName?: string): Promise<NotificationSetupResult> {
  let webPush: NotificationSetupResult["webPush"] = "unsupported";
  let nativeReminders: NotificationSetupResult["nativeReminders"] = "unsupported";

  await registerServiceWorker();
  void setupNativeNotificationListeners();

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
      } else {
        nativeReminders = "denied";
      }
    } catch {
      nativeReminders = "failed";
    }
  }

  const message = buildSetupMessage(webPush, nativeReminders);

  return { webPush, nativeReminders, message };
}

function buildSetupMessage(
  webPush: NotificationSetupResult["webPush"],
  nativeReminders: NotificationSetupResult["nativeReminders"],
) {
  if (webPush === "enabled" && nativeReminders === "scheduled") {
    return "Уведомления включены. Push + напоминания каждый час, даже если приложение закрыто.";
  }
  if (nativeReminders === "scheduled") {
    return "Напоминания каждый час включены в APK. Отчёты приходят даже при закрытом приложении.";
  }
  if (webPush === "enabled") {
    return "Push включён. Уведомления будут приходить при новых отчётах.";
  }
  if (webPush === "denied" || nativeReminders === "denied") {
    return "Разрешите уведомления в настройках телефона для HiveMonitor.";
  }
  return "Не удалось включить уведомления. Попробуйте снова или проверьте настройки Android.";
}