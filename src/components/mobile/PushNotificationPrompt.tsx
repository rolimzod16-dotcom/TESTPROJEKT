"use client";

import { useEffect, useState } from "react";
import { enableAllNotifications } from "@/lib/notification-setup";
import { isPushSupported } from "@/lib/push-client";
import { isNativeNotificationsAvailable } from "@/lib/native-notifications";

type Props = {
  hiveName?: string;
  autoEnable?: boolean;
};

export function PushNotificationPrompt({
  hiveName,
  autoEnable = true,
}: Props) {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    async function detectSupport() {
      const native = await isNativeNotificationsAvailable();
      const web = isPushSupported();
      setSupported(native || web);

      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        setEnabled(true);
      }
    }

    void detectSupport();
  }, []);

  useEffect(() => {
    if (!autoEnable || !supported || enabled || dismissed || loading || attempted) {
      return;
    }

    const timer = window.setTimeout(() => {
      void handleEnable();
    }, 1500);

    return () => window.clearTimeout(timer);
  }, [autoEnable, supported, enabled, dismissed, loading, attempted]);

  if (!supported || (enabled && !status) || dismissed) return null;

  async function handleEnable() {
    setAttempted(true);
    setLoading(true);
    setError(null);
    try {
      const result = await enableAllNotifications(hiveName);
      setStatus(result.message);
      setEnabled(
        result.webPush === "enabled" || result.nativeReminders === "scheduled",
      );
      if (
        result.webPush === "denied" ||
        result.nativeReminders === "denied" ||
        (result.webPush === "failed" && result.nativeReminders === "failed")
      ) {
        setError(result.message);
      }
    } catch {
      setError("Не удалось включить уведомления");
    } finally {
      setLoading(false);
    }
  }

  if (enabled && status) {
    return (
      <div className="hm-card mb-4 border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
        <p className="font-bold">Уведомления включены</p>
        <p className="mt-1">{status}</p>
      </div>
    );
  }

  return (
    <div className="hm-card mb-4 border-sky-200 bg-gradient-to-br from-sky-50 to-white p-4">
      <p className="font-bold text-sky-900">Уведомления каждые 2 часа</p>
      <p className="mt-1 text-sm text-sky-800">
        Отчёты и push приходят автоматически, даже если приложение закрыто.
        Нажмите «Разрешить» в системе Android.
      </p>
      {error && <p className="mt-2 text-sm font-medium text-red-700">{error}</p>}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={handleEnable}
          disabled={loading}
          className="hm-btn rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Подключение..." : "Включить уведомления"}
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="hm-btn px-4 py-2 text-sm text-sky-700"
        >
          Позже
        </button>
      </div>
    </div>
  );
}