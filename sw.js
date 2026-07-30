// Service Worker - 卢梦宁个人工作台
const CACHE_NAME = 'mengning-workbench-v1';
const urlsToCache = [
  '/卢梦宁个人工作台.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// 安装：预缓存核心文件
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('缓存已打开');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// 激活：清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// 请求拦截：缓存优先策略
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // 缓存命中，直接返回
      if (response) return response;
      // 否则走网络
      return fetch(event.request).then(networkResponse => {
        // 缓存新的请求（仅同源）
        if (networkResponse && networkResponse.status === 200 &&
            event.request.url.startsWith(self.location.origin)) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // 网络失败时的离线回退
        return caches.match('/卢梦宁个人工作台.html');
      });
    })
  );
});
