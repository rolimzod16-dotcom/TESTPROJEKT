"use client";

import { useEffect, useState } from "react";
import {
  enableAllNotifications,
  getNotificationDiagnostics,
} from "@/lib/notification-setup";

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
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(false);
  const [diag, setDiag] = useState<string | null>(null);

  useEffect(() => {
    async function detectSupport() {
      const diagnostics = await getNotificationDiagnostics();
      setSupported(
        diagnostics.native.available || diagnostics.webPushSupported,
      );
      setDiag(
        diagnostics.native.available
          ? `APK · разрешение: ${diagnostics.native.permission}`
          : `Браузер · push: ${diagnostics.webPermission}`,
      );

      if (
        diagnostics.native.permission === "granted" ||
        diagnostics.webPermission === "granted"
      ) {
        setEnabled(true);
      }
    }

    void detectSupport();
  }, []);

  useEffect(() => {
    if (!autoEnable || !supported || loading || attempted) return;

    const timer = window.setTimeout(() => {
      void handleEnable();
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [autoEnable, supported, loading, attempted]);

  async function handleEnable() {
    setAttempted(true);
    setLoading(true);
    setError(null);
    try {
      const result = await enableAllNotifications(hiveName);
      setStatus(result.message);
      setEnabled(
        result.nativeReminders === "scheduled" || result.webPush === "enabled",
      );
      if (
        result.nativeReminders === "denied" ||
        (result.webPush === "denied" &&
          result.nativeReminders !== "scheduled")
      ) {
        setError(result.message);
      }
    } catch {
      setError("Не удалось включить уведомления");
    } finally {
      setLoading(false);
    }
  }

  if (!supported) return null;

  if (enabled && status) {
    return (
      <div className="hm-card mb-4 border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
        <p className="font-bold">Уведомления включены</p>
        <p className="mt-1">{status}</p>
        {diag && <p className="mt-2 text-xs text-emerald-800">{diag}</p>}
        <button
          type="button"
          onClick={handleEnable}
          disabled={loading}
          className="hm-btn mt-3 rounded-xl border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-emerald-900"
        >
          {loading ? "..." : "Проверить снова"}
        </button>
      </div>
    );
  }

  return (
    <div className="hm-card mb-4 border-sky-200 bg-gradient-to-br from-sky-50 to-white p-4">
      <p className="font-bold text-sky-900">Уведомления каждый час</p>
      <p className="mt-1 text-sm text-sky-800">
        В APK нажмите «Включить» и обязательно «Разрешить» в Android. После
        этого придёт тестовое уведомление в шторку.
      </p>
      {diag && <p className="mt-2 text-xs text-sky-700">{diag}</p>}
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
      </div>
    </div>
  );
}