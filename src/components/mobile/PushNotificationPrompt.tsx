"use client";

import { useEffect, useState } from "react";
import {
  isPushSupported,
  subscribeToPushNotifications,
} from "@/lib/push-client";

export function PushNotificationPrompt() {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setSupported(isPushSupported());
    if (typeof Notification !== "undefined") {
      setEnabled(Notification.permission === "granted");
    }
  }, []);

  if (!supported || enabled || dismissed) return null;

  async function handleEnable() {
    setLoading(true);
    try {
      await subscribeToPushNotifications();
      setEnabled(true);
    } catch {
      setDismissed(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="hm-card mb-4 border-sky-200 bg-gradient-to-br from-sky-50 to-white p-4">
      <p className="font-bold text-sky-900">Уведомления каждые 2 часа</p>
      <p className="mt-1 text-sm text-sky-800">
        Каждый пользователь получает push только по своему улью. Нажмите один раз —
        дальше отчёты приходят автоматически, даже если приложение закрыто.
      </p>
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