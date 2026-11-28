const CACHE_NAME = "civicpulse-shell-v2";
const PRECACHE_URLS = ["/", "/map", "/areas", "/login"];
const SYNC_TAG = "cp-draft-sync";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || req.url.includes("/api/")) return;
  event.respondWith(
    fetch(req).catch(() => caches.match(req).then((cached) => cached || caches.match("/")))
  );
});

// Background Sync — অফলাইনে সেভ করা ড্রাফট নেট এলে auto-notify করে
self.addEventListener("sync", (event) => {
  if (event.tag === SYNC_TAG) {
    event.waitUntil(notifyClientsAboutDrafts());
  }
});

async function notifyClientsAboutDrafts() {
  const clients = await self.clients.matchAll({ type: "window" });
  clients.forEach((client) => {
    client.postMessage({ type: "CP_SYNC_READY", tag: SYNC_TAG });
  });
}

// Push notification handler (future-ready)
self.addEventListener("push", (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification("CivicPulse", {
        body: data.message ?? "নতুন আপডেট আছে",
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        data: { url: data.url ?? "/" },
      })
    );
  } catch {}
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      const existing = clients.find((c) => c.url.includes(self.location.origin));
      if (existing) { existing.focus(); existing.navigate(url); }
      else self.clients.openWindow(url);
    })
  );
});
