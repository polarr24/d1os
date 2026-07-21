/* D1 OS service worker — network-first for the app shell so updates appear immediately; cache fallback keeps it working offline. */
const C='d1os-v7-47';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./index.html','./manifest.json'])).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET') return;
  const doc=req.mode==='navigate'||req.destination==='document';
  if(doc){
    // fresh HTML every online load; fall back to the cached shell when offline
    e.respondWith(fetch(req).then(r=>{if(r&&r.ok)caches.open(C).then(c=>c.put('./index.html',r.clone()));return r;}).catch(()=>caches.match('./index.html',{ignoreSearch:true})));
    return;
  }
  // static assets: cache-first for instant, offline-safe loads
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(hit=>hit||fetch(req).then(r=>{if(r&&r.ok)caches.open(C).then(c=>c.put(req,r.clone()));return r;})));
});
