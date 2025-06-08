/****************************************************
 * service-worker.js
 ****************************************************/

const CACHE_NAME = 'math-trainer-v3.01';
const urlsToCache = [
  'index.html',
  'main.css',
  'main.js'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and adding files');
        return cache.addAll(urlsToCache)
          .catch(err => {
            console.error('Error during cache.addAll:', err);
            throw err;
          });
      })
  );
});

// Cache-first strategy with network fallback
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          console.log('Returning cached response for:', event.request.url);
          return response;
        }
        console.log('Fetching from network:', event.request.url);
        return fetch(event.request)
          .then(fetchResponse => {
            if (
              !fetchResponse ||
              fetchResponse.status !== 200 ||
              fetchResponse.type !== 'basic'
            ) {
              console.log('Not caching response:', event.request.url, fetchResponse.status, fetchResponse.type);
              return fetchResponse;
            }
            return caches.open(CACHE_NAME)
              .then(cache => {
                console.log('Adding resource to cache:', event.request.url);
                return cache.put(event.request, fetchResponse.clone())
                  .then(() => fetchResponse)
                  .catch(err => {
                    console.error('Error during cache.put:', event.request.url, err);
                    throw err;
                  });
              });
          })
          .catch(err => {
            console.error('Error during fetch or cache put:', event.request.url, err);
            throw err;
          });
      })
  );
});

// Remove old caches
self.addEventListener('activate', event => {
  const cacheWhiteList = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhiteList.includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
