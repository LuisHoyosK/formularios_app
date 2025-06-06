/** 
 * sw.js 
 * Un service worker básico que:
 *  - Cachea el “shell” de nuestra página de respuesta.
 *  - Cachea dinámica la petición a /api/public/formularios/[slug].
 *  - Network-first: si hay conexión, intenta red; si no, sirve de cache.
 */

const CACHE_NAME = "respuestas-shell-v1"; 
const API_CACHE = "respuestas-api-v1";

// Lista de rutas estáticas que queremos cachear durante la instalación.
// IMPORTANTE: ajusta aquí si cambias rutas de CSS/JS que Next inyecte.
const STATIC_FILES = [
  "/responder/",                    // start_url
  "/favicon.ico",                   // si tienes favicon
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  // Estos dos archivos suelen generarse de forma dinámica con Next:
  "/_next/static/chunks/framework.js",
  "/_next/static/chunks/main.js"
  // Si tu build genera otros assets en /_next/static, añádelos también aquí.
];

self.addEventListener("install", (event) => {
  console.log("[SW] Install event");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Cacheamos el “shell”:
      return cache.addAll(STATIC_FILES);
    })
  );
  // Para que el SW se active inmediatamente (skipWaiting).
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Activate event");
  // Limpiar cachés antiguas (si cambiaste CACHE_NAME o API_CACHE en el futuro).
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (![CACHE_NAME, API_CACHE].includes(key)) {
            console.log("[SW] Borrando caché antigua:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 1) Si es petición a /api/public/formularios/[slug], la cacheamos en modo "Network first".
  if (url.pathname.startsWith("/api/public/formularios/")) {
    event.respondWith(
      caches.open(API_CACHE).then((cache) =>
        fetch(req)
          .then((networkRes) => {
            // Clonamos y guardamos en caché la respuesta
            cache.put(req, networkRes.clone());
            return networkRes;
          })
          .catch(() => {
            // Si falla la red, devolvemos la copia cacheada (si existe)
            return cache.match(req);
          })
      )
    );
    return;
  }

  // 2) Para peticiones “navegación” a /responder/[slug] o archivos estáticos, hacemos “Network first” también
  if (
    req.mode === "navigate" ||
    STATIC_FILES.includes(url.pathname)
  ) {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          // Opcional: podemos actualizar el cache con la última versión de la página
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, networkRes.clone());
            return networkRes;
          });
        })
        .catch(() => {
          return caches.match(req).then((cachedRes) => {
            // Si no está en caché, podríamos devolver un fallback (por ejemplo un HTML offline genérico)
            return (
              cachedRes ||
              new Response(
                "<h1>Offline</h1><p>Necesitas internet para ver esta página.</p>",
                { headers: { "Content-Type": "text/html" } }
              )
            );
          });
        })
    );
    return;
  }

  // 3) En cualquier otra petición (imágenes, CSS/JS de terceros, etc), usamos “Cache first”.
  event.respondWith(
    caches.match(req).then((cached) => {
      return (
        cached ||
        fetch(req).then((networkRes) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, networkRes.clone());
            return networkRes;
          });
        })
      );
    })
  );
});
