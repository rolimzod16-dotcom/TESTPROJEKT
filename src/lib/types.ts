export type DbUser = {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  created_at: string;
};

export type DbHive = {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
};

export type DbEsp32Device = {
  id: string;
  hive_id: string;
  device_id: string;
  status: string;
  last_seen_at: string | null;
  firmware: string;
};

export type DbReport = {
  id: string;
  hive_id: string;
  temperature: number;
  humidity: number;
  weight: number;
  sound_level: number;
  battery_percent: number;
  created_at: string;
};

export type Report = {
  id: string;
  hiveId: string;
  temperature: number;
  humidity: number;
  weight: number;
  soundLevel: number;
  batteryPercent: number;
  createdAt: string;
};

export type Esp32Device = {
  id: string;
  hiveId: string;
  deviceId: string;
  status: string;
  lastSeenAt: string | null;
  firmware: string;
};

export type HiveWithDetails = {
  id: string;
  name: string;
  esp32: Esp32Device | null;
  reports: Report[];
};

export type UserWithHive = {
  id: string;
  email: string;
  name: string;
  hive: HiveWithDetails | null;
};

export function mapReport(row: DbReport): Report {
  return {
    id: row.id,
    hiveId: row.hive_id,
    temperature: row.temperature,
    humidity: row.humidity,
    weight: row.weight,
    soundLevel: row.sound_level,
    batteryPercent: row.battery_percent,
    createdAt: row.created_at,
  };
}

export function mapEsp32(row: DbEsp32Device): Esp32Device {
  return {
    id: row.id,
    hiveId: row.hive_id,
    deviceId: row.device_id,
    status: row.status,
    lastSeenAt: row.last_seen_at,
    firmware: row.firmware,
  };
}