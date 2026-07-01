"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { InstallBanner } from "@/components/mobile/InstallBanner";
import { PushNotificationPrompt } from "@/components/mobile/PushNotificationPrompt";
import { MobileShell } from "@/components/mobile/MobileShell";
import { describeHiveStatusFromReadings } from "@/lib/simulator-realistic";
import { REPORT_INTERVAL_MS } from "@/lib/report-schedule";
import { showNativeReportNotification } from "@/lib/native-notifications";

type Report = {
  id: string;
  hiveId: string;
  temperature: number;
  humidity: number;
  weight: number;
  soundLevel: number;
  batteryPercent: number;
  createdAt: string;
};

type Esp32 = {
  id: string;
  deviceId: string;
  status: string;
  lastSeenAt: string | null;
  firmware: string;
};

type Hive = {
  id: string;
  name: string;
  esp32: Esp32 | null;
  reports: Report[];
};

type MobileDashboardProps = {
  userName: string;
  hive: Hive;
};

const TABS = [
  { id: "home", label: "Улей", icon: "🐝" },
  { id: "reports", label: "Отчёты", icon: "📊" },
  { id: "device", label: "ESP32", icon: "📡" },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function MobileDashboard({ userName, hive }: MobileDashboardProps) {
  const router = useRouter();
  const [tab, setTab] = useState("home");
  const [reports, setReports] = useState<Report[]>(hive.reports);
  const [liveStatus, setLiveStatus] = useState<"connecting" | "live" | "offline">(
    "connecting",
  );
  const [lastSeenAt, setLastSeenAt] = useState(hive.esp32?.lastSeenAt ?? null);
  const [triggering, setTriggering] = useState(false);

  const latest = reports[0] ?? null;

  const nextReportHint = useMemo(() => {
    if (!latest) return "Первый отчёт скоро появится";
    const nextAt = new Date(latest.createdAt).getTime() + REPORT_INTERVAL_MS;
    return `Следующий ~ ${formatDate(new Date(nextAt).toISOString())}`;
  }, [latest]);

  useEffect(() => {
    const source = new EventSource("/api/reports/stream");

    source.addEventListener("connected", () => setLiveStatus("live"));
    source.addEventListener("report", (event) => {
      const report = JSON.parse(event.data) as Report;
      setReports((prev) => {
        if (prev.some((item) => item.id === report.id)) return prev;
        return [report, ...prev];
      });
      setLastSeenAt(report.createdAt);
      void showNativeReportNotification(
        "🐝 Новый отчёт от улья",
        `T: ${report.temperature}°C · ${report.humidity}% · ${report.weight} кг`,
      );
    });
    source.onerror = () => setLiveStatus("offline");

    return () => source.close();
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/app");
    router.refresh();
  }

  async function handleTriggerReport() {
    setTriggering(true);
    try {
      await fetch("/api/reports/trigger", { method: "POST" });
    } finally {
      setTriggering(false);
    }
  }

  const liveLabel =
    liveStatus === "live"
      ? "В эфире"
      : liveStatus === "connecting"
        ? "Подключение..."
        : "Офлайн";

  return (
    <MobileShell
      title={hive.name}
      subtitle={`Привет, ${userName}`}
      tabs={TABS}
      activeTab={tab}
      onTabChange={setTab}
    >
      <InstallBanner />
      <PushNotificationPrompt hiveName={hive.name} />

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs shadow-sm">
          <span
            className={`h-2 w-2 rounded-full ${
              liveStatus === "live"
                ? "animate-pulse bg-emerald-500"
                : liveStatus === "connecting"
                  ? "bg-amber-400"
                  : "bg-stone-400"
            }`}
          />
          {liveLabel}
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="text-sm font-medium text-stone-500"
        >
          Выйти
        </button>
      </div>

      {tab === "home" && (
        <div className="space-y-4">
          <div className="hm-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              Личный улей
            </p>
            <p className="mt-1 text-sm text-stone-500">{nextReportHint}</p>
            {latest && (
              <p className="mt-2 text-sm font-medium text-amber-800">
                {describeHiveStatusFromReadings(latest)}
              </p>
            )}
            {latest ? (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  ["🌡️", `${latest.temperature}°C`, "Температура"],
                  ["💧", `${latest.humidity}%`, "Влажность"],
                  ["⚖️", `${latest.weight} кг`, "Вес"],
                  ["🔋", `${latest.batteryPercent}%`, "Батарея"],
                ].map(([icon, value, label]) => (
                  <div
                    key={label}
                    className="rounded-2xl bg-amber-50/80 p-3 text-center"
                  >
                    <p className="text-lg">{icon}</p>
                    <p className="text-lg font-bold text-stone-900">{value}</p>
                    <p className="text-xs text-stone-500">{label}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-center text-sm text-stone-500">
                Ожидаем первый отчёт...
              </p>
            )}
          </div>
        </div>
      )}

      {tab === "reports" && (
        <div className="space-y-3">
          <p className="text-sm text-stone-500">
            {reports.length} отчётов · обновляется в реальном времени
          </p>
          {reports.length === 0 ? (
            <p className="hm-card p-6 text-center text-stone-500">Пока нет отчётов</p>
          ) : (
            reports.map((report) => (
              <article key={report.id} className="hm-card p-4">
                <p className="font-medium text-stone-900">
                  {formatDate(report.createdAt)}
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-stone-600">
                  <p>T: {report.temperature}°C</p>
                  <p>H: {report.humidity}%</p>
                  <p>Вес: {report.weight} кг</p>
                  <p>Шум: {report.soundLevel} дБ</p>
                </div>
              </article>
            ))
          )}
        </div>
      )}

      {tab === "device" && (
        <div className="space-y-4">
          <div className="hm-card bg-stone-900 p-5 text-stone-100">
            <p className="text-xs uppercase tracking-wide text-amber-300">
              ESP32 Simulator
            </p>
            <p className="mt-2 font-mono text-lg font-bold">
              {hive.esp32?.deviceId ?? "—"}
            </p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <dt className="text-stone-400">Статус</dt>
                <dd className="text-emerald-400">
                  {hive.esp32?.status === "online" ? "Онлайн" : "Офлайн"}
                </dd>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <dt className="text-stone-400">Прошивка</dt>
                <dd className="font-mono">{hive.esp32?.firmware ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone-400">Последний сигнал</dt>
                <dd>{lastSeenAt ? formatDate(lastSeenAt) : "—"}</dd>
              </div>
            </dl>
          </div>
          <button
            type="button"
            onClick={handleTriggerReport}
            disabled={triggering}
            className="hm-btn hm-btn-primary w-full py-3 disabled:opacity-60"
          >
            {triggering ? "Отправка..." : "Симулировать отчёт"}
          </button>
          <p className="text-center text-xs text-stone-500">
            Автоотчёты каждый час
          </p>
        </div>
      )}
    </MobileShell>
  );
}