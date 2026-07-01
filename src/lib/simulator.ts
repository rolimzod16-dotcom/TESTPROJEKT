import {
  createHiveWithEsp32,
  createReport,
  getAllHives,
  getRecentReports,
} from "@/lib/hives";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { publishReport } from "./events";
import { sendReportPush } from "./push-server";
import {
  describeHiveStatus,
  generateRealisticSensorData,
} from "./simulator-realistic";

function generateDeviceId() {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ESP32-${suffix}`;
}

/** @deprecated используй generateRealisticSensorData */
export function generateSensorData(previousWeight?: number) {
  const data = generateRealisticSensorData({
    lastReport: previousWeight
      ? {
          id: "",
          hiveId: "",
          temperature: 35,
          humidity: 58,
          weight: previousWeight,
          soundLevel: 48,
          batteryPercent: 90,
          createdAt: new Date().toISOString(),
        }
      : null,
    recentReports: [],
  });
  return data;
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
  const recentReports = await getRecentReports(hiveId, 12);
  const data = generateRealisticSensorData({
    lastReport: recentReports[0] ?? null,
    recentReports,
  });

  const report = await createReport({
    hiveId,
    temperature: data.temperature,
    humidity: data.humidity,
    weight: data.weight,
    soundLevel: data.soundLevel,
    batteryPercent: data.batteryPercent,
  });

  publishReport(userId, report);
  void sendReportPush(userId, report, data.scenario).catch((err) =>
    console.error("[push] report notify failed:", err),
  );

  if (process.env.NODE_ENV === "development") {
    console.log(
      `[simulator] ${hiveId.slice(0, 8)}… ${data.scenario} — ${describeHiveStatus(data)}`,
    );
  }

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

  const intervalMs = Number(process.env.REPORT_INTERVAL_MS ?? 3_600_000);

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
    `[simulator] realistic mode started (interval: ${intervalMs / 1000 / 60} min)`,
  );
}

export { describeHiveStatus, generateRealisticSensorData };