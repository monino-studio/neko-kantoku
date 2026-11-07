const CACHE = 'neko-palace-v7-5';

const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './normal.png',
  './annoyed.png',
  './sad.png',
  './angry.png',
  './happy.png',
  './icon-192.png',
  './icon-512.png',
  './icon-180.png',
  './palace-clean.jpg'
];

// アプリのインストール
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(async cache => {
        // 一部の画像がなくてもインストールを続ける
        await Promise.allSettled(
          ASSETS.map(file => cache.add(file))
        );
      })
      .then(() => self.skipWaiting())
  );
});

// 古いキャッシュを削除
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ホームページの読み込み
self.addEventListener('fetch', event => {
  if (
    event.request.method !== 'GET' ||
    new URL(event.request.url).origin !== self.location.origin
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok) {
          const copy = response.clone();

          event.waitUntil(
            caches.open(CACHE)
              .then(cache => cache.put(event.request, copy))
          );
        }

        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// 猫さまのプッシュ通知を受信
self.addEventListener('push', event => {
  let data = {};

  if (event.data) {
    try {
      data = event.data.json();
    } catch (error) {
      data = {
        body: event.data.text()
      };
    }
  }

  const title = data.title || '🐈 猫さま監督官';

  const options = {
    body: data.body || 'みゆぴ、今日の任務は進んでいるかにゃ？',
    icon: './icon-192.png',
    badge: './icon-192.png',
    tag: data.tag || 'neko-kantoku',
    data: {
      url: './'
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// 通知をタップしたら猫さま監督官を開く
self.addEventListener('notificationclick', event => {
  event.notification.close();

  event.waitUntil(
    (async () => {
      const appUrl = new URL('./', self.registration.scope).href;

      const windows = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      });

      for (const windowClient of windows) {
        if (
          new URL(windowClient.url).origin ===
          new URL(appUrl).origin
        ) {
          await windowClient.focus();
          return;
        }
      }

      if (self.clients.openWindow) {
        await self.clients.openWindow(appUrl);
      }
    })()
  );
});
