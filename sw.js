/* Explicit same-origin shell cache. No analytics, APIs or athlete records. */
const CACHE='d1os-shell-19.0.0';
const FILES=['./','./index.html','./manifest.webmanifest','./icon.svg','./icon-180.png','./icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
// Leave older caches and all athlete storage intact. Only this release's shell is read.
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;const base=new URL('./',self.location.href),url=new URL(e.request.url),appPage=e.request.mode==='navigate'&&[base.pathname,base.pathname+'index.html'].includes(url.pathname);e.respondWith(caches.open(CACHE).then(c=>c.match(appPage?new URL('./index.html',base).href:e.request)).then(hit=>hit||fetch(e.request)));});

self.addEventListener('message',e=>{if(e.data?.type!=='D1OS_CACHE_STATUS'||!e.ports[0])return;e.waitUntil(caches.open(CACHE).then(async c=>{const hits=await Promise.all(FILES.map(f=>c.match(new URL(f,self.location.href).href)));const html=hits[1]?await hits[1].clone().text():'';e.ports[0].postMessage({version:'19.0.0',ready:hits.every(Boolean)&&html.includes('<title>D1OS 19.0.0</title>')});}));});
