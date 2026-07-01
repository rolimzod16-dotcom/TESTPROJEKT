import type { Report } from "@/lib/types";

export type RealisticSensorData = {
  temperature: number;
  humidity: number;
  weight: number;
  soundLevel: number;
  batteryPercent: number;
  scenario: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, decimals = 1) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function noise(scale: number) {
  return (Math.random() - 0.5) * 2 * scale;
}

/** Активность пчёл 0..1 по часу суток (пик днём) */
function diurnalActivity(hour: number) {
  if (hour < 6 || hour > 21) return 0.12 + Math.random() * 0.08;
  if (hour < 9) return 0.35 + Math.random() * 0.15;
  if (hour < 18) {
    const peak = 13;
    const dist = Math.abs(hour - peak);
    return clamp(0.55 + (1 - dist / 8) * 0.4 + noise(0.05), 0.4, 1);
  }
  return 0.25 + Math.random() * 0.15;
}

/** Сезонный коэффициент (северное полушарие) */
function seasonFactor(month: number) {
  if (month >= 5 && month <= 8) return 1;
  if (month === 4 || month === 9) return 0.75;
  if (month === 3 || month === 10) return 0.5;
  return 0.3;
}

type SimInput = {
  now?: Date;
  lastReport: Report | null;
  recentReports: Report[];
};

export function generateRealisticSensorData(input: SimInput): RealisticSensorData {
  const now = input.now ?? new Date();
  const hour = now.getHours();
  const month = now.getMonth() + 1;
  const activity = diurnalActivity(hour);
  const season = seasonFactor(month);

  const last = input.lastReport;
  let scenario = "норма";

  // --- Температура: пчёлы держат расплод ~34.5–35.5°C ---
  const broodTarget = 35 + (activity > 0.6 ? 0.4 : -0.3);
  const ambientBias = month >= 6 && month <= 8 ? (hour >= 11 && hour <= 16 ? 0.3 : -0.1) : -0.4;
  let temperature = last
    ? last.temperature * 0.7 + (broodTarget + ambientBias) * 0.3 + noise(0.15)
    : broodTarget + ambientBias + noise(0.2);
  temperature = clamp(round(temperature, 1), 32, 37);

  // --- Влажность: обратно слабо связана с температурой ---
  let humidity = last
    ? last.humidity * 0.75 + (58 - activity * 8 + (hour < 7 ? 6 : 0)) * 0.25 + noise(1.5)
    : 58 - activity * 6 + noise(2);
  humidity = clamp(round(humidity, 1), 42, 72);

  // --- Вес: медленный рост летом, скачки при взятке ---
  let weight = last?.weight ?? round(22 + Math.random() * 6, 2);
  const baseGain = (0.02 + activity * 0.08) * season;
  let weightDelta = baseGain + noise(0.03);

  const roll = Math.random();
  if (roll < 0.025 * season) {
    weightDelta = -(1.2 + Math.random() * 1.5);
    scenario = "возможный рой (резкое похудение)";
  } else if (roll < 0.06 * season && activity > 0.5) {
    weightDelta = 0.35 + Math.random() * 0.45;
    scenario = "сильная взятка";
  } else if (hour >= 22 || hour <= 5) {
    weightDelta *= 0.2;
    scenario = "ночной покой";
  }

  weight = clamp(round(weight + weightDelta, 2), 14, 48);

  // --- Шум: коррелирует с активностью улья ---
  const baseSound = 36 + activity * 22;
  let soundLevel = last
    ? last.soundLevel * 0.5 + baseSound * 0.5 + noise(1.5)
    : baseSound + noise(2);
  if (scenario.includes("рой")) soundLevel += 8 + Math.random() * 6;
  if (scenario.includes("взятка")) soundLevel += 3 + Math.random() * 4;
  soundLevel = clamp(round(soundLevel, 1), 32, 72);

  // --- Батарея: медленный разряд, днём «солнечная» подзарядка ---
  let battery = last?.batteryPercent ?? round(88 + Math.random() * 12, 0);
  battery -= 0.15 + Math.random() * 0.2;
  if (hour >= 9 && hour <= 17 && battery < 95) {
    battery += 0.3 + Math.random() * 0.5;
  }
  battery = clamp(round(battery, 0), 12, 100);

  return {
    temperature,
    humidity,
    weight,
    soundLevel,
    batteryPercent: battery,
    scenario,
  };
}

/** Человекочитаемый статус улья по показаниям */
export function describeHiveStatus(data: RealisticSensorData) {
  if (data.scenario.includes("рой")) return "⚠️ Резкое снижение веса — проверьте улей";
  if (data.scenario.includes("взятка")) return "🍯 Активная взятка — вес растёт";
  return describeHiveStatusFromReadings(data);
}

export function describeHiveStatusFromReadings(readings: {
  temperature: number;
  humidity: number;
  weight: number;
  soundLevel: number;
  batteryPercent: number;
}) {
  if (readings.temperature < 33) return "❄️ Температура ниже нормы";
  if (readings.temperature > 36.2) return "🌡️ Перегрев — нужна вентиляция";
  if (readings.soundLevel > 60) return "🔊 Высокая активность семьи";
  if (readings.soundLevel < 38) return "😴 Низкая активность (ночь/покой)";
  if (readings.batteryPercent < 25) return "🔋 Низкий заряд ESP32";
  if (readings.humidity > 68) return "💧 Повышенная влажность";
  return "✅ Улей в норме";
}