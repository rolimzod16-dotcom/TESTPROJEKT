import { requireSupabase } from "@/lib/supabase/server";
import {
  mapEsp32,
  mapReport,
  type DbEsp32Device,
  type DbHive,
  type DbReport,
  type DbUser,
  type HiveWithDetails,
  type Report,
  type UserWithHive,
} from "@/lib/types";

export async function findUserByEmail(email: string) {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) throw error;
  return data as DbUser | null;
}

export async function createUser(input: {
  email: string;
  name: string;
  passwordHash: string;
}) {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("users")
    .insert({
      email: input.email,
      name: input.name,
      password_hash: input.passwordHash,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as DbUser;
}

export async function getHiveByUserId(userId: string) {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("hives")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data as DbHive | null;
}

export async function getAllHives() {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("hives")
    .select("id, user_id");

  if (error) throw error;
  return (data ?? []) as Pick<DbHive, "id" | "user_id">[];
}

export async function createHiveWithEsp32(input: {
  userId: string;
  name: string;
  deviceId: string;
}) {
  const supabase = requireSupabase();

  const { data: hive, error: hiveError } = await supabase
    .from("hives")
    .insert({
      user_id: input.userId,
      name: input.name,
    })
    .select("*")
    .single();

  if (hiveError) throw hiveError;

  const { data: esp32, error: esp32Error } = await supabase
    .from("esp32_devices")
    .insert({
      hive_id: hive.id,
      device_id: input.deviceId,
      status: "online",
      last_seen_at: new Date().toISOString(),
      firmware: "sim-1.0.0",
    })
    .select("*")
    .single();

  if (esp32Error) throw esp32Error;

  return {
    hive: hive as DbHive,
    esp32: esp32 as DbEsp32Device,
  };
}

export async function getLastReport(hiveId: string) {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("hive_id", hiveId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ? mapReport(data as DbReport) : null;
}

export async function getRecentReports(hiveId: string, limit = 12) {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("hive_id", hiveId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return ((data ?? []) as DbReport[]).map(mapReport);
}

export async function createReport(input: {
  hiveId: string;
  temperature: number;
  humidity: number;
  weight: number;
  soundLevel: number;
  batteryPercent: number;
}) {
  const supabase = requireSupabase();
  const now = new Date().toISOString();

  const { data: report, error: reportError } = await supabase
    .from("reports")
    .insert({
      hive_id: input.hiveId,
      temperature: input.temperature,
      humidity: input.humidity,
      weight: input.weight,
      sound_level: input.soundLevel,
      battery_percent: input.batteryPercent,
    })
    .select("*")
    .single();

  if (reportError) throw reportError;

  const { error: deviceError } = await supabase
    .from("esp32_devices")
    .update({
      status: "online",
      last_seen_at: now,
    })
    .eq("hive_id", input.hiveId);

  if (deviceError) throw deviceError;

  return mapReport(report as DbReport);
}

export async function getUserWithHive(userId: string): Promise<UserWithHive | null> {
  const supabase = requireSupabase();

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, email, name")
    .eq("id", userId)
    .maybeSingle();

  if (userError) throw userError;
  if (!user) return null;

  const { data: hive, error: hiveError } = await supabase
    .from("hives")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (hiveError) throw hiveError;
  if (!hive) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      hive: null,
    };
  }

  const { data: esp32, error: esp32Error } = await supabase
    .from("esp32_devices")
    .select("*")
    .eq("hive_id", hive.id)
    .maybeSingle();

  if (esp32Error) throw esp32Error;

  const { data: reports, error: reportsError } = await supabase
    .from("reports")
    .select("*")
    .eq("hive_id", hive.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (reportsError) throw reportsError;

  const hiveDetails: HiveWithDetails = {
    id: hive.id,
    name: hive.name,
    esp32: esp32 ? mapEsp32(esp32 as DbEsp32Device) : null,
    reports: ((reports ?? []) as DbReport[]).map(mapReport),
  };

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    hive: hiveDetails,
  };
}

export type { Report };