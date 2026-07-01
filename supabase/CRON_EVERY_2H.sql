-- ЗАПУСТИ в Supabase → SQL Editor → Run
-- Отчёты каждые 2 часа (Vercel Hobby cron = только 1 раз в день, поэтому делаем через Supabase)

-- 1) Расширения (если уже включены — просто пропустится)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- 2) Удали старое задание, если перезапускаешь скрипт
SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname = 'hive-monitor-reports-2h';

-- 3) Замени YOUR_CRON_SECRET на тот же CRON_SECRET, что в Vercel → Environment Variables
SELECT cron.schedule(
  'hive-monitor-reports-2h',
  '0 */2 * * *',
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

SELECT 'cron hive-monitor-reports-2h: каждые 2 часа (0 */2 * * *)' AS result;