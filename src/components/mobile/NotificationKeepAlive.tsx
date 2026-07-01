"use client";

import { useEffect, useRef } from "react";
import {
  isNativeNotificationsAvailable,
  scheduleReportReminders,
  showNativeReportNotification,
} from "@/lib/native-notifications";

type Props = {
  hiveName?: string;
};

type LatestReport = {
  id: string;
  temperature: number;
  humidity: number;
  weight: number;
};

const POLL_MS = 3 * 60 * 1000;

export function NotificationKeepAlive({ hiveName }: Props) {
  const lastReportId = useRef<string | null>(null);

  useEffect(() => {
    let interval: number | undefined;
    let cancelled = false;

    async function bootstrap() {
      const native = await isNativeNotificationsAvailable();
      if (!native || cancelled) return;

      const status = await import("@/lib/native-notifications").then((m) =>
        m.getNativeNotificationStatus(),
      );
      if (status.permission === "granted") {
        await scheduleReportReminders(hiveName);
      }

      async function pollLatest() {
        try {
          const response = await fetch("/api/reports/latest", {
            credentials: "include",
            cache: "no-store",
          });
          if (!response.ok) return;

          const data = (await response.json()) as { report: LatestReport | null };
          const report = data.report;
          if (!report?.id) return;

          if (lastReportId.current && lastReportId.current !== report.id) {
            await showNativeReportNotification(
              "🐝 Новый отчёт от улья",
              `T: ${report.temperature}°C · ${report.humidity}% · ${report.weight} кг`,
            );
          }

          lastReportId.current = report.id;
        } catch {
          /* ignore network errors */
        }
      }

      await pollLatest();
      interval = window.setInterval(() => {
        void pollLatest();
      }, POLL_MS);
    }

    void bootstrap();

    return () => {
      cancelled = true;
      if (interval) window.clearInterval(interval);
    };
  }, [hiveName]);

  return null;
}