-- Run this in Supabase: SQL Editor > New query, AFTER the push tables in schema.sql.
-- This invokes the Vercel reminder endpoint every minute without needing Vercel Pro.
-- Replace only the two quoted placeholder values below before running.

select vault.create_secret('https://ritual-khaki-pi.vercel.app', 'ritual_app_url');
select vault.create_secret('PASTE_THE_SAME_RANDOM_CRON_SECRET_USED_IN_VERCEL', 'ritual_cron_secret');

do $$
begin
  if exists (select 1 from cron.job where jobname = 'ritual-send-reminders') then
    perform cron.unschedule('ritual-send-reminders');
  end if;
end $$;

select cron.schedule(
  'ritual-send-reminders',
  '* * * * *',
  $$
    select net.http_post(
      url := (select decrypted_secret from vault.decrypted_secrets where name = 'ritual_app_url') || '/api/send-reminders',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'ritual_cron_secret')
      ),
      body := '{}'::jsonb
    );
  $$
);
