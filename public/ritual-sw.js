self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {}
  const options = {
    body: data.body || 'Your next tiny step is ready.',
    icon: '/ritual-mark.svg',
    badge: '/ritual-mark.svg',
    tag: data.tag || `ritual-${data.habitId || 'reminder'}`,
    requireInteraction: true,
    vibrate: [140, 70, 140],
    actions: data.habitId ? [{ action: 'complete', title: 'Complete' }, { action: 'open', title: 'Open Ritual' }] : [],
    data: { url: data.url || '/', habitId: data.habitId }
  }
  event.waitUntil(self.registration.showNotification(data.title || 'Your Ritual is ready', options))
})

self.addEventListener('notificationclick',event=>{event.notification.close();const data=event.notification.data||{};const complete=event.action==='complete'||(!event.action&&data.habitId);const target=complete&&data.habitId?`${data.url||'/'}?completeHabit=${encodeURIComponent(data.habitId)}`:data.url||'/';event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(openClients=>{for(const client of openClients){if('focus'in client){client.navigate(target);return client.focus()}}return clients.openWindow(target)}))})
