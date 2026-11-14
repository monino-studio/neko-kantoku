/* 猫さま監督官 Web Push Service Worker */
self.addEventListener('install', event => { self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil(self.clients.claim()); });
self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; }
  catch (_) { try { data = {body: event.data.text()}; } catch (_) {} }
  const title = data.title || '👑 猫さま監督官';
  const options = {
    body: data.body || data.message || '任務が待っているにゃ！',
    icon: '/icon-v8-192.png', badge: '/icon-v8-192.png',
    tag: data.tag || 'neko-reminder', renotify: true,
    data: {url: (data.url && typeof data.url === 'string') ? data.url : '/'}
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || '/',self.location.origin).href;
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({type:'window',includeUncontrolled:true});
    for (const client of windows) {
      if (client.url.startsWith(self.location.origin) && 'focus' in client) {
        await client.focus(); return;
      }
    }
    if (self.clients.openWindow) await self.clients.openWindow(url);
  })());
});
