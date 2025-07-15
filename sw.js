const CACHE_NAME = 'wheresmyantipode-v1';
const EARTH_IMG = 'https://unpkg.com/three-globe/example/img/earth-night.jpg';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.add(new Request(EARTH_IMG, { mode: 'no-cors' })).catch(err => {
        console.error('Failed to cache earth texture', err);
      })
    )
  );
});

self.addEventListener('fetch', event => {
  if (event.request.url === EARTH_IMG) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(resp => {
          const respClone = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, respClone));
          return resp;
        });
      })
    );
  }
});
