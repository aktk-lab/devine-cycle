// service-worker.js  ← 全文置き換え
const CACHE_NAME = "divine-cycle-v2";   // ← 末尾のバージョン番号を上げると更新が確実
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// 事前キャッシュ
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(console.error)
  );
  self.skipWaiting();
});

// 古いキャッシュの削除
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

// ルーティング：ページ遷移は index.html を返す（PWAでオフラインでも動作）
self.addEventListener("fetch", (e) => {
  // ページ遷移（navigate）は index.html をフォールバック
  if (e.request.mode === "navigate") {
    e.respondWith(
      caches.match("./index.html").then((res) => res || fetch(e.request))
    );
    return;
  }

  // それ以外はキャッシュ優先＋ネット取得＆保存
  e.respondWith(
    caches.match(e.request).then((res) => {
      if (res) return res;
      return fetch(e.request).then((net) => {
        if (
          e.request.method === "GET" &&
          new URL(e.request.url).origin === location.origin
        ) {
          const copy = net.clone();
          caches.open(CACHE_NAME).then((c) => c.put(e.request, copy));
        }
        return net;
      });
    })
  );
});
