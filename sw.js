/* Versioned app shell: matching HTML, CSS and JS are installed atomically. */
const C = "d1os-v12-0";
const SHELL = [
  "./index.html",
  "./performance.css?v=12",
  "./src/curriculum.js?v=12",
  "./src/development.js?v=12",
  "./performance.js?v=12",
  "./manifest.json",
  "./icon-180.png",
  "./icon-512.png",
];
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(C)
      .then((c) => c.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith("d1os-") && k !== C)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});
self.addEventListener("fetch", (e) => {
  const req = e.request,
    u = new URL(req.url);
  if (req.method !== "GET" || u.origin !== self.location.origin) return;
  const relative = u.href.replace(new URL("./", self.location.href).href, "./");
  if (req.mode === "navigate") {
    e.respondWith(
      caches
        .open(C)
        .then((c) => c.match("./index.html"))
        .then((hit) => hit || fetch(req)),
    );
    return;
  }
  if (!SHELL.includes(relative)) return; // Do not cache cloud/auth/API data or arbitrary external requests.
  e.respondWith(
    caches
      .open(C)
      .then((c) => c.match(req))
      .then((hit) => hit || fetch(req)),
  );
});
