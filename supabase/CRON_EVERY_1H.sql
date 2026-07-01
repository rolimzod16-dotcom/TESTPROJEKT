-- =============================================================================
-- HiveMonitor: отчёты КАЖДЫЙ ЧАС через Supabase pg_cron
-- =============================================================================
-- ЗАПУСТИ в Supabase → SQL Editor → New query → вставь этот файл → Run
--
-- ПЕРЕД ЗАПУСКОМ:
-- 1) Vercel → Project testprojekt-q4af → Settings → Environment Variables
--    Добавь CRON_SECRET = длинная случайная строка (например 48+ символов)
--    Production + Preview + Development
--
-- 2) Замени YOUR_CRON_SECRET ниже на ТОЧНО ТОТ ЖЕ секрет из Vercel
--
-- 3) Supabase → Database → Extensions → включи:
--    - pg_cron
--    - pg_net
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Удалить старые задания (если запускал раньше)
SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname IN ('hive-monitor-reports-2h', 'hive-monitor-reports-1h');

SELECT cron.schedule(
  'hive-monitor-reports-1h',
  '0 * * * *',
  $$
  SELECT net.http_get(
    url := 'https://testprojekt-q4af.vercel.app/api/cron/reports',
    headers := jsonb_build_object(
      'Authorization', 'Bearer YOUR_CRON_SECRET'
    ),
    timeout_milliseconds := 30000
  );
  $$
);

-- Проверка: должна появиться строка hive-monitor-reports-1h
SELECT jobid, jobname, schedule, active
FROM cron.job
WHERE jobname = 'hive-monitor-reports-1h';