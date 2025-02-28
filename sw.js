const CACHE_NAME = 'usd-brl-converter-v1';
const ASSETS = [
    '/USDBRL/',
    '/USDBRL/index.html',
    '/USDBRL/style.css',
    '/USDBRL/app.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
}); 