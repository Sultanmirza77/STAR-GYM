/* =========================================================
   STAR GYM — FINAL SERVICE WORKER
   PWA + OFFLINE + AUTO CACHE UPDATE
========================================================= */

const CACHE_NAME = "star-gym-v4-5";

const APP_FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./assets/icon-192.png",
  "./assets/icon-512.png"
];


/* =========================================================
   INSTALL
========================================================= */

self.addEventListener("install", event => {

  event.waitUntil(

    caches.open(CACHE_NAME)

      .then(cache => {

        return cache.addAll(APP_FILES);

      })

      .then(() => {

        return self.skipWaiting();

      })

  );

});


/* =========================================================
   ACTIVATE
========================================================= */

self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys()

      .then(keys => {

        return Promise.all(

          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))

        );

      })

      .then(() => {

        return self.clients.claim();

      })

  );

});


/* =========================================================
   FETCH
========================================================= */

self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(

    fetch(event.request)

      .then(networkResponse => {

        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type !== "opaque"
        ) {

          const responseClone =
            networkResponse.clone();

          caches.open(CACHE_NAME)
            .then(cache => {

              cache.put(
                event.request,
                responseClone
              );

            });

        }

        return networkResponse;

      })

      .catch(() => {

        return caches.match(
          event.request
        )
        .then(cachedResponse => {

          if (cachedResponse) {

            return cachedResponse;

          }

          /* -----------------------------------------
             OFFLINE PAGE FALLBACK
          ----------------------------------------- */

          if (
            event.request.mode ===
            "navigate"
          ) {

            return caches.match(
              "./index.html"
            );

          }

          return new Response(
            "",
            {
              status: 503,
              statusText: "Offline"
            }
          );

        });

      })

  );

});