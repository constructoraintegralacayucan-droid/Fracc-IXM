// Service worker mínimo: no cachea nada (el sitio es dinámico y con sesiones),
// solo habilita que el navegador considere el sitio instalable como app.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Passthrough: deja que cada petición vaya normal a la red.
});
