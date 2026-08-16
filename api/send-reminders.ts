import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

const env = process.env
const appUrl = (env.APP_URL || 'https://ritual-khaki-pi.vercel.app').replace(/\/$/, '')

const localClock = (timeZone: string) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(new Date()).reduce<Record<string, string>>((result, part) => ({ ...result, [part.type]: part.value }), {})
  return { day: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` }
}

export default async function handler(request: any, response: any) {
  if (!env.CRON_SECRET || request.headers.authorization !== `Bearer ${env.CRON_SECRET}`) return response.status(401).json({ error: 'Unauthorized' })
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY || !env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY || !env.VAPID_SUBJECT) {
    return response.status(500).json({ error: 'Missing push configuration' })
  }

  webpush.setVapidDetails(env.VAPID_SUBJECT, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY)
  const admin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
  const [{ data: subscriptions, error: subscriptionsError }, { data: habits, error: habitsError }] = await Promise.all([
    admin.from('push_subscriptions').select('user_id, endpoint, subscription, timezone'),
    admin.from('habits').select('id, user_id, name, minimum_version, reminder_time').eq('archived', false).eq('reminder_enabled', true).not('reminder_time', 'is', null)
  ])
  if (subscriptionsError || habitsError) return response.status(500).json({ error: subscriptionsError?.message || habitsError?.message })

  let sent = 0
  for (const device of subscriptions || []) {
    const clock = localClock(device.timezone || 'UTC')
    for (const habit of (habits || []).filter((item: any) => item.user_id === device.user_id && item.reminder_time.slice(0, 5) === clock.time)) {
      const { data: completed } = await admin.from('habit_events').select('id').eq('habit_id', habit.id).eq('occurred_on', clock.day).eq('status', 'complete').maybeSingle()
      if (completed) continue
      const { error: logError } = await admin.from('push_reminder_log').insert({ habit_id: habit.id, user_id: habit.user_id, endpoint: device.endpoint, scheduled_on: clock.day })
      if (logError) continue // a concurrent scheduler run has already sent today's reminder
      const payload = JSON.stringify({
        title: `A small moment for ${habit.name}`,
        body: `Right now: ${habit.minimum_version || 'choose your tiny step'}. Tiny counts.`,
        habitId: habit.id,
        tag: `ritual-${habit.id}`,
        url: appUrl
      })
      try {
        await webpush.sendNotification(device.subscription, payload, { TTL: 60 * 10 })
        sent += 1
      } catch (error: any) {
        // Expired subscriptions should not be retried indefinitely.
        if (error?.statusCode === 404 || error?.statusCode === 410) await admin.from('push_subscriptions').delete().eq('endpoint', device.endpoint)
      }
    }
  }
  return response.status(200).json({ sent })
}
