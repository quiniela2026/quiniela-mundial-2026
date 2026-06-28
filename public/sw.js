const CACHE = 'quiniela-2026-v1'
const ASSETS = ['/', '/index.html']

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)))
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ))
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return

  const url = new URL(e.request.url)

  // Sólo manejamos peticiones a NUESTRO propio origen (los archivos de la PWA).
  // Cualquier petición a otro dominio (Supabase, OneSignal, CDNs, etc.) la dejamos
  // pasar sin tocar, para no interferir ni devolver respuestas inválidas.
  if (url.origin !== self.location.origin) return

  e.respondWith(
    fetch(e.request)
      .catch(async () => {
        const cached = await caches.match(e.request)
        // Si tampoco está en caché, no inventamos una Response: dejamos que
        // el error de red original se propague en vez de un undefined roto.
        return cached || Response.error()
      })
  )
})
