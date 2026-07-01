-- ЗАПУСТИ ОДИН РАЗ в Supabase → SQL Editor → Run
-- Создаёт таблицы для HiveMonitor: пользователи, ульи, ESP32, отчёты

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS esp32_devices CASCADE;
DROP TABLE IF EXISTS hives CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE hives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE esp32_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hive_id UUID NOT NULL UNIQUE REFERENCES hives(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'online',
  last_seen_at TIMESTAMPTZ,
  firmware TEXT NOT NULL DEFAULT 'sim-1.0.0'
);

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hive_id UUID NOT NULL REFERENCES hives(id) ON DELETE CASCADE,
  temperature DOUBLE PRECISION NOT NULL,
  humidity DOUBLE PRECISION NOT NULL,
  weight DOUBLE PRECISION NOT NULL,
  sound_level DOUBLE PRECISION NOT NULL,
  battery_percent DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reports_hive_created ON reports (hive_id, created_at DESC);
CREATE INDEX idx_hives_user_id ON hives (user_id);

-- Realtime: новые отчёты сразу летят на сайт / в приложение
ALTER PUBLICATION supabase_realtime ADD TABLE reports;

SELECT 'HiveMonitor: таблицы созданы. Можно подключать сайт.' AS result;