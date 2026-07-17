// Service Worker — Producción Diaria Sigma
// v3 - fuerza actualización y prioriza red para el HTML
const CACHE_NAME = 'produccion-sigma-v3';

self.addEventListener('install', (event) => {
  // Activar inmediatamente la versión nueva
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((nombres) =>
      Promise.all(nombres.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Para el HTML y archivos de la app: SIEMPRE intentar red primero (así toma cambios)
  const esNavegacion = event.request.mode === 'navigate' ||
                       url.pathname.endsWith('/') ||
                       url.pathname.endsWith('index.html') ||
                       url.pathname.endsWith('.js') ||
                       url.pathname.endsWith('.json');

  if (esNavegacion) {
    // Red primero, caché como respaldo (solo si no hay internet)
    event.respondWith(
      fetch(event.request)
        .then((resp) => {
          const copia = resp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copia));
          return resp;
        })
        .catch(() => caches.match(event.request).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // Para lo demás (imágenes, etc.): caché primero
  event.respondWith(
    caches.match(event.request).then((cacheado) =>
      cacheado || fetch(event.request).then((resp) => {
        if (resp && resp.status === 200 && resp.type === 'basic') {
          const copia = resp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copia));
        }
        return resp;
      })
    )
  );
});
