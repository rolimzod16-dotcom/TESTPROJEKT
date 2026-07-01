import {
  createHiveWithEsp32,
  createReport,
  getAllHives,
  getLastReport,
} from "@/lib/hives";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { publishReport } from "./events";

function randomInRange(min: number, max: number, decimals = 1) {
  const value = min + Math.random() * (max - min);
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function generateDeviceId() {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ESP32-${suffix}`;
}

export function generateSensorData(previousWeight?: number) {
  const weight =
    previousWeight !== undefined
      ? randomInRange(previousWeight - 0.3, previousWeight + 0.5, 2)
      : randomInRange(18, 32, 2);

  return {
    temperature: randomInRange(32, 36, 1),
    humidity: randomInRange(45, 70, 1),
    weight: Math.max(10, weight),
    soundLevel: randomInRange(38, 62, 1),
    batteryPercent: randomInRange(72, 100, 0),
  };
}

export async function provisionHiveForUser(userId: string, userName: string) {
  const hiveName = `Улей ${userName.split(" ")[0]}`;

  return createHiveWithEsp32({
    userId,
    name: hiveName,
    deviceId: generateDeviceId(),
  });
}

export async function createReportForHive(hiveId: string, userId: string) {
  const lastReport = await getLastReport(hiveId);
  const data = generateSensorData(lastReport?.weight);

  const report = await createReport({
    hiveId,
    ...data,
  });

  publishReport(userId, report);
  return report;
}

export async function runSimulatorTick() {
  const hives = await getAllHives();
  const reports = [];

  for (const hive of hives) {
    const report = await createReportForHive(hive.id, hive.user_id);
    reports.push(report);
  }

  return { hives: hives.length, reports: reports.length };
}

let simulatorStarted = false;

export function startSimulator() {
  if (simulatorStarted) return;
  if (process.env.VERCEL === "1") return;

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    console.warn(
      "[simulator] Supabase не настроен — симулятор ESP32 не запущен. Добавь ключи в .env.local",
    );
    return;
  }

  simulatorStarted = true;

  const intervalMs = Number(process.env.REPORT_INTERVAL_MS ?? 7_200_000);

  const tick = async () => {
    try {
      await runSimulatorTick();
    } catch (error) {
      console.error("[simulator] tick failed:", error);
    }
  };

  void tick();
  setInterval(() => {
    void tick();
  }, intervalMs);

  console.log(
    `[simulator] local mode started (interval: ${intervalMs / 1000 / 60} min)`,
  );
}