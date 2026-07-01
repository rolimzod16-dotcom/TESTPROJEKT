"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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

type DashboardClientProps = {
  userName: string;
  hive: Hive;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function MetricCard({
  label,
  value,
  unit,
  icon,
}: {
  label: string;
  value: string;
  unit: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-amber-200/30 bg-white/70 p-5 shadow-sm backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-stone-600">{label}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-stone-900">
        {value}
        <span className="ml-1 text-base font-medium text-stone-500">{unit}</span>
      </p>
    </div>
  );
}

export function DashboardClient({ userName, hive }: DashboardClientProps) {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>(hive.reports);
  const [liveStatus, setLiveStatus] = useState<"connecting" | "live" | "offline">(
    "connecting",
  );
  const [lastSeenAt, setLastSeenAt] = useState(hive.esp32?.lastSeenAt ?? null);
  const [triggering, setTriggering] = useState(false);

  const latest = reports[0] ?? null;

  const nextReportHint = useMemo(() => {
    if (!latest) return "Первый отчёт скоро появится";
    const nextAt = new Date(latest.createdAt).getTime() + 2 * 60 * 60 * 1000;
    return `Следующий отчёт ~ ${formatDate(new Date(nextAt).toISOString())}`;
  }, [latest]);

  useEffect(() => {
    const source = new EventSource("/api/reports/stream");

    source.addEventListener("connected", () => {
      setLiveStatus("live");
    });

    source.addEventListener("report", (event) => {
      const report = JSON.parse(event.data) as Report;
      setReports((prev) => {
        if (prev.some((item) => item.id === report.id)) return prev;
        return [report, ...prev];
      });
      setLastSeenAt(report.createdAt);
    });

    source.onerror = () => {
      setLiveStatus("offline");
    };

    return () => source.close();
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff7d6,_#f5efe6_45%,_#e8dfd1)]">
      <header className="border-b border-amber-200/40 bg-white/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400 text-xl">
              🐝
            </div>
            <div>
              <p className="text-sm text-stone-600">HiveMonitor</p>
              <h1 className="text-lg font-bold text-stone-900">
                Привет, {userName}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm shadow-sm">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  liveStatus === "live"
                    ? "bg-emerald-500 animate-pulse"
                    : liveStatus === "connecting"
                      ? "bg-amber-400"
                      : "bg-stone-400"
                }`}
              />
              {liveStatus === "live"
                ? "В эфире"
                : liveStatus === "connecting"
                  ? "Подключение..."
                  : "Офлайн"}
            </div>
            <button
              onClick={handleLogout}
              className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <section className="mb-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-amber-200/30 bg-white/75 p-6 shadow-lg backdrop-blur">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-amber-700">
                  Личный улей
                </p>
                <h2 className="mt-1 text-3xl font-bold text-stone-900">
                  {hive.name}
                </h2>
                <p className="mt-2 text-sm text-stone-600">{nextReportHint}</p>
              </div>
              <div className="rounded-2xl bg-amber-100 px-4 py-3 text-center">
                <p className="text-xs uppercase tracking-wide text-amber-800">
                  ESP32
                </p>
                <p className="font-mono text-sm font-bold text-stone-900">
                  {hive.esp32?.deviceId ?? "—"}
                </p>
              </div>
            </div>

            {latest ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <MetricCard
                  label="Температура"
                  value={latest.temperature.toFixed(1)}
                  unit="°C"
                  icon="🌡️"
                />
                <MetricCard
                  label="Влажность"
                  value={latest.humidity.toFixed(1)}
                  unit="%"
                  icon="💧"
                />
                <MetricCard
                  label="Вес улья"
                  value={latest.weight.toFixed(2)}
                  unit="кг"
                  icon="⚖️"
                />
                <MetricCard
                  label="Шум"
                  value={latest.soundLevel.toFixed(1)}
                  unit="дБ"
                  icon="🔊"
                />
                <MetricCard
                  label="Батарея ESP32"
                  value={latest.batteryPercent.toFixed(0)}
                  unit="%"
                  icon="🔋"
                />
                <MetricCard
                  label="Последний отчёт"
                  value={new Intl.DateTimeFormat("ru-RU", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(latest.createdAt))}
                  unit=""
                  icon="📡"
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50/60 px-6 py-10 text-center text-stone-600">
                Ожидаем первый отчёт от симулятора ESP32...
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-amber-200/30 bg-stone-900 p-6 text-stone-100 shadow-lg">
            <p className="text-sm uppercase tracking-wide text-amber-300">
              Устройство
            </p>
            <h3 className="mt-2 text-2xl font-bold">ESP32 Simulator</h3>
            <dl className="mt-6 space-y-4 text-sm">
              <div className="flex justify-between border-b border-white/10 pb-3">
                <dt className="text-stone-400">Статус</dt>
                <dd className="font-medium text-emerald-400">
                  {hive.esp32?.status === "online" ? "Онлайн" : "Офлайн"}
                </dd>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-3">
                <dt className="text-stone-400">Прошивка</dt>
                <dd className="font-mono">{hive.esp32?.firmware ?? "—"}</dd>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-3">
                <dt className="text-stone-400">Последний сигнал</dt>
                <dd>{lastSeenAt ? formatDate(lastSeenAt) : "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone-400">Интервал отчётов</dt>
                <dd>каждые 2 часа</dd>
              </div>
            </dl>
            <button
              onClick={handleTriggerReport}
              disabled={triggering}
              className="mt-6 w-full rounded-2xl bg-amber-400 px-4 py-3 text-sm font-semibold text-stone-900 transition hover:bg-amber-300 disabled:opacity-60"
            >
              {triggering ? "Отправка..." : "Симулировать отчёт сейчас"}
            </button>
            <p className="mt-4 rounded-2xl bg-white/5 p-4 text-sm leading-relaxed text-stone-300">
              Автоотчёты приходят каждые 2 часа. Кнопка выше — для проверки
              real-time без ожидания. Позже сюда подключим реальную прошивку
              ESP32.
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-amber-200/30 bg-white/75 p-6 shadow-lg backdrop-blur">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-stone-900">
                История отчётов
              </h3>
              <p className="text-sm text-stone-600">
                Новые отчёты появляются здесь в реальном времени
              </p>
            </div>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-900">
              {reports.length} шт.
            </span>
          </div>

          <div className="space-y-3">
            {reports.length === 0 ? (
              <p className="text-center text-stone-500">Пока нет отчётов</p>
            ) : (
              reports.map((report) => (
                <article
                  key={report.id}
                  className="grid gap-3 rounded-2xl border border-stone-200/80 bg-white px-4 py-4 md:grid-cols-[180px_1fr]"
                >
                  <div>
                    <p className="font-medium text-stone-900">
                      {formatDate(report.createdAt)}
                    </p>
                    <p className="text-xs text-stone-500">ESP32 → сервер</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-5">
                    <p>
                      <span className="text-stone-500">T:</span>{" "}
                      {report.temperature}°C
                    </p>
                    <p>
                      <span className="text-stone-500">H:</span>{" "}
                      {report.humidity}%
                    </p>
                    <p>
                      <span className="text-stone-500">Вес:</span>{" "}
                      {report.weight} кг
                    </p>
                    <p>
                      <span className="text-stone-500">Шум:</span>{" "}
                      {report.soundLevel} дБ
                    </p>
                    <p>
                      <span className="text-stone-500">Бат:</span>{" "}
                      {report.batteryPercent}%
                    </p>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}